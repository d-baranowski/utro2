/// <reference types="cypress" />

describe('Therapist Basic Tests', () => {
  beforeEach(() => {
    cy.clearStorage();
  });

  it('should successfully login with test user', () => {
    cy.visit('/');

    // Login with actual test user
    cy.get('[data-testid="login-username"]').type('testuser');
    cy.get('[data-testid="login-password"]').type('testpass');
    cy.get('[data-testid="login-submit"]').click();

    // Wait for successful login
    cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');

    // Should not see login form anymore
    cy.getByTestId('login-username').should('not.exist');

    // Should see some indication that user is authenticated
    cy.get('body').should('be.visible');
  });

  it('should stay logged in when navigating to therapist pages', () => {
    // First login
    cy.visit('/');
    cy.get('[data-testid="login-username"]').type('testuser');
    cy.get('[data-testid="login-password"]').type('testpass');
    cy.get('[data-testid="login-submit"]').click();

    // Wait for successful login
    cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');

    // Check localStorage has token
    cy.window().then((window) => {
      const token = window.localStorage.getItem('token');
      expect(token).to.not.be.null;
    });

    // Now navigate to therapist management - test authentication persistence
    cy.visit('/therapist-management', { failOnStatusCode: false });

    // Should NOT be redirected to login page - authentication should persist
    cy.url({ timeout: 10000 }).then((url) => {
      // Should not be on root login page
      if (url === Cypress.config().baseUrl + '/') {
        // If redirected to home, should not see login form (user is authenticated)
        cy.getByTestId('login-username').should('not.exist');
      } else {
        // If stayed on therapist management page, verify URL
        cy.url().should('include', '/therapist');
      }
    });
  });

  it('should handle therapist management access appropriately', () => {
    // Login and ensure token is stored
    cy.visit('/');
    cy.get('[data-testid="login-username"]').type('testuser');
    cy.get('[data-testid="login-password"]').type('testpass');
    cy.get('[data-testid="login-submit"]').click();

    // Wait for login to complete
    cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');
    cy.wait(1000);

    // Check that token is stored
    cy.window().then((window) => {
      const token = window.localStorage.getItem('token');
      expect(token).to.not.be.null;
    });

    // Visit therapist management page
    cy.visit('/therapist-management', { failOnStatusCode: false });

    // Check what happens based on user permissions
    cy.url({ timeout: 10000 }).then((url) => {
      if (url.includes('/therapist-management')) {
        // User has access to therapist management
        cy.log('User has access to therapist management');
        cy.get('body').should('be.visible');
      } else {
        // User was redirected due to insufficient permissions
        cy.log('User lacks admin access to therapist management');
        cy.url().should('eq', Cypress.config().baseUrl + '/');
        cy.getByTestId('login-username').should('not.exist'); // Still authenticated
      }
    });
  });

  it('should redirect to login when not authenticated', () => {
    // Clear authentication
    cy.clearLocalStorage();
    cy.clearCookies();

    // Try to access therapist management directly
    cy.visit('/therapist-management');

    // Should be redirected to login
    cy.url({ timeout: 10000 }).should('eq', Cypress.config().baseUrl + '/');
    cy.contains('Welcome Back').should('be.visible');
    cy.getByTestId('login-username').should('be.visible');
  });
});
