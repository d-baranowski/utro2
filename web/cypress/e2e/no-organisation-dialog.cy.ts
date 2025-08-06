/// <reference types="cypress" />

describe('No Organisation Dialog Flow', () => {
  beforeEach(() => {
    cy.clearStorage();
  });

  context('Dialog Appearance and Basic Functionality', () => {
    beforeEach(() => {
      // Mock successful login with no organisations
      cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
        statusCode: 200,
        body: { token: 'mock-jwt-token' },
      }).as('loginRequest');

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

    it('should automatically appear when user has no organisations', () => {
      cy.getByTestId('no-organisation-dialog').should('be.visible');

      // Should show welcome message
      cy.contains('Welcome! Get Started with an Organisation').should('be.visible');
      cy.contains('You need to be part of an organisation to continue').should('be.visible');
    });

    it('should show tabs for create and search', () => {
      cy.getByTestId('organisation-dialog-tabs').should('be.visible');
      cy.getByTestId('create-tab').should('be.visible');
      cy.getByTestId('search-tab').should('be.visible');

      // Create tab should be active by default
      cy.getByTestId('create-tab').should('have.attr', 'aria-selected', 'true');
      cy.getByTestId('search-tab').should('have.attr', 'aria-selected', 'false');
    });

    it('should switch between tabs correctly', () => {
      // Switch to search tab
      cy.getByTestId('search-tab').click();
      cy.getByTestId('search-tab').should('have.attr', 'aria-selected', 'true');
      cy.getByTestId('create-tab').should('have.attr', 'aria-selected', 'false');

      // Should show search content
      cy.getByTestId('search-organisations-input').should('be.visible');
      cy.getByTestId('search-organisations-button').should('be.visible');

      // Switch back to create tab
      cy.getByTestId('create-tab').click();
      cy.getByTestId('create-tab').should('have.attr', 'aria-selected', 'true');

      // Should show create content
      cy.getByTestId('create-organisation-name').should('be.visible');
      cy.getByTestId('create-organisation-description').should('be.visible');
    });
  });

  context('Create Organisation Tab', () => {
    beforeEach(() => {
      cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
        statusCode: 200,
        body: { token: 'mock-jwt-token' },
      }).as('loginRequest');

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

    it('should show create organisation form fields', () => {
      cy.getByTestId('create-organisation-name').should('be.visible');
      cy.getByTestId('create-organisation-name').should('have.attr', 'required');

      cy.getByTestId('create-organisation-description').should('be.visible');
      cy.getByTestId('create-organisation-description').should('not.have.attr', 'required');

      cy.getByTestId('create-organisation-submit').should('be.visible');
      cy.contains('As the creator, you will automatically become an administrator').should(
        'be.visible'
      );
    });

    it('should validate required fields', () => {
      cy.getByTestId('create-organisation-submit').click();

      cy.contains('Organisation name is required').should('be.visible');
    });

    it('should create organisation with name only', () => {
      cy.fixture('organizations').then((orgs) => {
        cy.intercept(
          'POST',
          '**/com.inspirationparticle.organisation.v1.OrganisationService/CreateOrganisation',
          {
            statusCode: 200,
            body: orgs.newOrganization,
          }
        ).as('createOrganisation');

        cy.intercept(
          'POST',
          '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations',
          {
            statusCode: 200,
            body: { organisations: [orgs.newOrganization.organisation] },
          }
        ).as('getOrganisationsAfterCreate');

        cy.getByTestId('create-organisation-name').type('Test Org Name Only');
        cy.getByTestId('create-organisation-submit').click();

        cy.wait('@createOrganisation');
        cy.wait('@getOrganisationsAfterCreate');

        // Dialog should close
        cy.getByTestId('no-organisation-dialog').should('not.exist');
      });
    });

    it('should create organisation with name and description', () => {
      cy.fixture('organizations').then((orgs) => {
        cy.intercept(
          'POST',
          '**/com.inspirationparticle.organisation.v1.OrganisationService/CreateOrganisation',
          {
            statusCode: 200,
            body: orgs.newOrganization,
          }
        ).as('createOrganisation');

        cy.intercept(
          'POST',
          '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations',
          {
            statusCode: 200,
            body: { organisations: [orgs.newOrganization.organisation] },
          }
        ).as('getOrganisationsAfterCreate');

        cy.getByTestId('create-organisation-name').type('Full Test Org');
        cy.getByTestId('create-organisation-description').type(
          'This is a complete test organisation with description'
        );
        cy.getByTestId('create-organisation-submit').click();

        cy.wait('@createOrganisation');
        cy.wait('@getOrganisationsAfterCreate');

        // Should verify the API was called with correct data
        cy.wait('@createOrganisation').then((interception) => {
          expect(interception.request.body).to.include({
            name: 'Full Test Org',
            description: 'This is a complete test organisation with description',
          });
        });

        cy.getByTestId('no-organisation-dialog').should('not.exist');
      });
    });

    it('should show loading state during creation', () => {
      // Mock slow response
      cy.intercept(
        'POST',
        '**/com.inspirationparticle.organisation.v1.OrganisationService/CreateOrganisation',
        {
          statusCode: 200,
          body: {},
          delay: 1000,
        }
      ).as('createOrganisationSlow');

      cy.getByTestId('create-organisation-name').type('Loading Test Org');
      cy.getByTestId('create-organisation-submit').click();

      // Button should show loading state
      cy.getByTestId('create-organisation-submit').should('be.disabled');
      cy.get('[data-testid="create-organisation-submit"] .MuiCircularProgress-root').should(
        'be.visible'
      );

      // Fields should be disabled during loading
      cy.getByTestId('create-organisation-name').should('be.disabled');
      cy.getByTestId('create-organisation-description').should('be.disabled');
    });

    it('should handle creation errors', () => {
      cy.intercept(
        'POST',
        '**/com.inspirationparticle.organisation.v1.OrganisationService/CreateOrganisation',
        {
          statusCode: 400,
          body: { error: 'Organisation name already exists' },
        }
      ).as('createOrganisationError');

      cy.getByTestId('create-organisation-name').type('Duplicate Org');
      cy.getByTestId('create-organisation-submit').click();

      cy.wait('@createOrganisationError');

      // Should show error message
      cy.contains('Failed to create organisation').should('be.visible');

      // Dialog should remain open
      cy.getByTestId('no-organisation-dialog').should('be.visible');

      // Fields should be re-enabled
      cy.getByTestId('create-organisation-name').should('not.be.disabled');
      cy.getByTestId('create-organisation-submit').should('not.be.disabled');
    });
  });

  context('Search Organisation Tab', () => {
    beforeEach(() => {
      cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
        statusCode: 200,
        body: { token: 'mock-jwt-token' },
      }).as('loginRequest');

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

      // Switch to search tab
      cy.getByTestId('search-tab').click();
    });

    it('should show search form', () => {
      cy.getByTestId('search-organisations-input').should('be.visible');
      cy.getByTestId('search-organisations-button').should('be.visible');
      cy.getByTestId('search-organisations-button').should('contain', 'Search');
    });

    it('should validate search input', () => {
      cy.getByTestId('search-organisations-button').click();

      cy.contains('Please enter a search term').should('be.visible');
    });

    it('should perform search and display results', () => {
      cy.fixture('organizations').then((orgs) => {
        cy.intercept(
          'POST',
          '**/com.inspirationparticle.organisation.v1.OrganisationService/SearchOrganisations',
          {
            statusCode: 200,
            body: orgs.searchResults,
          }
        ).as('searchOrganisations');

        cy.getByTestId('search-organisations-input').type('Search Query');
        cy.getByTestId('search-organisations-button').click();

        cy.wait('@searchOrganisations');

        // Should show results
        cy.contains('Search Result Org').should('be.visible');
        cy.contains('Found organization').should('be.visible');
      });
    });

    it('should handle empty search results', () => {
      cy.intercept(
        'POST',
        '**/com.inspirationparticle.organisation.v1.OrganisationService/SearchOrganisations',
        {
          statusCode: 200,
          body: { organisations: [] },
        }
      ).as('searchOrganisationsEmpty');

      cy.getByTestId('search-organisations-input').type('No Results Query');
      cy.getByTestId('search-organisations-button').click();

      cy.wait('@searchOrganisationsEmpty');

      cy.contains('No organisations found').should('be.visible');
    });

    it('should handle search errors', () => {
      cy.intercept(
        'POST',
        '**/com.inspirationparticle.organisation.v1.OrganisationService/SearchOrganisations',
        {
          statusCode: 500,
          body: { error: 'Internal server error' },
        }
      ).as('searchOrganisationsError');

      cy.getByTestId('search-organisations-input').type('Error Query');
      cy.getByTestId('search-organisations-button').click();

      cy.wait('@searchOrganisationsError');

      cy.contains('Search failed').should('be.visible');
    });

    it('should search when Enter key is pressed', () => {
      cy.fixture('organizations').then((orgs) => {
        cy.intercept(
          'POST',
          '**/com.inspirationparticle.organisation.v1.OrganisationService/SearchOrganisations',
          {
            statusCode: 200,
            body: orgs.searchResults,
          }
        ).as('searchOrganisations');

        cy.getByTestId('search-organisations-input').type('Enter Key Search{enter}');

        cy.wait('@searchOrganisations');
        cy.contains('Search Result Org').should('be.visible');
      });
    });

    it('should show loading state during search', () => {
      cy.intercept(
        'POST',
        '**/com.inspirationparticle.organisation.v1.OrganisationService/SearchOrganisations',
        {
          statusCode: 200,
          body: { organisations: [] },
          delay: 1000,
        }
      ).as('searchOrganisationsSlow');

      cy.getByTestId('search-organisations-input').type('Loading Search');
      cy.getByTestId('search-organisations-button').click();

      // Button should show loading state
      cy.getByTestId('search-organisations-button').should('be.disabled');
      cy.get('[data-testid="search-organisations-button"] .MuiCircularProgress-root').should(
        'be.visible'
      );

      // Input should be disabled during search
      cy.getByTestId('search-organisations-input').should('be.disabled');
    });
  });

  context('Dialog Behavior', () => {
    beforeEach(() => {
      cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
        statusCode: 200,
        body: { token: 'mock-jwt-token' },
      }).as('loginRequest');

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

    it('should clear errors when switching tabs', () => {
      // Create error on create tab
      cy.getByTestId('create-organisation-submit').click();
      cy.contains('Organisation name is required').should('be.visible');

      // Switch to search tab
      cy.getByTestId('search-tab').click();

      // Error should be cleared
      cy.contains('Organisation name is required').should('not.exist');

      // Create error on search tab
      cy.getByTestId('search-organisations-button').click();
      cy.contains('Please enter a search term').should('be.visible');

      // Switch back to create tab
      cy.getByTestId('create-tab').click();

      // Search error should be cleared
      cy.contains('Please enter a search term').should('not.exist');
    });

    it('should not allow closing dialog without creating/joining organisation', () => {
      // The dialog is modal and should not be closeable in this context
      // This is enforced by not passing onClose or having a close button
      cy.get('[data-testid="no-organisation-dialog"] button[aria-label="close"]').should(
        'not.exist'
      );

      // Verify dialog persists
      cy.getByTestId('no-organisation-dialog').should('be.visible');
    });

    it('should maintain form state when switching tabs', () => {
      // Fill create form
      cy.getByTestId('create-organisation-name').type('Test Org');
      cy.getByTestId('create-organisation-description').type('Test Description');

      // Switch to search tab
      cy.getByTestId('search-tab').click();
      cy.getByTestId('search-organisations-input').type('Search Term');

      // Switch back to create tab
      cy.getByTestId('create-tab').click();

      // Values should be preserved
      cy.getByTestId('create-organisation-name').should('have.value', 'Test Org');
      cy.getByTestId('create-organisation-description').should('have.value', 'Test Description');

      // Switch back to search
      cy.getByTestId('search-tab').click();
      cy.getByTestId('search-organisations-input').should('have.value', 'Search Term');
    });
  });
});
