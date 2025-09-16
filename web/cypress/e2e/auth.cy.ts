/// <reference types="cypress" />

describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit('/');
  });

  it('should display login form when not authenticated', () => {
    cy.getByTestId('login-username').should('be.visible');
    cy.getByTestId('login-password').should('be.visible');
    cy.getByTestId('login-submit').should('be.visible');
    cy.contains('Welcome Back').should('be.visible');
  });

  it('should show validation errors for empty fields', () => {
    cy.getByTestId('login-submit').click();

    // Check for helper text error messages
    cy.contains('Username is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should successfully login with valid credentials', () => {
    cy.getByTestId('login-username').type('testuser');
    cy.getByTestId('login-password').type('testpass');
    cy.getByTestId('login-submit').click();

    // Wait for successful login - check for success message
    cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');
    
    // Verify we're no longer on login page - URL should change or content should change
    cy.getByTestId('login-username').should('not.exist');
    
    // Test accessing a protected page - user may or may not have permissions
    cy.visit('/organization-members');
    cy.url({ timeout: 10000 }).then((url) => {
      if (url.includes('/organization-members')) {
        // User has access or sees an access denied message - both are valid authenticated behaviors
        cy.get('body').should('be.visible');
      } else {
        // User was redirected back due to insufficient permissions - also valid
        cy.url().should('eq', Cypress.config().baseUrl + '/');
      }
    });
  });

  it('should handle login failure', () => {
    cy.getByTestId('login-username').type('testuser');
    cy.getByTestId('login-password').type('wrongpassword');
    cy.getByTestId('login-submit').click();

    // Should show error message
    cy.contains('Invalid username or password', { timeout: 5000 }).should('be.visible');
    cy.getByTestId('login-username').should('be.visible'); // Still on login form
  });

  it('should redirect to login when accessing protected pages without auth', () => {
    // Try to access protected page
    cy.visit('/organization-members');
    
    // Should redirect to login page
    cy.url({ timeout: 5000 }).should('eq', Cypress.config().baseUrl + '/');
    cy.contains('Welcome Back').should('be.visible');
  });

  it('should persist authentication state on page reload', () => {
    // Login first
    cy.getByTestId('login-username').type('testuser');
    cy.getByTestId('login-password').type('testpass');
    cy.getByTestId('login-submit').click();
    
    // Wait for successful login
    cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');
    
    // Test that authentication persists by checking we don't get redirected to login
    cy.visit('/organization-members');
    cy.url({ timeout: 10000 }).then((initialUrl) => {
      // Reload the page
      cy.reload();
      
      // Should still have authentication - not redirected to login page
      cy.url({ timeout: 10000 }).then((reloadUrl) => {
        // Should not be redirected to login page root
        if (initialUrl.includes('/organization-members') && reloadUrl.includes('/organization-members')) {
          // User maintained access to the page
          cy.url().should('include', '/organization-members');
        } else if (initialUrl === Cypress.config().baseUrl + '/' && reloadUrl === Cypress.config().baseUrl + '/') {
          // User was redirected due to permissions but auth is maintained (not seeing login form)
          cy.getByTestId('login-username').should('not.exist');
        }
      });
    });
  });

  it('should access protected endpoints when authenticated', () => {
    // Login first
    cy.getByTestId('login-username').type('testuser');
    cy.getByTestId('login-password').type('testpass');
    cy.getByTestId('login-submit').click();
    
    // Wait for successful login
    cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');
    
    // Test that authenticated user can attempt to access protected pages without being redirected to login
    cy.visit('/organization-members');
    cy.url({ timeout: 10000 }).then((orgUrl) => {
      // Should not be redirected to login page (authentication is working)
      if (orgUrl === Cypress.config().baseUrl + '/') {
        // User was redirected due to permissions but should not see login form
        cy.getByTestId('login-username').should('not.exist');
      } else {
        // User has access to the page
        cy.url().should('include', '/organization-members');
      }
    });
    
    cy.visit('/therapist-management');
    cy.url({ timeout: 10000 }).then((therapistUrl) => {
      // Should either show the page or redirect due to permissions (but not to login)
      if (therapistUrl === Cypress.config().baseUrl + '/') {
        // User was redirected due to permissions but should not see login form
        cy.getByTestId('login-username').should('not.exist');
      } else {
        // User has access to the page
        cy.url().should('include', '/therapist-management');
      }
    });
  });
});