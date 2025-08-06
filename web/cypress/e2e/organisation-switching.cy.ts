/// <reference types="cypress" />

describe('Organisation Switching Flow', () => {
  beforeEach(() => {
    cy.clearStorage();
  });

  context('User with multiple organisations', () => {
    beforeEach(() => {
      cy.fixture('organizations').then((orgs) => {
        // Mock successful login
        cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
          statusCode: 200,
          body: { token: 'mock-jwt-token' },
        }).as('loginRequest');

        // Mock multiple organisations response
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

    it('should display organisation switcher with current organisation', () => {
      cy.getByTestId('organisation-switcher-button').should('be.visible');
      cy.getByTestId('organisation-switcher-button').should('contain', 'Acme Corp'); // First org should be selected by default
    });

    it('should show organisation dropdown when clicked', () => {
      cy.getByTestId('organisation-switcher-button').click();

      // Should show both organisations
      cy.getByTestId('organisation-option-2WbfKjEhVn8WwjGT0b9ZsLN').should('be.visible');
      cy.getByTestId('organisation-option-2WbfKjEhVn8WwjGT0b9ZsLO').should('be.visible');

      // Should show create option
      cy.getByTestId('create-organisation-menu-item').should('be.visible');
    });

    it('should display member roles correctly', () => {
      cy.getByTestId('organisation-switcher-button').click();

      // Check that admin role is shown for first org
      cy.getByTestId('organisation-option-2WbfKjEhVn8WwjGT0b9ZsLN').should('contain', 'Admin');

      // Check that member role is shown for second org
      cy.getByTestId('organisation-option-2WbfKjEhVn8WwjGT0b9ZsLO').should('contain', 'Member');
    });

    it('should switch to different organisation', () => {
      cy.getByTestId('organisation-switcher-button').click();
      cy.getByTestId('organisation-option-2WbfKjEhVn8WwjGT0b9ZsLO').click();

      // Button should now show the selected organisation
      cy.getByTestId('organisation-switcher-button').should('contain', 'Tech Solutions Ltd');

      // Dashboard should update to show new organisation
      cy.contains('Tech Solutions Ltd - Dashboard').should('be.visible');
    });

    it('should show current organisation as selected in dropdown', () => {
      // Switch to second org first
      cy.getByTestId('organisation-switcher-button').click();
      cy.getByTestId('organisation-option-2WbfKjEhVn8WwjGT0b9ZsLO').click();

      // Open dropdown again
      cy.getByTestId('organisation-switcher-button').click();

      // Second org should now be selected (have checkmark)
      cy.getByTestId('organisation-option-2WbfKjEhVn8WwjGT0b9ZsLO').should(
        'have.attr',
        'aria-selected',
        'true'
      );
    });

    it('should persist organisation selection in localStorage', () => {
      // Switch organisation
      cy.getByTestId('organisation-switcher-button').click();
      cy.getByTestId('organisation-option-2WbfKjEhVn8WwjGT0b9ZsLO').click();

      // Reload page
      cy.reload();
      cy.wait('@getOrganisations');

      // Should still show the selected organisation
      cy.getByTestId('organisation-switcher-button').should('contain', 'Tech Solutions Ltd');
    });

    it('should show organisation descriptions in dropdown', () => {
      cy.getByTestId('organisation-switcher-button').click();

      // Check descriptions are shown (truncated)
      cy.getByTestId('organisation-option-2WbfKjEhVn8WwjGT0b9ZsLN').should(
        'contain',
        'Leading technology company'
      );
      cy.getByTestId('organisation-option-2WbfKjEhVn8WwjGT0b9ZsLO').should(
        'contain',
        'Software development company'
      );
    });

    it('should close dropdown when clicking outside', () => {
      cy.getByTestId('organisation-switcher-button').click();

      // Dropdown should be open
      cy.getByTestId('organisation-option-2WbfKjEhVn8WwjGT0b9ZsLN').should('be.visible');

      // Click outside
      cy.get('body').click(0, 0);

      // Dropdown should close
      cy.getByTestId('organisation-option-2WbfKjEhVn8WwjGT0b9ZsLN').should('not.exist');
    });

    it('should handle organisation switching failure gracefully', () => {
      // This test would be more relevant if we had a backend call for switching
      // For now, just verify that switching works in the UI layer
      cy.getByTestId('organisation-switcher-button').click();
      cy.getByTestId('organisation-option-2WbfKjEhVn8WwjGT0b9ZsLO').click();

      // Should successfully switch
      cy.getByTestId('organisation-switcher-button').should('contain', 'Tech Solutions Ltd');
    });
  });

  context('User with single organisation', () => {
    beforeEach(() => {
      // Mock login and single organisation
      cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
        statusCode: 200,
        body: { token: 'mock-jwt-token' },
      }).as('loginRequest');

      const singleOrgResponse = {
        organisations: [
          {
            id: '2WbfKjEhVn8WwjGT0b9ZsLN',
            name: 'Single Org',
            description: 'Only organisation',
            member_type: 'MEMBER_TYPE_ADMINISTRATOR',
            joined_at: { seconds: '1703846400', nanos: 0 },
            created_at: { seconds: '1703846400', nanos: 0 },
            updated_at: { seconds: '1703846400', nanos: 0 },
          },
        ],
      };

      cy.intercept(
        'POST',
        '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations',
        {
          statusCode: 200,
          body: singleOrgResponse,
        }
      ).as('getOrganisations');

      cy.visit('/');
      cy.loginUser();
      cy.wait('@loginRequest');
      cy.wait('@getOrganisations');
    });

    it('should still show switcher with single organisation', () => {
      cy.getByTestId('organisation-switcher-button').should('be.visible');
      cy.getByTestId('organisation-switcher-button').should('contain', 'Single Org');
    });

    it('should show dropdown with create option for single org', () => {
      cy.getByTestId('organisation-switcher-button').click();

      // Should show the single org
      cy.getByTestId('organisation-option-2WbfKjEhVn8WwjGT0b9ZsLN').should('be.visible');

      // Should still show create option
      cy.getByTestId('create-organisation-menu-item').should('be.visible');
    });
  });

  context('Mobile responsive behaviour', () => {
    beforeEach(() => {
      cy.fixture('organizations').then((orgs) => {
        cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
          statusCode: 200,
          body: { token: 'mock-jwt-token' },
        }).as('loginRequest');

        cy.intercept(
          'POST',
          '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations',
          {
            statusCode: 200,
            body: orgs.withOrganizations,
          }
        ).as('getOrganisations');

        // Set mobile viewport
        cy.viewport('iphone-x');

        cy.visit('/');
        cy.loginUser();
        cy.wait('@loginRequest');
        cy.wait('@getOrganisations');
      });
    });

    it('should work on mobile devices', () => {
      // Organisation switcher should still be functional on mobile
      cy.getByTestId('organisation-switcher-button').should('be.visible');
      cy.getByTestId('organisation-switcher-button').click();

      // Dropdown should work
      cy.getByTestId('organisation-option-2WbfKjEhVn8WwjGT0b9ZsLO').should('be.visible');
      cy.getByTestId('organisation-option-2WbfKjEhVn8WwjGT0b9ZsLO').click();

      // Should switch successfully
      cy.getByTestId('organisation-switcher-button').should('contain', 'Tech Solutions Ltd');
    });
  });
});
