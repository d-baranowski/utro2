describe('Therapist Creation', () => {
  beforeEach(() => {
    // Set up authentication
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'valid-test-token');
    });

    // Visit the therapist management page
    cy.visit('/therapist-management');
  });

  it('should create a new therapist successfully', () => {
    // Wait for page to load and show create button
    cy.get('[data-testid="create-therapist-button"]').should('be.visible');
    
    // Click create therapist button
    cy.get('[data-testid="create-therapist-button"]').click();
    
    // Verify therapist form dialog is open
    cy.get('[data-testid="therapist-form-dialog"]').should('be.visible');
    
    // Wait for user dropdown to load (should not show loading skeleton)
    cy.get('[data-testid="therapist-user-select-loading"]').should('not.exist');
    
    // Select a user from dropdown
    cy.get('[data-testid="therapist-user-select"]').click();
    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').first().click();
    
    // Fill in professional title
    cy.get('[data-testid="therapist-title-input"]').type('Dr. Test Therapist');
    
    // Fill in slug
    cy.get('[data-testid="therapist-slug-input"]').type('dr-test-therapist');
    
    // Fill in contact email
    cy.get('[data-testid="therapist-email-input"]').type('test.therapist@example.com');
    
    // Select a language
    cy.get('[data-testid="therapist-language-select"]').click();
    cy.get('[role="listbox"]').should('be.visible');
    cy.contains('[role="option"]', 'English').click();
    cy.get('[data-testid="add-language-button"]').click();
    
    // Enable in-person therapy
    cy.get('[data-testid="in-person-therapy-switch"]').click();
    
    // Submit the form
    cy.get('[data-testid="therapist-form-submit"]').click();
    
    // Verify therapist was created successfully
    cy.get('[role="alert"]').should('contain', 'created successfully');
    
    // Verify the dialog is closed
    cy.get('[data-testid="therapist-form-dialog"]').should('not.exist');
    
    // Verify the new therapist appears in the list
    cy.contains('[data-testid^="therapist-row-"]', 'Dr. Test Therapist').should('be.visible');
  });

  it('should show validation errors for required fields', () => {
    // Click create therapist button
    cy.get('[data-testid="create-therapist-button"]').click();
    
    // Try to submit without filling required fields
    cy.get('[data-testid="therapist-form-submit"]').click();
    
    // Verify validation errors are shown
    cy.contains('User is required').should('be.visible');
    cy.contains('Professional title is required').should('be.visible');
    cy.contains('Email is required').should('be.visible');
    cy.contains('Slug is required').should('be.visible');
    cy.contains('At least one language is required').should('be.visible');
    cy.contains('At least one therapy format is required').should('be.visible');
  });

  it('should show loading state while fetching users', () => {
    // Click create therapist button
    cy.get('[data-testid="create-therapist-button"]').click();
    
    // Verify loading skeleton is shown initially for user dropdown
    cy.get('[data-testid="therapist-user-select-loading"]').should('be.visible');
    
    // Loading should disappear once data is loaded
    cy.get('[data-testid="therapist-user-select-loading"]', { timeout: 10000 }).should('not.exist');
    
    // User dropdown should be available
    cy.get('[data-testid="therapist-user-select"]').should('be.visible');
  });

  it('should handle user dropdown error state gracefully', () => {
    // Mock API error for user dropdown
    cy.intercept(
      'POST',
      '**/com.inspirationparticle.utro.gen.organisation.v1.OrganisationService/GetOrganisationUsers',
      { statusCode: 500, body: { message: 'Internal server error' } }
    ).as('getUsersError');

    // Click create therapist button
    cy.get('[data-testid="create-therapist-button"]').click();
    
    // Wait for error response
    cy.wait('@getUsersError');
    
    // Verify error state is displayed
    cy.contains('Error loading users').should('be.visible');
    cy.get('[data-testid="therapist-user-select"]').should('be.disabled');
  });

  it('should prevent non-admin users from accessing therapist creation', () => {
    // Mock user as non-admin (this would be handled by the authentication/organization context)
    // For now, we'll test that the page shows admin access required message
    
    // Visit page without admin privileges (this would typically be handled by backend auth)
    // The component should show access denied message
    cy.contains('Admin access required').should('exist');
  });
});