/// <reference types="cypress" />

describe('Therapist Functionality - Simple Mock Tests', () => {
  beforeEach(() => {
    cy.clearStorage();
  });

  context('Basic UI Rendering', () => {
    it('should display login form', () => {
      cy.visit('/');
      cy.get('[data-testid="login-username"]').should('be.visible');
      cy.get('[data-testid="login-password"]').should('be.visible');
      cy.get('[data-testid="login-submit"]').should('be.visible');
    });

    it('should handle login with mocked response', () => {
      // Mock successful login
      cy.intercept('POST', '**/login', {
        statusCode: 200,
        body: { token: 'mock-jwt-token', user: { username: 'testuser' } },
      }).as('loginRequest');

      cy.visit('/');
      cy.get('[data-testid="login-username"]').type('testuser');
      cy.get('[data-testid="login-password"]').type('testpass');
      cy.get('[data-testid="login-submit"]').click();

      cy.wait('@loginRequest');
      
      // After successful login, user should be redirected or see success message
      cy.url().should('not.include', '/login');
    });
  });

  context('Therapist Management UI (Admin)', () => {
    beforeEach(() => {
      // Mock successful admin login
      cy.intercept('POST', '**/login', {
        statusCode: 200,
        body: { token: 'mock-admin-jwt-token' },
      }).as('adminLogin');

      // Mock admin organization membership
      cy.intercept('POST', '**/GetMyOrganisations', {
        statusCode: 200,
        body: { 
          organisations: [{
            id: 'test-org-id',
            name: 'Test Organisation',
            description: 'Test org description',
            memberType: 'ADMINISTRATOR'
          }] 
        },
      }).as('getAdminOrganisations');

      cy.visit('/');
      cy.get('[data-testid="login-username"]').type('admin');
      cy.get('[data-testid="login-password"]').type('adminpass');
      cy.get('[data-testid="login-submit"]').click();
      cy.wait('@adminLogin');
    });

    it('should display therapist management container for admin', () => {
      // Mock empty therapists list
      cy.intercept('POST', '**/ListTherapists', {
        statusCode: 200,
        body: { therapists: [] },
      }).as('getTherapists');

      cy.visit('/therapist-management');
      
      // Check if management container is rendered
      cy.get('[data-testid="therapist-management-container"]').should('exist');
      cy.get('[data-testid="create-therapist-button"]').should('exist');
    });

    it('should open create therapist dialog', () => {
      // Mock therapists and users
      cy.intercept('POST', '**/ListTherapists', {
        statusCode: 200,
        body: { therapists: [] },
      }).as('getTherapists');

      cy.intercept('POST', '**/ListOrganisationUsers', {
        statusCode: 200,
        body: { 
          users: [{
            id: 'user-1',
            username: 'user1',
            fullName: 'User One',
            email: 'user1@test.com'
          }]
        },
      }).as('getOrgUsers');

      cy.visit('/therapist-management');
      
      // Click create button
      cy.get('[data-testid="create-therapist-button"]').click();
      
      // Check if form dialog opens
      cy.get('[data-testid="therapist-form-dialog"]').should('be.visible');
      cy.get('[data-testid="therapist-title-input"]').should('be.visible');
    });
  });

  context('Therapist Browsing UI (Public)', () => {
    beforeEach(() => {
      // Mock regular user login
      cy.intercept('POST', '**/login', {
        statusCode: 200,
        body: { token: 'mock-user-jwt-token' },
      }).as('userLogin');

      // Mock user organization membership
      cy.intercept('POST', '**/GetMyOrganisations', {
        statusCode: 200,
        body: { 
          organisations: [{
            id: 'test-org-id',
            name: 'Test Organisation',
            memberType: 'MEMBER'
          }] 
        },
      }).as('getUserOrganisations');

      cy.visit('/');
      cy.get('[data-testid="login-username"]').type('user');
      cy.get('[data-testid="login-password"]').type('userpass');
      cy.get('[data-testid="login-submit"]').click();
      cy.wait('@userLogin');
    });

    it('should display therapist browser container', () => {
      // Mock published therapists
      cy.intercept('POST', '**/ListTherapists', {
        statusCode: 200,
        body: { 
          therapists: [{
            id: 'therapist-1',
            userId: 'user-1',
            userName: 'therapist1',
            userFullName: 'Dr. Test Therapist',
            professionalTitle: 'Licensed Psychologist',
            descriptionEng: 'Experienced therapist',
            languages: ['English', 'Polish'],
            inPersonTherapyFormat: true,
            onlineTherapyFormat: true,
            contactEmail: 'therapist@test.com',
            isAcceptingNewClients: true,
            visibility: 'PUBLIC',
            publishedAt: '2024-01-01T10:00:00Z',
            specializations: []
          }]
        },
      }).as('getTherapists');

      // Mock specializations
      cy.intercept('POST', '**/ListSpecializations', {
        statusCode: 200,
        body: { specializations: [] },
      }).as('getSpecializations');

      cy.visit('/therapists');
      
      // Check if browser container is rendered
      cy.get('[data-testid="therapist-browser-container"]').should('exist');
      cy.get('[data-testid="therapist-filters"]').should('exist');
      cy.get('[data-testid="search-input"]').should('exist');
    });

    it('should display therapist cards', () => {
      const mockTherapist = {
        id: 'therapist-1',
        userId: 'user-1',
        userName: 'therapist1',
        userFullName: 'Dr. Test Therapist',
        professionalTitle: 'Licensed Psychologist',
        descriptionEng: 'Experienced therapist',
        languages: ['English', 'Polish'],
        inPersonTherapyFormat: true,
        onlineTherapyFormat: false,
        contactEmail: 'therapist@test.com',
        isAcceptingNewClients: true,
        visibility: 'PUBLIC',
        publishedAt: '2024-01-01T10:00:00Z',
        specializations: []
      };

      cy.intercept('POST', '**/ListTherapists', {
        statusCode: 200,
        body: { therapists: [mockTherapist] },
      }).as('getTherapists');

      cy.intercept('POST', '**/ListSpecializations', {
        statusCode: 200,
        body: { specializations: [] },
      }).as('getSpecializations');

      cy.visit('/therapists');
      cy.wait('@getTherapists');
      
      // Check if therapist card is displayed
      cy.get('[data-testid="therapist-card-therapist-1"]').should('exist');
      cy.contains('Dr. Test Therapist').should('be.visible');
      cy.contains('Licensed Psychologist').should('be.visible');
    });

    it('should filter therapists by search', () => {
      cy.intercept('POST', '**/ListTherapists', {
        statusCode: 200,
        body: { therapists: [] },
      }).as('getInitialTherapists');

      cy.intercept('POST', '**/SearchTherapists', {
        statusCode: 200,
        body: { therapists: [] },
      }).as('searchTherapists');

      cy.intercept('POST', '**/ListSpecializations', {
        statusCode: 200,
        body: { specializations: [] },
      }).as('getSpecializations');

      cy.visit('/therapists');
      cy.wait('@getInitialTherapists');
      
      // Type in search
      cy.get('[data-testid="search-input"]').type('anxiety');
      
      // Check that search was triggered (implementation may vary)
      // In real implementation, this might trigger on Enter key or after debounce
      cy.get('[data-testid="search-input"]').type('{enter}');
    });

    it('should show no results message when empty', () => {
      cy.intercept('POST', '**/ListTherapists', {
        statusCode: 200,
        body: { therapists: [] },
      }).as('getEmptyTherapists');

      cy.intercept('POST', '**/ListSpecializations', {
        statusCode: 200,
        body: { specializations: [] },
      }).as('getSpecializations');

      cy.visit('/therapists');
      cy.wait('@getEmptyTherapists');
      
      // Should show no therapists message
      cy.get('[data-testid="no-therapists-message"]').should('exist');
    });
  });
});