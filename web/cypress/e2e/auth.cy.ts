/// <reference types="cypress" />

describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearStorage();
    cy.visit('/');
  });

  it('should display login form when not authenticated', () => {
    cy.getByTestId('login-username').should('be.visible');
    cy.getByTestId('login-password').should('be.visible');
    cy.getByTestId('login-submit').should('be.visible');
  });

  it('should show validation errors for empty fields', () => {
    cy.getByTestId('login-submit').click();

    // Check for validation error messages
    cy.get('[data-testid="login-username"]').should('have.attr', 'aria-invalid', 'true');
    cy.get('[data-testid="login-password"]').should('have.attr', 'aria-invalid', 'true');
  });

  it('should successfully login with valid credentials', () => {
    // Mock the login API call
    cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
      statusCode: 200,
      body: { token: 'mock-jwt-token' },
    }).as('loginRequest');

    // Mock the get organizations API call to return empty array
    cy.intercept(
      'POST',
      '**/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations',
      {
        statusCode: 200,
        body: { organisations: [] },
      }
    ).as('getOrganisations');

    cy.getByTestId('login-username').type('testuser');
    cy.getByTestId('login-password').type('testpass');
    cy.getByTestId('login-submit').click();

    // Wait for API calls
    cy.wait('@loginRequest');
    cy.wait('@getOrganisations');

    // Should show success message and dashboard
    cy.getByTestId('login-success-alert').should('be.visible');
    cy.getByTestId('logout-button').should('be.visible');
  });

  it('should handle login failure', () => {
    // Mock failed login
    cy.intercept('POST', '**/com.inspirationparticle.auth.v1.AuthService/Login', {
      statusCode: 401,
      body: { error: 'Invalid credentials' },
    }).as('loginRequestFailed');

    cy.getByTestId('login-username').type('testuser');
    cy.getByTestId('login-password').type('wrongpass');
    cy.getByTestId('login-submit').click();

    cy.wait('@loginRequestFailed');

    // Should show error message
    cy.contains('Login failed').should('be.visible');
    cy.getByTestId('login-username').should('be.visible'); // Still on login form
  });

  it('should logout successfully', () => {
    // Login first
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
    ).as('getOrganisations');

    cy.loginUser();
    cy.wait('@loginRequest');
    cy.wait('@getOrganisations');

    // Logout
    cy.getByTestId('logout-button').click();

    // Should return to login form
    cy.getByTestId('login-username').should('be.visible');
    cy.getByTestId('login-password').should('be.visible');
  });

  it('should persist authentication state on page reload', () => {
    // Mock successful login
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
    ).as('getOrganisations');

    cy.loginUser();
    cy.wait('@loginRequest');
    cy.wait('@getOrganisations');

    // Reload page
    cy.reload();
    cy.wait('@getOrganisations');

    // Should still be logged in
    cy.getByTestId('logout-button').should('be.visible');
    cy.getByTestId('login-success-alert').should('be.visible');
  });

  it('should call protected endpoint successfully', () => {
    // Mock login and organizations
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
    ).as('getOrganisations');

    // Mock secret endpoint
    cy.intercept('GET', '**/secret', {
      statusCode: 200,
      body: 'Secret message from server',
    }).as('secretRequest');

    cy.loginUser();
    cy.wait('@loginRequest');
    cy.wait('@getOrganisations');

    // Call secret endpoint
    cy.getByTestId('call-secret-button').click();
    cy.wait('@secretRequest');

    // Should show response
    cy.getByTestId('secret-response').should('contain', 'Secret message from server');
  });
});
