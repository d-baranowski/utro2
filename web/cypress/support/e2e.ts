import './commands';

// Hide fetch/XHR requests from command log
Cypress.on('window:before:load', (win) => {
  cy.stub(win.console, 'error').as('consoleError');
});

// Custom command to intercept API calls
Cypress.Commands.add(
  'mockApiCall',
  (method: string, url: string, response: any, statusCode = 200) => {
    cy.intercept(method, url, {
      statusCode,
      body: response,
    });
  }
);

// Command to login user
Cypress.Commands.add('loginUser', (username = 'testuser', password = 'testpass') => {
  cy.visit('/');
  cy.get('[data-testid="login-username"]').type(username);
  cy.get('[data-testid="login-password"]').type(password);
  cy.get('[data-testid="login-submit"]').click();
});

// Command to clear all storage
Cypress.Commands.add('clearStorage', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.clearAllSessionStorage();
});

declare global {
  namespace Cypress {
    interface Chainable {
      mockApiCall(method: string, url: string, response: any, statusCode?: number): Chainable<void>;
      loginUser(username?: string, password?: string): Chainable<void>;
      clearStorage(): Chainable<void>;
    }
  }
}
