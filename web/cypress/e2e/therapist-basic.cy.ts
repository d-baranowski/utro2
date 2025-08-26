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
    
    // Should redirect after successful login
    cy.url().should('not.include', '/login');
    
    // Should see some indication that login was successful
    cy.contains('Test Organisation').should('be.visible');
  });

  it('should stay logged in when navigating to therapist pages', () => {
    // First login
    cy.visit('/');
    cy.get('[data-testid="login-username"]').type('testuser');
    cy.get('[data-testid="login-password"]').type('testpass');
    cy.get('[data-testid="login-submit"]').click();
    
    // Wait for successful login
    cy.url().should('not.include', '/login');
    cy.contains('Test Organisation').should('be.visible');
    
    // Check localStorage has token
    cy.window().then((window) => {
      const token = window.localStorage.getItem('token');
      expect(token).to.not.be.null;
    });
    
    // Now navigate to therapist management - should not redirect back to login
    cy.visit('/therapist-management', { failOnStatusCode: false });
    
    // Should NOT be on login page
    cy.url().should('not.include', '/login');
    cy.url().should('include', '/therapist');
  });

  it('should show therapist management to admin users', () => {
    // Login and set token in localStorage directly to avoid redirect issues
    cy.visit('/');
    cy.get('[data-testid="login-username"]').type('testuser');
    cy.get('[data-testid="login-password"]').type('testpass');
    cy.get('[data-testid="login-submit"]').click();
    
    // Wait for login to complete and redirect
    cy.url().should('not.include', '/login');
    cy.contains('Test Organisation').should('be.visible');
    
    // Wait a bit more to ensure the token is stored
    cy.wait(1000);
    
    // Check that token is stored
    cy.window().then((window) => {
      const token = window.localStorage.getItem('token');
      expect(token).to.not.be.null;
    });
    
    // Visit therapist management page
    cy.visit('/therapist-management', { failOnStatusCode: false });
    
    // Check URL - should not redirect to login
    cy.url().should('include', '/therapist-management');
  });
});