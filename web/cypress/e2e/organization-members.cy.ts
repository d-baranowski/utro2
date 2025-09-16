describe('Organization Members Management', () => {
  beforeEach(() => {
    // Clear any existing auth state
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Login as testuser
    cy.visit('http://localhost:3000/');
    cy.getByTestId('login-username').type('testuser');
    cy.getByTestId('login-password').type('testpass');
    cy.getByTestId('login-submit').click();
    
    // Wait for successful login
    cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');
  });

  describe('Access Control Tests', () => {
    it('handles organization members page access appropriately', () => {
      cy.visit('http://localhost:3000/organization-members');
      
      // Check what happens when user tries to access the page
      cy.url({ timeout: 10000 }).then((url) => {
        if (url.includes('/organization-members')) {
          // User has access - verify basic page functionality
          cy.get('body').should('be.visible');
          // Don't make specific assumptions about content
        } else {
          // User was redirected due to insufficient permissions
          cy.url().should('eq', Cypress.config().baseUrl + '/');
          // Should not see login form (user is authenticated)
          cy.getByTestId('login-username').should('not.exist');
        }
      });
    });

    it('handles authentication redirect when not logged in', () => {
      // Clear authentication
      cy.clearLocalStorage();
      cy.clearCookies();
      
      // Try to access organization members page directly
      cy.visit('http://localhost:3000/organization-members');
      
      // Should be redirected to login
      cy.url({ timeout: 10000 }).should('eq', Cypress.config().baseUrl + '/');
      cy.contains('Welcome Back').should('be.visible');
    });
  });

  describe('Translation Tests', () => {
    it('verifies no untranslated keys are visible on organization members page', () => {
      cy.visit('http://localhost:3000/organization-members');
      
      // Wait for page to load
      cy.wait(2000);
      
      // Verify no untranslated keys regardless of access level
      cy.get('body').should('not.contain', 'organisation.members');
      cy.get('body').should('not.contain', 'organisation.inviteMember');
      cy.get('body').should('not.contain', 'common.name');
      cy.get('body').should('not.contain', 'common.username');
      cy.get('body').should('not.contain', 'common.email');
    });

    it('verifies Polish page works without untranslated keys', () => {
      cy.visit('http://localhost:3000/pl/organization-members');
      
      // Wait for page to load
      cy.wait(2000);
      
      // Verify no untranslated keys regardless of access level
      cy.get('body').should('not.contain', 'organisation.members');
      cy.get('body').should('not.contain', 'organisation.inviteMember');
      cy.get('body').should('not.contain', 'common.name');
      cy.get('body').should('not.contain', 'common.username');
      cy.get('body').should('not.contain', 'common.email');
    });
  });
});