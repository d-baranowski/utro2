/// <reference types="cypress" />

describe('Therapist Management (Admin)', () => {
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

  context('Admin User - Therapist CRUD Operations', () => {
    beforeEach(() => {
      // Mock login for admin user
      cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
        statusCode: 200,
        body: { token: 'mock-admin-jwt-token' },
      }).as('adminLogin');

      // Mock organization membership check
      cy.intercept(
        'POST',
        '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations',
        {
          statusCode: 200,
          body: {
            organisations: [
              {
                id: testContext.organization.id,
                name: testContext.organization.name,
                description: testContext.organization.description,
                memberType: 'ADMINISTRATOR',
              },
            ],
          },
        }
      ).as('getAdminOrganisations');

      cy.visit('/');
      cy.loginUser('therapist_admin', 'testpass');
      cy.wait('@adminLogin');
      cy.wait('@getAdminOrganisations');
    });

    it('should display therapist management interface for admin', () => {
      // Mock initial therapists list (empty)
      cy.intercept('POST', '**/utro.v1.TherapistService/ListTherapists', {
        statusCode: 200,
        body: { therapists: [] },
      }).as('getTherapists');

      // Navigate to therapist management
      cy.getByTestId('therapist-management-link').click();
      cy.wait('@getTherapists');

      // Should show management interface
      cy.getByTestId('therapist-management-container').should('be.visible');
      cy.getByTestId('create-therapist-button').should('be.visible');
      cy.contains('No therapists found').should('be.visible');
    });

    it('should create a new therapist successfully', () => {
      cy.fixture('therapists').then((therapists) => {
        // Mock available users for therapist creation
        cy.intercept('POST', '**/utro.v1.UserService/ListOrganisationUsers', {
          statusCode: 200,
          body: {
            users: [
              {
                id: testContext.regularUser.id,
                username: testContext.regularUser.username,
                fullName: testContext.regularUser.fullName,
                email: testContext.regularUser.email,
              },
            ],
          },
        }).as('getOrgUsers');

        // Mock specializations list
        cy.intercept('POST', '**/utro.v1.SpecializationService/ListSpecializations', {
          statusCode: 200,
          body: { specializations: therapists.specializations },
        }).as('getSpecializations');

        // Mock therapist creation
        cy.intercept('POST', '**/utro.v1.TherapistService/CreateTherapist', {
          statusCode: 200,
          body: { therapist: { ...therapists.createTherapistRequest, id: 'new-therapist-id' } },
        }).as('createTherapist');

        // Mock updated therapists list after creation
        cy.intercept('POST', '**/utro.v1.TherapistService/ListTherapists', {
          statusCode: 200,
          body: {
            therapists: [{ ...therapists.createTherapistRequest, id: 'new-therapist-id' }],
          },
        }).as('getTherapistsAfterCreate');

        cy.visit('/therapist-management');
        cy.wait('@getOrgUsers');

        // Open create therapist dialog
        cy.getByTestId('create-therapist-button').click();
        cy.getByTestId('therapist-form-dialog').should('be.visible');

        // Fill required fields
        cy.getByTestId('therapist-user-select').click();
        cy.contains(testContext.regularUser.fullName).click();

        cy.getByTestId('therapist-title-input').type(
          therapists.createTherapistRequest.professionalTitle
        );
        cy.getByTestId('therapist-slug-input').type(therapists.createTherapistRequest.slug);
        cy.getByTestId('therapist-email-input').type(
          therapists.createTherapistRequest.contactEmail
        );

        // Add at least one language
        cy.getByTestId('therapist-language-select').click();
        cy.contains('English').click();
        cy.getByTestId('add-language-button').click();

        // Enable at least one therapy format
        cy.getByTestId('in-person-therapy-switch').click();

        // Submit form
        cy.getByTestId('therapist-form-submit').click();

        cy.wait('@createTherapist');
        cy.wait('@getTherapistsAfterCreate');

        // Verify therapist was created and dialog closed
        cy.getByTestId('therapist-form-dialog').should('not.exist');
        cy.contains(therapists.createTherapistRequest.professionalTitle).should('be.visible');
      });
    });

    it('should edit an existing therapist', () => {
      cy.fixture('therapists').then((therapists) => {
        const existingTherapist = therapists.sampleTherapist;

        // Mock therapists list with existing therapist
        cy.intercept('POST', '**/utro.v1.TherapistService/ListTherapists', {
          statusCode: 200,
          body: { therapists: [existingTherapist] },
        }).as('getTherapists');

        // Mock get therapist for editing
        cy.intercept('POST', '**/utro.v1.TherapistService/GetTherapist', {
          statusCode: 200,
          body: { therapist: existingTherapist },
        }).as('getTherapist');

        // Mock update therapist
        cy.intercept('POST', '**/utro.v1.TherapistService/UpdateTherapist', {
          statusCode: 200,
          body: {
            therapist: {
              ...existingTherapist,
              ...therapists.updateTherapistRequest,
            },
          },
        }).as('updateTherapist');

        cy.visit('/therapist-management');
        cy.wait('@getTherapists');

        // Click edit button
        cy.getByTestId(`edit-therapist-${existingTherapist.id}`).click();
        cy.wait('@getTherapist');

        // Verify form is pre-populated
        cy.getByTestId('therapist-title-input').should(
          'have.value',
          existingTherapist.professionalTitle
        );

        // Update professional title
        cy.getByTestId('therapist-title-input').clear();
        cy.getByTestId('therapist-title-input').type(
          therapists.updateTherapistRequest.professionalTitle
        );

        // Submit update
        cy.getByTestId('therapist-form-submit').click();

        cy.wait('@updateTherapist');

        // Verify update was successful
        cy.contains(therapists.updateTherapistRequest.professionalTitle).should('be.visible');
      });
    });

    it('should delete a therapist', () => {
      cy.fixture('therapists').then((therapists) => {
        const therapistToDelete = therapists.sampleTherapist;

        // Mock therapists list
        cy.intercept('POST', '**/utro.v1.TherapistService/ListTherapists', {
          statusCode: 200,
          body: { therapists: [therapistToDelete] },
        }).as('getTherapists');

        // Mock delete therapist
        cy.intercept('POST', '**/utro.v1.TherapistService/DeleteTherapist', {
          statusCode: 200,
          body: {},
        }).as('deleteTherapist');

        // Mock empty therapists list after deletion
        cy.intercept('POST', '**/utro.v1.TherapistService/ListTherapists', {
          statusCode: 200,
          body: { therapists: [] },
        }).as('getTherapistsAfterDelete');

        cy.visit('/therapist-management');
        cy.wait('@getTherapists');

        // Click delete button
        cy.getByTestId(`delete-therapist-${therapistToDelete.id}`).click();

        // Confirm deletion
        cy.getByTestId('confirm-delete-therapist').click();

        cy.wait('@deleteTherapist');
        cy.wait('@getTherapistsAfterDelete');

        // Verify therapist was deleted
        cy.contains(therapistToDelete.professionalTitle).should('not.exist');
        cy.contains('No therapists found').should('be.visible');
      });
    });

    it('should publish/unpublish a therapist', () => {
      cy.fixture('therapists').then((therapists) => {
        const unpublishedTherapist = { ...therapists.sampleTherapist, publishedAt: null };

        // Mock therapists list
        cy.intercept('POST', '**/utro.v1.TherapistService/ListTherapists', {
          statusCode: 200,
          body: { therapists: [unpublishedTherapist] },
        }).as('getTherapists');

        // Mock publish therapist
        cy.intercept('POST', '**/utro.v1.TherapistService/PublishTherapist', {
          statusCode: 200,
          body: {
            therapist: {
              ...unpublishedTherapist,
              publishedAt: '2024-01-01T10:00:00Z',
            },
          },
        }).as('publishTherapist');

        cy.visit('/therapist-management');
        cy.wait('@getTherapists');

        // Should show unpublished status
        cy.getByTestId(`therapist-status-${unpublishedTherapist.id}`).should(
          'contain',
          'Unpublished'
        );

        // Click publish button
        cy.getByTestId(`publish-therapist-${unpublishedTherapist.id}`).click();

        cy.wait('@publishTherapist');

        // Verify status changed to published
        cy.getByTestId(`therapist-status-${unpublishedTherapist.id}`).should(
          'contain',
          'Published'
        );
      });
    });

    it('should handle therapist creation validation errors', () => {
      cy.visit('/therapist-management');

      // Open create dialog
      cy.getByTestId('create-therapist-button').click();

      // Try to submit without required fields
      cy.getByTestId('therapist-form-submit').click();

      // Should show validation errors
      cy.contains('User is required').should('be.visible');
      cy.contains('Professional title is required').should('be.visible');
      cy.contains('Email is required').should('be.visible');
      cy.contains('At least one language is required').should('be.visible');
      cy.contains('At least one therapy format is required').should('be.visible');
    });

    it('should handle API errors gracefully', () => {
      // Mock API error for therapists list
      cy.intercept('POST', '**/utro.v1.TherapistService/ListTherapists', {
        statusCode: 500,
        body: { error: 'Internal server error' },
      }).as('getTherapistsError');

      cy.visit('/therapist-management');
      cy.wait('@getTherapistsError');

      // Should show error message
      cy.contains('Failed to load therapists').should('be.visible');
    });
  });

  context('Regular User - Access Control', () => {
    beforeEach(() => {
      // Mock login for regular user (non-admin)
      cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
        statusCode: 200,
        body: { token: 'mock-user-jwt-token' },
      }).as('userLogin');

      // Mock organization membership check (as regular member)
      cy.intercept(
        'POST',
        '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations',
        {
          statusCode: 200,
          body: {
            organisations: [
              {
                id: testContext.organization.id,
                name: testContext.organization.name,
                description: testContext.organization.description,
                memberType: 'MEMBER',
              },
            ],
          },
        }
      ).as('getUserOrganisations');

      cy.visit('/');
      cy.loginUser('regular_user', 'testpass');
      cy.wait('@userLogin');
      cy.wait('@getUserOrganisations');
    });

    it('should not show therapist management link for non-admin users', () => {
      // Therapist management should not be accessible
      cy.getByTestId('therapist-management-link').should('not.exist');
    });

    it('should redirect unauthorized users away from management page', () => {
      // Try to access management page directly
      cy.visit('/therapist-management');

      // Should be redirected or show access denied
      cy.url().should('not.include', '/therapist-management');
      // or
      cy.contains('Access denied').should('be.visible');
    });
  });
});
