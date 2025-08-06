/// <reference types="cypress" />

describe('End-to-End Organisation Flow Integration', () => {
  beforeEach(() => {
    cy.clearStorage();
  });

  it('should complete full user journey: login → create organisation → switch organisations → logout', () => {
    cy.fixture('organizations').then((orgs) => {
      // Step 1: Login
      cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
        statusCode: 200,
        body: { token: 'mock-jwt-token' },
      }).as('loginRequest');

      cy.intercept(
        'POST',
        '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations',
        {
          statusCode: 200,
          body: { organisations: [] },
        }
      ).as('getOrganisationsEmpty');

      cy.visit('/');
      cy.loginUser('testuser', 'testpass');
      cy.wait('@loginRequest');
      cy.wait('@getOrganisationsEmpty');

      // Step 2: Should see no organisation dialog
      cy.getByTestId('no-organisation-dialog').should('be.visible');
      cy.contains('Welcome! Get Started with an Organisation').should('be.visible');

      // Step 3: Create first organisation
      cy.intercept(
        'POST',
        '**/com.inspirationparticle.organisation.v1.OrganisationService/CreateOrganisation',
        {
          statusCode: 200,
          body: {
            organisation: {
              id: 'first-org-id',
              name: 'My First Org',
              description: 'First organisation created',
              member_type: 'MEMBER_TYPE_ADMINISTRATOR',
              joined_at: { seconds: '1703846400', nanos: 0 },
              created_at: { seconds: '1703846400', nanos: 0 },
              updated_at: { seconds: '1703846400', nanos: 0 },
            },
          },
        }
      ).as('createFirstOrg');

      cy.intercept(
        'POST',
        '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations',
        {
          statusCode: 200,
          body: {
            organisations: [
              {
                id: 'first-org-id',
                name: 'My First Org',
                description: 'First organisation created',
                member_type: 'MEMBER_TYPE_ADMINISTRATOR',
                joined_at: { seconds: '1703846400', nanos: 0 },
                created_at: { seconds: '1703846400', nanos: 0 },
                updated_at: { seconds: '1703846400', nanos: 0 },
              },
            ],
          },
        }
      ).as('getOrganisationsWithFirst');

      cy.getByTestId('create-organisation-name').type('My First Org');
      cy.getByTestId('create-organisation-description').type('First organisation created');
      cy.getByTestId('create-organisation-submit').click();

      cy.wait('@createFirstOrg');
      cy.wait('@getOrganisationsWithFirst');

      // Step 4: Dialog should close, switcher should appear
      cy.getByTestId('no-organisation-dialog').should('not.exist');
      cy.getByTestId('organisation-switcher-button').should('be.visible');
      cy.getByTestId('organisation-switcher-button').should('contain', 'My First Org');
      cy.contains('My First Org - Dashboard').should('be.visible');

      // Step 5: Create second organisation via switcher
      cy.intercept(
        'POST',
        '**/com.inspirationparticle.organisation.v1.OrganisationService/CreateOrganisation',
        {
          statusCode: 200,
          body: {
            organisation: {
              id: 'second-org-id',
              name: 'Second Company',
              description: 'Another organisation',
              member_type: 'MEMBER_TYPE_ADMINISTRATOR',
              joined_at: { seconds: '1703846500', nanos: 0 },
              created_at: { seconds: '1703846500', nanos: 0 },
              updated_at: { seconds: '1703846500', nanos: 0 },
            },
          },
        }
      ).as('createSecondOrg');

      cy.intercept(
        'POST',
        '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations',
        {
          statusCode: 200,
          body: {
            organisations: [
              {
                id: 'first-org-id',
                name: 'My First Org',
                description: 'First organisation created',
                member_type: 'MEMBER_TYPE_ADMINISTRATOR',
                joined_at: { seconds: '1703846400', nanos: 0 },
                created_at: { seconds: '1703846400', nanos: 0 },
                updated_at: { seconds: '1703846400', nanos: 0 },
              },
              {
                id: 'second-org-id',
                name: 'Second Company',
                description: 'Another organisation',
                member_type: 'MEMBER_TYPE_ADMINISTRATOR',
                joined_at: { seconds: '1703846500', nanos: 0 },
                created_at: { seconds: '1703846500', nanos: 0 },
                updated_at: { seconds: '1703846500', nanos: 0 },
              },
            ],
          },
        }
      ).as('getOrganisationsWithBoth');

      cy.getByTestId('organisation-switcher-button').click();
      cy.getByTestId('create-organisation-menu-item').click();

      cy.getByTestId('no-organisation-dialog').should('be.visible');
      cy.getByTestId('create-organisation-name').type('Second Company');
      cy.getByTestId('create-organisation-description').type('Another organisation');
      cy.getByTestId('create-organisation-submit').click();

      cy.wait('@createSecondOrg');
      cy.wait('@getOrganisationsWithBoth');

      // Step 6: Should now have two organisations, test switching
      cy.getByTestId('no-organisation-dialog').should('not.exist');
      cy.getByTestId('organisation-switcher-button').should('be.visible');

      cy.getByTestId('organisation-switcher-button').click();
      cy.getByTestId('organisation-option-first-org-id').should('be.visible');
      cy.getByTestId('organisation-option-second-org-id').should('be.visible');

      // Switch to first organisation
      cy.getByTestId('organisation-option-first-org-id').click();
      cy.getByTestId('organisation-switcher-button').should('contain', 'My First Org');
      cy.contains('My First Org - Dashboard').should('be.visible');

      // Switch back to second organisation
      cy.getByTestId('organisation-switcher-button').click();
      cy.getByTestId('organisation-option-second-org-id').click();
      cy.getByTestId('organisation-switcher-button').should('contain', 'Second Company');
      cy.contains('Second Company - Dashboard').should('be.visible');

      // Step 7: Test persistence across page reload
      cy.reload();
      cy.wait('@getOrganisationsWithBoth');

      // Should still show Second Company as selected
      cy.getByTestId('organisation-switcher-button').should('contain', 'Second Company');

      // Step 8: Logout
      cy.getByTestId('logout-button').click();

      // Should return to login screen
      cy.getByTestId('login-username').should('be.visible');
      cy.getByTestId('login-password').should('be.visible');
      cy.getByTestId('organisation-switcher-button').should('not.exist');
    });
  });

  it('should handle complex search and organisation selection flow', () => {
    // Login with no organisations
    cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
      statusCode: 200,
      body: { token: 'mock-jwt-token' },
    }).as('loginRequest');

    cy.intercept(
      'POST',
      '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations',
      {
        statusCode: 200,
        body: { organisations: [] },
      }
    ).as('getOrganisationsEmpty');

    cy.visit('/');
    cy.loginUser();
    cy.wait('@loginRequest');
    cy.wait('@getOrganisationsEmpty');

    // Go to search tab
    cy.getByTestId('search-tab').click();

    // First search with no results
    cy.intercept(
      'POST',
      '**/com.inspirationparticle.organisation.v1.OrganisationService/SearchOrganisations',
      {
        statusCode: 200,
        body: { organisations: [] },
      }
    ).as('searchEmpty');

    cy.getByTestId('search-organisations-input').type('nonexistent');
    cy.getByTestId('search-organisations-button').click();
    cy.wait('@searchEmpty');
    cy.contains('No organisations found').should('be.visible');

    // Second search with results
    cy.intercept(
      'POST',
      '**/com.inspirationparticle.organisation.v1.OrganisationService/SearchOrganisations',
      {
        statusCode: 200,
        body: {
          organisations: [
            {
              id: 'search-result-1',
              name: 'Searchable Org 1',
              description: 'First search result',
              created_at: { seconds: '1703846400', nanos: 0 },
              updated_at: { seconds: '1703846400', nanos: 0 },
            },
            {
              id: 'search-result-2',
              name: 'Searchable Org 2',
              description: 'Second search result',
              created_at: { seconds: '1703846400', nanos: 0 },
              updated_at: { seconds: '1703846400', nanos: 0 },
            },
          ],
        },
      }
    ).as('searchWithResults');

    cy.getByTestId('search-organisations-input').clear().type('searchable');
    cy.getByTestId('search-organisations-button').click();
    cy.wait('@searchWithResults');

    // Should show results
    cy.contains('Searchable Org 1').should('be.visible');
    cy.contains('Searchable Org 2').should('be.visible');
    cy.contains('First search result').should('be.visible');

    // Switch back to create tab and create organisation
    cy.getByTestId('create-tab').click();

    cy.intercept(
      'POST',
      '**/com.inspirationparticle.organisation.v1.OrganisationService/CreateOrganisation',
      {
        statusCode: 200,
        body: {
          organisation: {
            id: 'created-after-search',
            name: 'Created After Search',
            description: 'Organisation created after searching',
            member_type: 'MEMBER_TYPE_ADMINISTRATOR',
            joined_at: { seconds: '1703846600', nanos: 0 },
            created_at: { seconds: '1703846600', nanos: 0 },
            updated_at: { seconds: '1703846600', nanos: 0 },
          },
        },
      }
    ).as('createAfterSearch');

    cy.intercept(
      'POST',
      '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations',
      {
        statusCode: 200,
        body: {
          organisations: [
            {
              id: 'created-after-search',
              name: 'Created After Search',
              description: 'Organisation created after searching',
              member_type: 'MEMBER_TYPE_ADMINISTRATOR',
              joined_at: { seconds: '1703846600', nanos: 0 },
              created_at: { seconds: '1703846600', nanos: 0 },
              updated_at: { seconds: '1703846600', nanos: 0 },
            },
          ],
        },
      }
    ).as('getOrganisationsAfterCreate');

    cy.getByTestId('create-organisation-name').type('Created After Search');
    cy.getByTestId('create-organisation-description').type('Organisation created after searching');
    cy.getByTestId('create-organisation-submit').click();

    cy.wait('@createAfterSearch');
    cy.wait('@getOrganisationsAfterCreate');

    // Should successfully complete the flow
    cy.getByTestId('no-organisation-dialog').should('not.exist');
    cy.getByTestId('organisation-switcher-button').should('contain', 'Created After Search');
  });

  it('should handle error recovery scenarios', () => {
    // Login
    cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
      statusCode: 200,
      body: { token: 'mock-jwt-token' },
    }).as('loginRequest');

    cy.intercept(
      'POST',
      '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations',
      {
        statusCode: 200,
        body: { organisations: [] },
      }
    ).as('getOrganisationsEmpty');

    cy.visit('/');
    cy.loginUser();
    cy.wait('@loginRequest');
    cy.wait('@getOrganisationsEmpty');

    // Try to create organisation with error
    cy.intercept(
      'POST',
      '**/com.inspirationparticle.organisation.v1.OrganisationService/CreateOrganisation',
      {
        statusCode: 409,
        body: { error: 'Organisation name already exists' },
      }
    ).as('createError');

    cy.getByTestId('create-organisation-name').type('Duplicate Name');
    cy.getByTestId('create-organisation-submit').click();
    cy.wait('@createError');

    // Should show error
    cy.contains('Failed to create organisation').should('be.visible');

    // Fix the issue by changing name and retry
    cy.intercept(
      'POST',
      '**/com.inspirationparticle.organisation.v1.OrganisationService/CreateOrganisation',
      {
        statusCode: 200,
        body: {
          organisation: {
            id: 'recovered-org',
            name: 'Fixed Name',
            description: '',
            member_type: 'MEMBER_TYPE_ADMINISTRATOR',
            joined_at: { seconds: '1703846700', nanos: 0 },
            created_at: { seconds: '1703846700', nanos: 0 },
            updated_at: { seconds: '1703846700', nanos: 0 },
          },
        },
      }
    ).as('createSuccess');

    cy.intercept(
      'POST',
      '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations',
      {
        statusCode: 200,
        body: {
          organisations: [
            {
              id: 'recovered-org',
              name: 'Fixed Name',
              description: '',
              member_type: 'MEMBER_TYPE_ADMINISTRATOR',
              joined_at: { seconds: '1703846700', nanos: 0 },
              created_at: { seconds: '1703846700', nanos: 0 },
              updated_at: { seconds: '1703846700', nanos: 0 },
            },
          ],
        },
      }
    ).as('getOrganisationsRecovered');

    cy.getByTestId('create-organisation-name').clear().type('Fixed Name');
    cy.getByTestId('create-organisation-submit').click();

    cy.wait('@createSuccess');
    cy.wait('@getOrganisationsRecovered');

    // Should recover successfully
    cy.getByTestId('no-organisation-dialog').should('not.exist');
    cy.getByTestId('organisation-switcher-button').should('contain', 'Fixed Name');
  });
});
