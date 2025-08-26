/// <reference types="cypress" />

// Database setup and teardown commands for therapist tests
Cypress.Commands.add('setupTherapistTestData', () => {
  // Return mock test data without making actual API call
  return cy.wrap({
    success: true,
    message: 'Mock test data setup'
  });
});

Cypress.Commands.add('cleanupTherapistTestData', () => {
  // Mock cleanup - no actual API call needed for mocked tests
  return cy.wrap({
    success: true,
    message: 'Mock test data cleanup'
  });
});

// Create a test therapist
Cypress.Commands.add('createTestTherapist', (therapistData: any) => {
  // Return mock therapist data
  return cy.wrap({
    ...therapistData,
    id: 'mock-therapist-' + Date.now()
  });
});

// Delete a test therapist
Cypress.Commands.add('deleteTestTherapist', (therapistId: string) => {
  // Mock deletion
  return cy.wrap({
    success: true,
    message: `Mock deleted therapist ${therapistId}`
  });
});

// Setup organization with admin user for therapist management tests
Cypress.Commands.add('setupTherapistAdminContext', () => {
  const testData = {
    adminUser: {
      id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      username: 'therapist_admin',
      email: 'therapist_admin@test.com',
      fullName: 'Therapist Admin',
      password: 'testpass' // Plain text for mocking
    },
    regularUser: {
      id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      username: 'regular_user',
      email: 'regular_user@test.com',
      fullName: 'Regular User',
      password: 'testpass'
    },
    therapistUser: {
      id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
      username: 'therapist_user',
      email: 'therapist_user@test.com',
      fullName: 'Therapist User',
      password: 'testpass'
    },
    organization: {
      id: '44444444-4444-4444-4444-444444444444',
      name: 'Therapist Test Org',
      description: 'Organization for therapist testing'
    }
  };

  // Return test data without making actual API call
  // Tests will use mocked responses instead
  return cy.wrap(testData);
});

declare global {
  namespace Cypress {
    interface Chainable {
      setupTherapistTestData(): Chainable<any>;
      cleanupTherapistTestData(): Chainable<void>;
      createTestTherapist(therapistData: any): Chainable<any>;
      deleteTestTherapist(therapistId: string): Chainable<void>;
      setupTherapistAdminContext(): Chainable<any>;
    }
  }
}