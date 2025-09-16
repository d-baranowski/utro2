/// <reference types="cypress" />

// Database setup and teardown commands for offer E2E tests (no mocking)
Cypress.Commands.add('setupOfferTestData', () => {
  const testData = {
    adminUser: {
      id: 'offer-admin-user-id',
      username: 'offer_admin',
      email: 'offer_admin@test.com',
      fullName: 'Offer Admin User',
      password: 'offerpass123'
    },
    regularUser: {
      id: 'offer-regular-user-id', 
      username: 'offer_user',
      email: 'offer_user@test.com',
      fullName: 'Regular Offer User',
      password: 'userpass123'
    },
    organization: {
      id: 'offer-test-org-id',
      name: 'Offer Test Organization',
      description: 'Organization for offer E2E testing'
    }
  };

  // Execute SQL to setup test data
  return cy.task('db:seed', {
    sql: `
      -- Clean up existing offer test data
      DELETE FROM offer WHERE organisation_id IN (
        SELECT id FROM organisation WHERE name = '${testData.organization.name}'
      );
      DELETE FROM organisation_member WHERE user_id IN (
        SELECT id FROM "user" WHERE username IN ('${testData.adminUser.username}', '${testData.regularUser.username}')
      );
      DELETE FROM "user" WHERE username IN ('${testData.adminUser.username}', '${testData.regularUser.username}');
      DELETE FROM organisation WHERE name = '${testData.organization.name}';

      -- Create test organization
      INSERT INTO organisation (id, name, description, created_at, updated_at) VALUES
      ('${testData.organization.id}'::uuid, '${testData.organization.name}', '${testData.organization.description}', NOW(), NOW());

      -- Create test users with BCrypt hashed passwords
      -- offerpass123 -> $2b$12$rQHrxLqJOe8kFJ6yhZWKJe5vGQqQK5QEcFQSWPvZVY8KQx9Ej1J4G
      -- userpass123 -> $2b$12$HGHzUMQeXLU2GvCvSR2iHOXzBkJqHD2k5VZF8TH3LWqKlDGj5KLcS
      INSERT INTO "user" (id, username, email, full_name, provider, password, created_at, updated_at) VALUES
      ('${testData.adminUser.id}'::uuid, '${testData.adminUser.username}', '${testData.adminUser.email}', '${testData.adminUser.fullName}', 'local', '$2b$12$rQHrxLqJOe8kFJ6yhZWKJe5vGQqQK5QEcFQSWPvZVY8KQx9Ej1J4G', NOW(), NOW()),
      ('${testData.regularUser.id}'::uuid, '${testData.regularUser.username}', '${testData.regularUser.email}', '${testData.regularUser.fullName}', 'local', '$2b$12$HGHzUMQeXLU2GvCvSR2iHOXzBkJqHD2k5VZF8TH3LWqKlDGj5KLcS', NOW(), NOW());

      -- Create organisation memberships
      INSERT INTO organisation_member (user_id, organisation_id, member_type, joined_at) VALUES
      ('${testData.adminUser.id}'::uuid, '${testData.organization.id}'::uuid, 'ADMINISTRATOR', NOW()),
      ('${testData.regularUser.id}'::uuid, '${testData.organization.id}'::uuid, 'MEMBER', NOW());
    `
  }).then(() => {
    return testData;
  });
});

Cypress.Commands.add('cleanupOfferTestData', () => {
  return cy.task('db:seed', {
    sql: `
      -- Clean up offer test data
      DELETE FROM offer WHERE organisation_id IN (
        SELECT id FROM organisation WHERE name LIKE '%Offer Test%'
      );
      DELETE FROM organisation_member WHERE user_id IN (
        SELECT id FROM "user" WHERE username LIKE 'offer_%'
      );
      DELETE FROM "user" WHERE username LIKE 'offer_%';
      DELETE FROM organisation WHERE name LIKE '%Offer Test%';
    `
  });
});

// Create a test offer via API
Cypress.Commands.add('createTestOffer', (offerData: any) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/com.inspirationparticle.utro.gen.v1.OfferService/CreateOffer`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${window.localStorage.getItem('authToken')}`
    },
    body: {
      organisationId: offerData.organisationId,
      nameEng: offerData.nameEng,
      namePl: offerData.namePl,
      descriptionEng: offerData.descriptionEng,
      descriptionPl: offerData.descriptionPl
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    return response.body;
  });
});

// Delete a test offer via API
Cypress.Commands.add('deleteTestOffer', (offerId: string) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/com.inspirationparticle.utro.gen.v1.OfferService/DeleteOffer`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${window.localStorage.getItem('authToken')}`
    },
    body: {
      id: offerId
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    return response.body;
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      setupOfferTestData(): Chainable<any>;
      cleanupOfferTestData(): Chainable<void>;
      createTestOffer(offerData: any): Chainable<any>;
      deleteTestOffer(offerId: string): Chainable<void>;
    }
  }
}