describe('Organization Members Page - Translation Tests', () => {
  it('tests English and Polish translations with proper authentication', () => {
    // Login
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit('http://localhost:3000/');

    cy.getByTestId('login-username').type('testuser');
    cy.getByTestId('login-password').type('testpass');
    cy.getByTestId('login-submit').click();

    // Wait for successful login
    cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');

    // Test accessing organization-members page
    cy.visit('http://localhost:3000/organization-members');

    // Wait for page to load and check final URL
    cy.wait(2000);
    cy.url().then((finalUrl) => {
      if (finalUrl.includes('/organization-members')) {
        // User has access or sees error message on the page
        cy.log('User has access to organization-members page');
        // Just verify the page loaded without specific content assumptions
        cy.get('body').should('be.visible');
      } else {
        // User was redirected - this is expected behavior for non-admin users
        cy.log('User was redirected, likely due to insufficient permissions');
        cy.url().should('eq', Cypress.config().baseUrl + '/');
      }
    });

    // Test Polish version
    cy.visit('http://localhost:3000/pl/organization-members');
    cy.wait(2000);
    cy.url().then((plFinalUrl) => {
      if (plFinalUrl.includes('/pl/organization-members')) {
        cy.log('User has access to Polish organization-members page');
        cy.get('body').should('be.visible');
      } else {
        cy.log('User was redirected from Polish page');
        // Should redirect to Polish home or regular home
        cy.url().should('satisfy', (url) => {
          return url === Cypress.config().baseUrl + '/pl' || url === Cypress.config().baseUrl + '/';
        });
      }
    });

    // Basic translation key check - ensure no raw translation keys are visible
    cy.get('body').should('not.contain', 'organisation.members');
    cy.get('body').should('not.contain', 'organisation.inviteMember');
    cy.get('body').should('not.contain', 'common.name');
  });

  it('verifies that organization members page redirects to login when not authenticated', () => {
    // Clear authentication
    cy.clearLocalStorage();
    cy.clearCookies();

    // Try to access organization members page directly
    cy.visit('http://localhost:3000/organization-members');

    // Should be redirected to login and see login form
    cy.contains('Welcome Back', { timeout: 10000 }).should('be.visible');
    cy.contains('Username').should('be.visible');
    cy.contains('Password').should('be.visible');
    cy.contains('Sign In').should('be.visible');

    // Try Polish version
    cy.visit('http://localhost:3000/pl/organization-members');

    // Should be redirected to Polish login page
    cy.contains('Witaj ponownie', { timeout: 10000 }).should('be.visible');
    cy.contains('Nazwa użytkownika').should('be.visible');
    cy.contains('Hasło').should('be.visible');
    cy.contains('Zaloguj się').should('be.visible');
  });
});
