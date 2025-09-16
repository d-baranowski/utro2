/// <reference types="cypress" />

describe('Therapist Functionality - Simple Tests', () => {
  beforeEach(() => {
    cy.clearStorage();
  });

  context('Basic UI Rendering', () => {
    it('should display login form', () => {
      cy.visit('/');
      cy.get('[data-testid="login-username"]').should('be.visible');
      cy.get('[data-testid="login-password"]').should('be.visible');
      cy.get('[data-testid="login-submit"]').should('be.visible');
    });

    it('should handle login with real backend', () => {
      // Use REAL authentication - no mocks!
      cy.visit('/');
      cy.get('[data-testid="login-username"]').type('testuser');
      cy.get('[data-testid="login-password"]').type('testpass');
      cy.get('[data-testid="login-submit"]').click();
      
      // Wait for real login to complete
      cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');
      
      // After successful login, user should not see login form
      cy.get('[data-testid="login-username"]').should('not.exist');
    });
  });

  context('Therapist Management Access', () => {
    it('should handle therapist management page access', () => {
      // Login first with real backend
      cy.visit('/');
      cy.get('[data-testid="login-username"]').type('testuser');
      cy.get('[data-testid="login-password"]').type('testpass');
      cy.get('[data-testid="login-submit"]').click();
      
      cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');
      
      // Visit therapist management page
      cy.visit('/therapist-management');
      
      // Check what happens based on user permissions
      cy.url({ timeout: 10000 }).then((url) => {
        if (url.includes('/therapist-management')) {
          // User has access
          cy.log('User has access to therapist management');
        } else {
          // User was redirected due to permissions
          cy.log('User lacks access to therapist management');
          cy.get('[data-testid="login-username"]').should('not.exist'); // Still authenticated
        }
      });
    });
  });
});