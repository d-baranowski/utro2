/// <reference types="cypress" />

describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearStorage();
    cy.visit('/');
  });

  it('should display login form when not authenticated', () => {
    cy.getByTestId('login-username').should('be.visible');
    cy.getByTestId('login-password').should('be.visible');
    cy.getByTestId('login-submit').should('be.visible');
  });

  it('should show validation errors for empty fields', () => {
    cy.getByTestId('login-submit').click();

    // Check for helper text error messages
    cy.contains('Username is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should successfully login with valid credentials', () => {
    cy.setupUniqueUser('login_success').then((userCreds) => {
      cy.getByTestId('login-username').type(userCreds.username);
      cy.getByTestId('login-password').type(userCreds.password);
      cy.getByTestId('login-submit').click();

      // Should show success message and dashboard (using real API)
      cy.getByTestId('login-success-alert', { timeout: 10000 }).should('be.visible');
      cy.getByTestId('logout-button').should('be.visible');
      
      // Should show no organisation dialog since user is new
      cy.getByTestId('no-organisation-dialog', { timeout: 5000 }).should('be.visible');
      
      // Cleanup
      cy.then(() => {
        cy.deleteTestUser(userCreds.username);
      });
    });
  });

  it('should handle login failure', () => {
    cy.setupUniqueUser('login_failure').then((userCreds) => {
      cy.getByTestId('login-username').type(userCreds.username);
      cy.getByTestId('login-password').type('wrongpass');
      cy.getByTestId('login-submit').click();

      // Should show error message
      cy.contains('Invalid username or password').should('be.visible');
      cy.getByTestId('login-username').should('be.visible'); // Still on login form
      
      // Cleanup
      cy.then(() => {
        cy.deleteTestUser(userCreds.username);
      });
    });
  });

  it('should logout successfully', () => {
    cy.setupUniqueUser('logout_test').then((userCreds) => {
      // Login first
      cy.loginUser(userCreds.username, userCreds.password);
      cy.getByTestId('login-success-alert', { timeout: 10000 }).should('be.visible');

      // Logout
      cy.getByTestId('logout-button').click();

      // Should return to login form
      cy.getByTestId('login-username').should('be.visible');
      cy.getByTestId('login-password').should('be.visible');
      
      // Cleanup
      cy.then(() => {
        cy.deleteTestUser(userCreds.username);
      });
    });
  });

  it('should persist authentication state on page reload', () => {
    cy.setupUniqueUser('reload_test').then((userCreds) => {
      // Login first
      cy.loginUser(userCreds.username, userCreds.password);
      cy.getByTestId('login-success-alert', { timeout: 10000 }).should('be.visible');

      // Reload page
      cy.reload();

      // Should still be logged in
      cy.getByTestId('logout-button', { timeout: 10000 }).should('be.visible');
      cy.getByTestId('login-success-alert').should('be.visible');
      
      // Cleanup
      cy.then(() => {
        cy.deleteTestUser(userCreds.username);
      });
    });
  });

  it('should call protected endpoint successfully', () => {
    cy.setupUniqueUser('endpoint_test').then((userCreds) => {
      // Login first
      cy.loginUser(userCreds.username, userCreds.password);
      cy.getByTestId('login-success-alert', { timeout: 10000 }).should('be.visible');

      // Call secret endpoint
      cy.getByTestId('call-secret-button').click();

      // Should show response (the endpoint should return some response)
      cy.getByTestId('secret-response', { timeout: 10000 }).should('be.visible');
      
      // Cleanup
      cy.then(() => {
        cy.deleteTestUser(userCreds.username);
      });
    });
  });
});
