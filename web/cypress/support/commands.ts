/// <reference types="cypress" />

Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

Cypress.Commands.add('findByTestId', (testId: string) => {
  return cy.find(`[data-testid="${testId}"]`);
});

declare global {
  namespace Cypress {
    interface Chainable {
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      findByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}
