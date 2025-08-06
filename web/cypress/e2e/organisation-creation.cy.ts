/// <reference types="cypress" />

describe('Organisation Creation Flow', () => {
  beforeEach(() => {
    cy.clearStorage();
  });

  context('User with no organisations', () => {
    beforeEach(() => {
      // Mock successful login
      cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
        statusCode: 200,
        body: { token: 'mock-jwt-token' },
      }).as('loginRequest');

      // Mock empty organisations response
      cy.intercept(
        'POST',
        '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations',
        {
          statusCode: 200,
          body: { organisations: [] },
        }
      ).as('getOrganisations');

      cy.visit('/');
      cy.loginUser();
      cy.wait('@loginRequest');
      cy.wait('@getOrganisations');
    });

    it('should automatically show no organisation dialog', () => {
      cy.getByTestId('no-organisation-dialog').should('be.visible');
      cy.getByTestId('organisation-dialog-tabs').should('be.visible');
      cy.getByTestId('create-tab').should('have.attr', 'aria-selected', 'true');
    });

    it('should show validation error for empty organisation name', () => {
      cy.getByTestId('create-organisation-submit').click();

      // Should show error for required field
      cy.contains('Organisation name is required').should('be.visible');
    });

    it('should successfully create new organisation', () => {
      cy.fixture('organizations').then((orgs) => {
        // Mock create organisation API
        cy.intercept(
          'POST',
          '**/com.inspirationparticle.organisation.v1.OrganisationService/CreateOrganisation',
          {
            statusCode: 200,
            body: orgs.newOrganization,
          }
        ).as('createOrganisation');

        // Mock updated organisations list after creation
        cy.intercept(
          'POST',
          '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations',
          {
            statusCode: 200,
            body: { organisations: [orgs.newOrganization.organisation] },
          }
        ).as('getOrganisationsAfterCreate');

        // Fill in organisation details
        cy.getByTestId('create-organisation-name').type('New Test Org');
        cy.getByTestId('create-organisation-description').type('Test organization description');
        cy.getByTestId('create-organisation-submit').click();

        cy.wait('@createOrganisation');
        cy.wait('@getOrganisationsAfterCreate');

        // Dialog should close
        cy.getByTestId('no-organisation-dialog').should('not.exist');

        // Should show organisation switcher
        cy.getByTestId('organisation-switcher-button').should('be.visible');
        cy.getByTestId('organisation-switcher-button').should('contain', 'New Test Org');
      });
    });

    it('should handle organisation creation failure', () => {
      // Mock failed creation
      cy.intercept(
        'POST',
        '**/com.inspirationparticle.organisation.v1.OrganisationService/CreateOrganisation',
        {
          statusCode: 400,
          body: { error: 'Organisation already exists' },
        }
      ).as('createOrganisationFailed');

      cy.getByTestId('create-organisation-name').type('Existing Org');
      cy.getByTestId('create-organisation-description').type('This should fail');
      cy.getByTestId('create-organisation-submit').click();

      cy.wait('@createOrganisationFailed');

      // Should show error message
      cy.contains('Failed to create organisation').should('be.visible');

      // Dialog should still be open
      cy.getByTestId('no-organisation-dialog').should('be.visible');
    });

    it('should switch to search tab and search for organisations', () => {
      cy.fixture('organizations').then((orgs) => {
        // Mock search API
        cy.intercept(
          'POST',
          '**/com.inspirationparticle.organisation.v1.OrganisationService/SearchOrganisations',
          {
            statusCode: 200,
            body: orgs.searchResults,
          }
        ).as('searchOrganisations');

        // Switch to search tab
        cy.getByTestId('search-tab').click();
        cy.getByTestId('search-tab').should('have.attr', 'aria-selected', 'true');

        // Search for organisations
        cy.getByTestId('search-organisations-input').type('Search Result');
        cy.getByTestId('search-organisations-button').click();

        cy.wait('@searchOrganisations');

        // Should show search results
        cy.contains('Search Result Org').should('be.visible');
        cy.contains('Found organization').should('be.visible');
      });
    });

    it('should handle empty search results', () => {
      // Mock empty search results
      cy.intercept(
        'POST',
        '**/com.inspirationparticle.organisation.v1.OrganisationService/SearchOrganisations',
        {
          statusCode: 200,
          body: { organisations: [] },
        }
      ).as('searchOrganisationsEmpty');

      cy.getByTestId('search-tab').click();
      cy.getByTestId('search-organisations-input').type('Nonexistent Org');
      cy.getByTestId('search-organisations-button').click();

      cy.wait('@searchOrganisationsEmpty');

      // Should show no results message
      cy.contains('No organisations found').should('be.visible');
    });

    it('should handle search failure', () => {
      // Mock search failure
      cy.intercept(
        'POST',
        '**/com.inspirationparticle.organisation.v1.OrganisationService/SearchOrganisations',
        {
          statusCode: 500,
          body: { error: 'Search failed' },
        }
      ).as('searchOrganisationsFailed');

      cy.getByTestId('search-tab').click();
      cy.getByTestId('search-organisations-input').type('Error Test');
      cy.getByTestId('search-organisations-button').click();

      cy.wait('@searchOrganisationsFailed');

      // Should show error message
      cy.contains('Search failed').should('be.visible');
    });

    it('should allow searching by pressing Enter key', () => {
      cy.fixture('organizations').then((orgs) => {
        cy.intercept(
          'POST',
          '**/com.inspirationparticle.organisation.v1.OrganisationService/SearchOrganisations',
          {
            statusCode: 200,
            body: orgs.searchResults,
          }
        ).as('searchOrganisations');

        cy.getByTestId('search-tab').click();
        cy.getByTestId('search-organisations-input').type('Search Result{enter}');

        cy.wait('@searchOrganisations');

        cy.contains('Search Result Org').should('be.visible');
      });
    });
  });

  context('User with existing organisations', () => {
    beforeEach(() => {
      cy.fixture('organizations').then((orgs) => {
        // Mock successful login
        cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
          statusCode: 200,
          body: { token: 'mock-jwt-token' },
        }).as('loginRequest');

        // Mock organisations response with existing orgs
        cy.intercept(
          'POST',
          '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations',
          {
            statusCode: 200,
            body: orgs.withOrganizations,
          }
        ).as('getOrganisations');

        cy.visit('/');
        cy.loginUser();
        cy.wait('@loginRequest');
        cy.wait('@getOrganisations');
      });
    });

    it('should not show no organisation dialog', () => {
      cy.getByTestId('no-organisation-dialog').should('not.exist');
      cy.getByTestId('organisation-switcher-button').should('be.visible');
    });

    it('should create new organisation from switcher menu', () => {
      cy.fixture('organizations').then((orgs) => {
        // Mock create organisation API
        cy.intercept(
          'POST',
          '**/com.inspirationparticle.organisation.v1.OrganisationService/CreateOrganisation',
          {
            statusCode: 200,
            body: orgs.newOrganization,
          }
        ).as('createOrganisation');

        // Mock updated organisations list
        const updatedOrgs = {
          organisations: [
            ...orgs.withOrganizations.organisations,
            orgs.newOrganization.organisation,
          ],
        };
        cy.intercept(
          'POST',
          '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations',
          {
            statusCode: 200,
            body: updatedOrgs,
          }
        ).as('getOrganisationsAfterCreate');

        // Open organisation switcher and create new org
        cy.getByTestId('organisation-switcher-button').click();
        cy.getByTestId('create-organisation-menu-item').click();

        // Dialog should appear
        cy.getByTestId('no-organisation-dialog').should('be.visible');

        // Create organisation
        cy.getByTestId('create-organisation-name').type('New Test Org');
        cy.getByTestId('create-organisation-submit').click();

        cy.wait('@createOrganisation');
        cy.wait('@getOrganisationsAfterCreate');

        // Dialog should close and switcher should show new org
        cy.getByTestId('no-organisation-dialog').should('not.exist');
        cy.getByTestId('organisation-switcher-button').should('be.visible');
      });
    });
  });
});
