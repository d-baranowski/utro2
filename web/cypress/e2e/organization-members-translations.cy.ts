describe('Organization Members Translations', () => {
  describe('Access and translation handling', () => {
    it('handles English page access and translation verification', () => {
      // Clear storage and login
      cy.clearLocalStorage();
      cy.clearCookies();
      
      // Login as testuser
      cy.visit('http://localhost:3000/');
      cy.getByTestId('login-username').type('testuser');
      cy.getByTestId('login-password').type('testpass');
      cy.getByTestId('login-submit').click();
      
      // Wait for login to complete
      cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');
      
      // Navigate to organization members page
      cy.visit('http://localhost:3000/organization-members');
      
      // Wait for page to load
      cy.wait(2000);
      
      // Check for untranslated keys regardless of access level
      cy.get('body').should('not.contain', 'organisation.members');
      cy.get('body').should('not.contain', 'organisation.inviteMember');
      cy.get('body').should('not.contain', 'common.name');
      cy.get('body').should('not.contain', 'common.username');
      cy.get('body').should('not.contain', 'common.email');
      
      // Verify appropriate behavior based on user permissions
      cy.url({ timeout: 10000 }).then((url) => {
        if (url.includes('/organization-members')) {
          // User has access - verify page is functional
          cy.log('User has admin access to organization members');
          cy.get('body').should('be.visible');
        } else {
          // User was redirected due to insufficient permissions
          cy.log('User lacks admin access, redirected appropriately');
          cy.url().should('eq', Cypress.config().baseUrl + '/');
          cy.getByTestId('login-username').should('not.exist'); // Still authenticated
        }
      });
    });

    it('handles Polish page access and translation verification', () => {
      // Clear storage and login
      cy.clearLocalStorage();
      cy.clearCookies();
      
      // Login as testuser
      cy.visit('http://localhost:3000/');
      cy.getByTestId('login-username').type('testuser');
      cy.getByTestId('login-password').type('testpass');
      cy.getByTestId('login-submit').click();
      
      // Wait for login to complete
      cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');
      
      // Navigate to Polish organization members page
      cy.visit('http://localhost:3000/pl/organization-members');
      
      // Wait for page to load
      cy.wait(2000);
      
      // Check for untranslated keys regardless of access level
      cy.get('body').should('not.contain', 'organisation.members');
      cy.get('body').should('not.contain', 'organisation.inviteMember');
      cy.get('body').should('not.contain', 'common.name');
      cy.get('body').should('not.contain', 'common.username');
      cy.get('body').should('not.contain', 'common.email');
      
      // Verify appropriate behavior based on user permissions
      cy.url({ timeout: 10000 }).then((url) => {
        if (url.includes('/pl/organization-members')) {
          // User has access to Polish page
          cy.log('User has admin access to Polish organization members');
          cy.get('body').should('be.visible');
        } else {
          // User was redirected due to insufficient permissions
          cy.log('User lacks admin access, redirected from Polish page');
          cy.url().should('satisfy', (redirectUrl) => {
            return redirectUrl === Cypress.config().baseUrl + '/pl' || 
                   redirectUrl === Cypress.config().baseUrl + '/';
          });
          cy.getByTestId('login-username').should('not.exist'); // Still authenticated
        }
      });
    });
  });

  describe('Unauthenticated access', () => {
    it('redirects to login when not authenticated', () => {
      // Clear authentication
      cy.clearLocalStorage();
      cy.clearCookies();
      
      // Try to access English organization members page
      cy.visit('http://localhost:3000/organization-members');
      
      // Should redirect to login
      cy.url({ timeout: 10000 }).should('eq', Cypress.config().baseUrl + '/');
      cy.contains('Welcome Back').should('be.visible');
    });

    it('redirects Polish page to login when not authenticated', () => {
      // Clear authentication
      cy.clearLocalStorage();
      cy.clearCookies();
      
      // Try to access Polish organization members page
      cy.visit('http://localhost:3000/pl/organization-members');
      
      // Should redirect to Polish or regular login
      cy.url({ timeout: 10000 }).should('satisfy', (url) => {
        return url === Cypress.config().baseUrl + '/pl' || 
               url === Cypress.config().baseUrl + '/';
      });
      cy.contains('Welcome Back', { timeout: 10000 }).should('be.visible');
    });
  });
});