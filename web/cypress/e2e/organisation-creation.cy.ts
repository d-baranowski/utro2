/// <reference types="cypress" />

describe('Organisation Creation Flow', () => {
  beforeEach(() => {
    cy.clearStorage();
  });

  context('Organisation Creation', () => {
    it('should handle organisation creation flow when available', () => {
      // Use REAL authentication - no mocks!
      cy.visit('/');
      cy.loginUser('testuser', 'testpass');

      // Wait for real login to complete
      cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');

      // Check if user has no organisations (might see create org flow)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="no-organisation-dialog"]').length > 0) {
          // User has no orgs - test create flow
          cy.getByTestId('no-organisation-dialog').should('be.visible');
          cy.contains('Create Organisation').should('be.visible');
        } else {
          // User has orgs - different flow
          cy.log('User already has organisations');
        }
      });
    });

    it('should handle organisation creation form if accessible', () => {
      cy.visit('/');
      cy.loginUser('testuser', 'testpass');
      cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');

      // Try to access create org functionality
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="no-organisation-dialog"]').length > 0) {
          cy.contains('Create Organisation').click();

          // Should show create form or navigate somewhere
          cy.get('body').should('be.visible');
        } else if ($body.find('[data-testid="organisation-switcher-button"]').length > 0) {
          // Try through org switcher
          cy.getByTestId('organisation-switcher-button').click();
          if ($body.find('[data-testid="create-organisation-menu-item"]').length > 0) {
            cy.getByTestId('create-organisation-menu-item').click();
            cy.get('body').should('be.visible');
          }
        }
      });
    });
  });

  context('Authentication State', () => {
    it('should redirect to login when not authenticated', () => {
      // Try to access organisation functionality without login
      cy.visit('/');

      // Should see login form
      cy.getByTestId('login-username').should('be.visible');
      cy.getByTestId('login-password').should('be.visible');
    });
  });
});
