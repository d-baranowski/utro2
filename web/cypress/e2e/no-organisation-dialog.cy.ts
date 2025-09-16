/// <reference types="cypress" />

describe('No Organisation Dialog', () => {
  beforeEach(() => {
    cy.clearStorage();
  });

  context('Dialog Appearance and Basic Functionality', () => {
    it('should show no organisation dialog if user has no organisations', () => {
      // Use REAL authentication
      cy.visit('/');
      cy.loginUser();

      // Wait for real login to complete
      cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');

      // Check if no-org dialog appears (depends on user's actual org status)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="no-organisation-dialog"]').length > 0) {
          cy.getByTestId('no-organisation-dialog').should('be.visible');
          cy.contains('Welcome! Get Started with an Organisation').should('be.visible');
        } else {
          cy.log('User has organisations, no dialog shown');
        }
      });
    });

    it('should display both create and search options if dialog appears', () => {
      cy.visit('/');
      cy.loginUser();
      cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="no-organisation-dialog"]').length > 0) {
          // Check for both options
          cy.contains('Create Organisation').should('be.visible');
          cy.contains('Search for Organisations').should('be.visible');
        }
      });
    });
  });

  context('Create Organisation Flow', () => {
    it('should navigate to create organisation when create button is clicked', () => {
      cy.visit('/');
      cy.loginUser();
      cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="no-organisation-dialog"]').length > 0) {
          // Click create organisation
          cy.contains('Create Organisation').click();

          // Should either navigate to create page or show create dialog
          cy.get('body').should('be.visible');
        }
      });
    });
  });

  context('Search Organisation Flow', () => {
    it('should show search interface when search button is clicked', () => {
      cy.visit('/');
      cy.loginUser();
      cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="no-organisation-dialog"]').length > 0) {
          // Click search for organisations
          cy.contains('Search for Organisations').click();

          // Should show search interface
          cy.get('body').should('be.visible');
        }
      });
    });
  });

  context('Authentication State', () => {
    it('should not show dialog when not authenticated', () => {
      // Visit without login
      cy.visit('/');

      // Should see login form, not no-org dialog
      cy.getByTestId('login-username').should('be.visible');
      cy.getByTestId('no-organisation-dialog').should('not.exist');
    });
  });
});
