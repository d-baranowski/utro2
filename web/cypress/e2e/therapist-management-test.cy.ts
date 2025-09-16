describe('Therapist Management - Connect RPC Test', () => {
  it('should load therapist management page and display actual therapist data', () => {
    // Clear storage and visit login
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit('http://localhost:3000/');
    
    // Login
    cy.getByTestId('login-username').type('testuser');
    cy.getByTestId('login-password').type('testpass');
    cy.getByTestId('login-submit').click();
    
    // Wait for login success
    cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');
    
    // Navigate to therapist management
    cy.visit('http://localhost:3000/therapist-management');
    
    // Wait for page to load
    cy.contains('Therapist Management', { timeout: 15000 }).should('be.visible');
    
    // Check that no errors occur
    cy.contains('Admin access required').should('not.exist');
    cy.contains('Error loading therapists').should('not.exist');
    cy.contains('No therapists found').should('not.exist');
    
    // Check for the management UI elements
    cy.contains('Add Therapist').should('be.visible');
    
    // **ACTUALLY TEST THAT THERAPIST DATA IS DISPLAYED**
    // Wait for therapist data to load (no loading spinner)
    cy.contains('Loading', { timeout: 10000 }).should('not.exist');
    
    // Check that therapist rows are actually displayed in the table
    cy.get('[data-testid^="therapist-row-"]', { timeout: 10000 }).should('have.length.greaterThan', 0);
    
    // Verify we can see therapist names/usernames in the table
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
    
    // Check that therapist menu buttons exist (meaning data is rendered)
    cy.get('[data-testid^="therapist-menu-"]').should('have.length.greaterThan', 0);
    
    // Verify the table shows actual content, not just empty state
    cy.get('table tbody').should('not.contain', 'No therapists found');
    cy.get('table tbody').should('not.contain', 'Loading');
  });
});