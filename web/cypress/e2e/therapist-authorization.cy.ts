/// <reference types="cypress" />

describe('Therapist Authorization & Visibility', () => {
  let testContext: any;

  beforeEach(() => {
    cy.clearStorage();
    cy.cleanupTherapistTestData();
    cy.setupTherapistAdminContext().then((context) => {
      testContext = context;
    });
  });

  afterEach(() => {
    cy.cleanupTherapistTestData();
  });

  context('Admin User - Can See All Therapists', () => {
    beforeEach(() => {
      cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
        statusCode: 200,
        body: { token: 'mock-admin-jwt-token' },
      }).as('adminLogin');

      cy.intercept('POST', '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations', {
        statusCode: 200,
        body: { 
          organisations: [{
            id: testContext.organization.id,
            name: testContext.organization.name,
            description: testContext.organization.description,
            memberType: 'ADMINISTRATOR'
          }] 
        },
      }).as('getAdminOrganisations');

      cy.visit('/');
      cy.loginUser('therapist_admin', 'testpass');
      cy.wait('@adminLogin');
      cy.wait('@getAdminOrganisations');
    });

    it('should show both published and unpublished therapists to admin', () => {
      cy.fixture('therapists').then((therapists) => {
        const allTherapists = [
          therapists.sampleTherapist, // published
          therapists.unpublishedTherapist // unpublished
        ];

        cy.intercept('POST', '**/utro.v1.TherapistService/ListTherapists', {
          statusCode: 200,
          body: { therapists: allTherapists },
        }).as('getAllTherapistsAdmin');

        cy.visit('/therapist-management');
        cy.wait('@getAllTherapistsAdmin');

        // Should see both therapists
        cy.getByTestId(`therapist-row-${therapists.sampleTherapist.id}`).should('be.visible');
        cy.getByTestId(`therapist-row-${therapists.unpublishedTherapist.id}`).should('be.visible');

        // Should show correct status indicators
        cy.getByTestId(`therapist-status-${therapists.sampleTherapist.id}`).should('contain', 'Published');
        cy.getByTestId(`therapist-status-${therapists.unpublishedTherapist.id}`).should('contain', 'Unpublished');
      });
    });

    it('should allow admin to manage unpublished therapists', () => {
      cy.fixture('therapists').then((therapists) => {
        const unpublishedTherapist = therapists.unpublishedTherapist;

        cy.intercept('POST', '**/utro.v1.TherapistService/ListTherapists', {
          statusCode: 200,
          body: { therapists: [unpublishedTherapist] },
        }).as('getUnpublishedTherapist');

        cy.intercept('POST', '**/utro.v1.TherapistService/GetTherapist', {
          statusCode: 200,
          body: { therapist: unpublishedTherapist },
        }).as('getTherapistForEdit');

        cy.visit('/therapist-management');
        cy.wait('@getUnpublishedTherapist');

        // Should be able to edit unpublished therapist
        cy.getByTestId(`edit-therapist-${unpublishedTherapist.id}`).should('be.visible').click();
        cy.wait('@getTherapistForEdit');

        // Form should load with therapist data
        cy.getByTestId('therapist-form-dialog').should('be.visible');
        cy.getByTestId('therapist-title-input').should('have.value', unpublishedTherapist.professionalTitle);

        // Should be able to delete unpublished therapist
        cy.getByTestId('cancel-edit-button').click(); // Close edit dialog
        cy.getByTestId(`delete-therapist-${unpublishedTherapist.id}`).should('be.visible');
      });
    });
  });

  context('Regular User - Limited Visibility', () => {
    beforeEach(() => {
      cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
        statusCode: 200,
        body: { token: 'mock-user-jwt-token' },
      }).as('userLogin');

      cy.intercept('POST', '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations', {
        statusCode: 200,
        body: { 
          organisations: [{
            id: testContext.organization.id,
            name: testContext.organization.name,
            description: testContext.organization.description,
            memberType: 'MEMBER'
          }] 
        },
      }).as('getUserOrganisations');

      cy.visit('/');
      cy.loginUser('regular_user', 'testpass');
      cy.wait('@userLogin');
      cy.wait('@getUserOrganisations');
    });

    it('should only see published therapists', () => {
      cy.fixture('therapists').then((therapists) => {
        // Backend should filter out unpublished therapists for regular users
        const visibleTherapists = [therapists.sampleTherapist]; // only published

        cy.intercept('POST', '**/utro.v1.TherapistService/ListTherapists', {
          statusCode: 200,
          body: { therapists: visibleTherapists },
        }).as('getPublishedTherapistsOnly');

        cy.visit('/therapists');
        cy.wait('@getPublishedTherapistsOnly');

        // Should only see published therapist
        cy.getByTestId(`therapist-card-${therapists.sampleTherapist.id}`).should('be.visible');
        
        // Should NOT see unpublished therapist
        cy.getByTestId(`therapist-card-${therapists.unpublishedTherapist.id}`).should('not.exist');
      });
    });

    it('should not be able to access therapist management', () => {
      // Navigation link should not be present
      cy.getByTestId('therapist-management-link').should('not.exist');

      // Direct navigation should be blocked
      cy.visit('/therapist-management');
      
      // Should be redirected or see access denied
      cy.url().should('not.include', '/therapist-management');
      // Or check for access denied message if that's how it's implemented
      // cy.contains('Access denied').should('be.visible');
    });

    it('should not see management actions on therapist cards', () => {
      cy.fixture('therapists').then((therapists) => {
        cy.intercept('POST', '**/utro.v1.TherapistService/ListTherapists', {
          statusCode: 200,
          body: { therapists: [therapists.sampleTherapist] },
        }).as('getTherapists');

        cy.visit('/therapists');
        cy.wait('@getTherapists');

        // Should not see edit/delete/publish buttons
        cy.getByTestId(`edit-therapist-${therapists.sampleTherapist.id}`).should('not.exist');
        cy.getByTestId(`delete-therapist-${therapists.sampleTherapist.id}`).should('not.exist');
        cy.getByTestId(`publish-therapist-${therapists.sampleTherapist.id}`).should('not.exist');
      });
    });
  });

  context('Therapist User - Own Profile Visibility', () => {
    beforeEach(() => {
      cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
        statusCode: 200,
        body: { token: 'mock-therapist-jwt-token' },
      }).as('therapistLogin');

      cy.intercept('POST', '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations', {
        statusCode: 200,
        body: { 
          organisations: [{
            id: testContext.organization.id,
            name: testContext.organization.name,
            description: testContext.organization.description,
            memberType: 'MEMBER'
          }] 
        },
      }).as('getTherapistOrganisations');

      cy.visit('/');
      cy.loginUser('therapist_user', 'testpass');
      cy.wait('@therapistLogin');
      cy.wait('@getTherapistOrganisations');
    });

    it('should see their own unpublished profile', () => {
      cy.fixture('therapists').then((therapists) => {
        const ownProfile = {
          ...therapists.unpublishedTherapist,
          userId: testContext.therapistUser.id
        };

        // Mock response includes therapist's own unpublished profile
        cy.intercept('POST', '**/utro.v1.TherapistService/ListTherapists', {
          statusCode: 200,
          body: { 
            therapists: [
              therapists.sampleTherapist, // published therapist from others
              ownProfile // own unpublished profile
            ]
          },
        }).as('getTherapistsWithOwn');

        cy.visit('/therapists');
        cy.wait('@getTherapistsWithOwn');

        // Should see both published therapist and own unpublished profile
        cy.getByTestId(`therapist-card-${therapists.sampleTherapist.id}`).should('be.visible');
        cy.getByTestId(`therapist-card-${ownProfile.id}`).should('be.visible');

        // Own unpublished profile should have special indicator
        cy.getByTestId(`own-profile-badge-${ownProfile.id}`).should('be.visible');
        cy.getByTestId(`unpublished-badge-${ownProfile.id}`).should('be.visible');
      });
    });

    it('should not see other therapists\' unpublished profiles', () => {
      cy.fixture('therapists').then((therapists) => {
        const ownProfile = {
          ...therapists.sampleTherapist,
          userId: testContext.therapistUser.id,
          publishedAt: '2024-01-01T10:00:00Z'
        };

        // Backend should only return own profile + other published profiles
        cy.intercept('POST', '**/utro.v1.TherapistService/ListTherapists', {
          statusCode: 200,
          body: { therapists: [ownProfile] }, // only own published profile
        }).as('getVisibleTherapists');

        cy.visit('/therapists');
        cy.wait('@getVisibleTherapists');

        // Should see own profile
        cy.getByTestId(`therapist-card-${ownProfile.id}`).should('be.visible');
        
        // Should NOT see other therapists' unpublished profiles
        cy.getByTestId(`therapist-card-${therapists.unpublishedTherapist.id}`).should('not.exist');
      });
    });

    it('should be able to edit own profile if allowed', () => {
      cy.fixture('therapists').then((therapists) => {
        const ownProfile = {
          ...therapists.sampleTherapist,
          userId: testContext.therapistUser.id
        };

        cy.intercept('POST', '**/utro.v1.TherapistService/ListTherapists', {
          statusCode: 200,
          body: { therapists: [ownProfile] },
        }).as('getOwnProfile');

        cy.intercept('POST', '**/utro.v1.TherapistService/GetTherapist', {
          statusCode: 200,
          body: { therapist: ownProfile },
        }).as('getOwnProfileForEdit');

        cy.visit('/therapists');
        cy.wait('@getOwnProfile');

        // Should see edit button for own profile
        cy.getByTestId(`edit-own-profile-${ownProfile.id}`).should('be.visible').click();
        cy.wait('@getOwnProfileForEdit');

        // Should open edit form
        cy.getByTestId('therapist-form-dialog').should('be.visible');
        cy.getByTestId('therapist-title-input').should('have.value', ownProfile.professionalTitle);
      });
    });
  });

  context('Visibility Levels Testing', () => {
    it('should respect PUBLIC visibility setting', () => {
      cy.fixture('therapists').then((therapists) => {
        const publicTherapist = {
          ...therapists.sampleTherapist,
          visibility: 'PUBLIC',
          publishedAt: '2024-01-01T10:00:00Z'
        };

        cy.intercept('POST', '**/utro.v1.TherapistService/ListTherapists', {
          statusCode: 200,
          body: { therapists: [publicTherapist] },
        }).as('getPublicTherapists');

        // Test as anonymous user (not logged in)
        cy.visit('/therapists');
        cy.wait('@getPublicTherapists');

        // Public therapist should be visible to anyone
        cy.getByTestId(`therapist-card-${publicTherapist.id}`).should('be.visible');
      });
    });

    it('should respect ORGANISATION_ONLY visibility setting', () => {
      cy.fixture('therapists').then((therapists) => {
        const orgOnlyTherapist = {
          ...therapists.sampleTherapist,
          visibility: 'ORGANISATION_ONLY',
          publishedAt: '2024-01-01T10:00:00Z'
        };

        // Mock for organization member
        cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
          statusCode: 200,
          body: { token: 'mock-member-jwt-token' },
        }).as('memberLogin');

        cy.intercept('POST', '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations', {
          statusCode: 200,
          body: { 
            organisations: [{
              id: testContext.organization.id,
              name: testContext.organization.name,
              memberType: 'MEMBER'
            }] 
          },
        }).as('getMemberOrganisations');

        cy.intercept('POST', '**/utro.v1.TherapistService/ListTherapists', {
          statusCode: 200,
          body: { therapists: [orgOnlyTherapist] },
        }).as('getOrgOnlyTherapists');

        cy.loginUser('regular_user', 'testpass');
        cy.wait('@memberLogin');
        cy.wait('@getMemberOrganisations');

        cy.visit('/therapists');
        cy.wait('@getOrgOnlyTherapists');

        // Should be visible to organization members
        cy.getByTestId(`therapist-card-${orgOnlyTherapist.id}`).should('be.visible');
      });
    });

    it('should respect PRIVATE visibility setting', () => {
      cy.fixture('therapists').then((therapists) => {
        const privateTherapist = {
          ...therapists.sampleTherapist,
          visibility: 'PRIVATE',
          publishedAt: '2024-01-01T10:00:00Z'
        };

        // Backend should filter out private therapists for non-admin users
        cy.intercept('POST', '**/utro.v1.TherapistService/ListTherapists', {
          statusCode: 200,
          body: { therapists: [] }, // private therapist filtered out
        }).as('getNoPrivateTherapists');

        cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
          statusCode: 200,
          body: { token: 'mock-user-jwt-token' },
        }).as('userLogin');

        cy.loginUser('regular_user', 'testpass');
        cy.wait('@userLogin');

        cy.visit('/therapists');
        cy.wait('@getNoPrivateTherapists');

        // Private therapist should NOT be visible to regular users
        cy.getByTestId(`therapist-card-${privateTherapist.id}`).should('not.exist');
        cy.contains('No therapists found').should('be.visible');
      });
    });
  });

  context('API Error Handling', () => {
    it('should handle authorization errors gracefully', () => {
      // Mock 403 Forbidden response
      cy.intercept('POST', '**/utro.v1.TherapistService/ListTherapists', {
        statusCode: 403,
        body: { error: 'Access denied' },
      }).as('getTherapistsForbidden');

      cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
        statusCode: 200,
        body: { token: 'mock-user-jwt-token' },
      }).as('userLogin');

      cy.loginUser('regular_user', 'testpass');
      cy.wait('@userLogin');

      cy.visit('/therapists');
      cy.wait('@getTherapistsForbidden');

      // Should show appropriate error message
      cy.contains('Access denied').should('be.visible');
      cy.contains('You do not have permission to view therapists').should('be.visible');
    });

    it('should handle expired authentication', () => {
      // Mock 401 Unauthorized response
      cy.intercept('POST', '**/utro.v1.TherapistService/ListTherapists', {
        statusCode: 401,
        body: { error: 'Authentication required' },
      }).as('getTherapistsUnauthorized');

      cy.visit('/therapists');
      cy.wait('@getTherapistsUnauthorized');

      // Should redirect to login or show auth error
      cy.url().should('include', 'login');
      // or
      // cy.contains('Please log in to continue').should('be.visible');
    });
  });
});