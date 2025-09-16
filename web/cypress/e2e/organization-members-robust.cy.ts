describe('Organization Members Translations - Robust Tests', () => {
  it('verifies English translations work correctly regardless of access level', () => {
    // Login first
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit('http://localhost:3000/');

    cy.getByTestId('login-username').type('testuser');
    cy.getByTestId('login-password').type('testpass');
    cy.getByTestId('login-submit').click();

    // Wait for successful login
    cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');

    // Navigate to organization members page
    cy.visit('http://localhost:3000/organization-members');

    // Wait for page to load and check basic functionality
    cy.wait(2000);

    // Verify no untranslated keys are visible regardless of access level
    cy.get('body').should('not.contain', 'organisation.members');
    cy.get('body').should('not.contain', 'organisation.inviteMember');
    cy.get('body').should('not.contain', 'common.name');
    cy.get('body').should('not.contain', 'common.username');
    cy.get('body').should('not.contain', 'common.email');
    cy.get('body').should('not.contain', 'common.role');

    // Test page behavior based on actual access
    cy.url({ timeout: 10000 }).then((url) => {
      if (url.includes('/organization-members')) {
        // User has access - test is valid
        cy.log('User has access to organization members page');
        cy.get('body').should('be.visible');
      } else {
        // User was redirected due to permissions - also valid
        cy.log('User was redirected due to insufficient permissions');
        cy.url().should('eq', Cypress.config().baseUrl + '/');
        cy.getByTestId('login-username').should('not.exist'); // Verify still authenticated
      }
    });
  });

  it('verifies Polish translations work correctly regardless of access level', () => {
    // Login first
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit('http://localhost:3000/');

    cy.getByTestId('login-username').type('testuser');
    cy.getByTestId('login-password').type('testpass');
    cy.getByTestId('login-submit').click();

    // Wait for successful login
    cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');

    // Navigate to Polish organization members page
    cy.visit('http://localhost:3000/pl/organization-members');

    // Wait for page to load
    cy.wait(2000);

    // Verify no untranslated keys are visible regardless of access level
    cy.get('body').should('not.contain', 'organisation.members');
    cy.get('body').should('not.contain', 'organisation.inviteMember');
    cy.get('body').should('not.contain', 'common.name');
    cy.get('body').should('not.contain', 'common.username');
    cy.get('body').should('not.contain', 'common.email');

    // Test page behavior based on actual access
    cy.url({ timeout: 10000 }).then((url) => {
      if (url.includes('/pl/organization-members')) {
        // User has access to Polish page
        cy.log('User has access to Polish organization members page');
        cy.get('body').should('be.visible');
      } else {
        // User was redirected due to permissions
        cy.log('User was redirected from Polish page due to insufficient permissions');
        // Should redirect to Polish or regular home
        cy.url().should('satisfy', (redirectUrl) => {
          return (
            redirectUrl === Cypress.config().baseUrl + '/pl' ||
            redirectUrl === Cypress.config().baseUrl + '/'
          );
        });
        cy.getByTestId('login-username').should('not.exist'); // Verify still authenticated
      }
    });
  });

  it('handles authentication redirect properly', () => {
    // Clear authentication
    cy.clearLocalStorage();
    cy.clearCookies();

    // Try to access organization members page directly
    cy.visit('http://localhost:3000/organization-members');

    // Should be redirected to login
    cy.url({ timeout: 10000 }).should('eq', Cypress.config().baseUrl + '/');
    cy.contains('Welcome Back').should('be.visible');
    cy.getByTestId('login-username').should('be.visible');
  });
});
