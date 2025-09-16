/// <reference types="cypress" />

Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

Cypress.Commands.add('findByTestId', (testId: string) => {
  return cy.find(`[data-testid="${testId}"]`);
});

Cypress.Commands.add('loginUser', (username = 'testuser', password = 'testpass') => {
  cy.getByTestId('login-username').type(username);
  cy.getByTestId('login-password').type(password);
  cy.getByTestId('login-submit').click();
});

Cypress.Commands.add('clearStorage', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
});

// Create a unique test user
Cypress.Commands.add('createTestUser', (baseUsername?: string) => {
  const timestamp = Date.now();
  const username = baseUsername ? `${baseUsername}_${timestamp}` : `testuser_${timestamp}`;
  const password = 'testpass123';
  
  // Return mock user data without actual API call since test endpoint doesn't exist
  return cy.wrap({ username, password });
});

// Delete a test user
Cypress.Commands.add('deleteTestUser', (username: string) => {
  // Mock deletion - no actual API call
  return cy.wrap({ success: true });
});

// Create user and store credentials in test context
Cypress.Commands.add('setupUniqueUser', (baseUsername?: string) => {
  return cy.createTestUser(baseUsername).then((userCreds) => {
    // Store credentials for later use in test
    return cy.wrap(userCreds).as('userCreds').then(() => userCreds);
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      findByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      loginUser(username?: string, password?: string): Chainable<void>;
      clearStorage(): Chainable<void>;
      createTestUser(baseUsername?: string): Chainable<{username: string, password: string}>;
      deleteTestUser(username: string): Chainable<void>;
      setupUniqueUser(baseUsername?: string): Chainable<{username: string, password: string}>;
    }
  }
}
