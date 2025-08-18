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
  
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/test/users`,
    body: {
      username,
      password,
      email: `${username}@test.com`
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    return { username, password };
  });
});

// Delete a test user
Cypress.Commands.add('deleteTestUser', (username: string) => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/api/test/users/${username}`,
    failOnStatusCode: false // Don't fail if user doesn't exist
  });
});

// Create user and store credentials in test context
Cypress.Commands.add('setupUniqueUser', (baseUsername?: string) => {
  return cy.createTestUser(baseUsername).then((userCreds) => {
    // Store credentials for later use in test
    cy.wrap(userCreds).as('userCreds');
    return userCreds;
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
