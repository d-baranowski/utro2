/// <reference types="cypress" />

describe('Offer Management E2E (No Mocking)', () => {
  let testContext: any;

  before(() => {
    // Setup test data once before all tests
    cy.setupOfferTestData().then((context) => {
      testContext = context;
    });
  });

  after(() => {
    // Cleanup test data after all tests
    cy.cleanupOfferTestData();
  });

  beforeEach(() => {
    // Clear storage but preserve test data
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visit login page
    cy.visit('/');
  });

  context('Admin User - Offer CRUD Operations', () => {
    beforeEach(() => {
      // Login as admin user (real authentication)
      cy.loginUser(testContext.adminUser.username, testContext.adminUser.password);
      cy.wait(2000); // Wait for authentication to complete
      
      // Navigate to offer management
      cy.visit('/offer-management');
      cy.wait(2000); // Wait for page to load
    });

    it('should display offer management interface for admin', () => {
      // Check that the offer management page loads
      cy.contains('Offers Management', { timeout: 10000 }).should('be.visible');
      cy.contains('Manage your organization\'s services and offers').should('be.visible');
      
      // Check that the add offer button is visible
      cy.contains('button', 'Add Offer').should('be.visible');
      
      // Check that the search field is present
      cy.get('input[placeholder*="Search offers"]').should('be.visible');
    });

    it('should create a new offer successfully', () => {
      // Click Add Offer button
      cy.contains('button', 'Add Offer').click();
      
      // Wait for form dialog to open
      cy.contains('Create Offer', { timeout: 10000 }).should('be.visible');
      
      // Fill out the offer form using more robust selectors
      cy.get('label').contains('Name (English)').parent().find('input').type('Individual Therapy E2E');
      cy.get('label').contains('Name (Polish)').parent().find('input').type('Terapia Indywidualna E2E');
      
      cy.get('label').contains('Description (English)').parent().find('textarea').type('Professional individual therapy sessions for anxiety and depression treatment.');
      cy.get('label').contains('Description (Polish)').parent().find('textarea').type('Profesjonalne sesje terapii indywidualnej na leczenie lęku i depresji.');
      
      // Submit the form
      cy.contains('button', 'Create').click();
      
      // Check for success message
      cy.contains('Offer created successfully', { timeout: 10000 }).should('be.visible');
      
      // Verify the offer appears in the list
      cy.contains('Individual Therapy E2E', { timeout: 10000 }).should('be.visible');
      cy.contains('Terapia Indywidualna E2E').should('be.visible');
    });

    it('should edit an existing offer', () => {
      // Find the table row containing our test offer and click the more actions button
      cy.contains('tr', 'Individual Therapy E2E').within(() => {
        cy.get('button[aria-label="more actions"]').click();
      });
      
      // Click edit from the menu
      cy.contains('Edit').click();
      
      // Wait for edit dialog to open
      cy.contains('Edit Offer', { timeout: 10000 }).should('be.visible');
      
      // Update the offer using robust selectors
      cy.get('label').contains('Name (English)').parent().find('input').clear().type('Updated Individual Therapy E2E');
      cy.get('label').contains('Description (English)').parent().find('textarea').clear().type('Updated description for individual therapy sessions.');
      
      // Submit the changes
      cy.contains('button', 'Update').click();
      
      // Check for success message
      cy.contains('Offer updated successfully', { timeout: 10000 }).should('be.visible');
      
      // Verify the updated offer appears in the list
      cy.contains('Updated Individual Therapy E2E', { timeout: 10000 }).should('be.visible');
    });

    it('should search for offers', () => {
      // Use the search functionality
      cy.get('input[placeholder*="Search offers"]').type('Individual');
      cy.wait(1000); // Wait for search to execute
      
      // Verify search results
      cy.contains('Updated Individual Therapy E2E').should('be.visible');
      
      // Clear search
      cy.get('input[placeholder*="Search offers"]').clear();
      cy.wait(1000);
      
      // Verify all offers are shown again
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });

    it('should delete an offer with confirmation', () => {
      // Find the table row and click more actions
      cy.contains('tr', 'Updated Individual Therapy E2E').within(() => {
        cy.get('button[aria-label="more actions"]').click();
      });
      
      // Click delete from the menu
      cy.contains('Delete').click();
      
      // Confirm deletion in the dialog
      cy.contains('Are you sure you want to delete this offer?', { timeout: 10000 }).should('be.visible');
      cy.contains('button', 'Delete').click();
      
      // Check for success message
      cy.contains('Offer deleted successfully', { timeout: 10000 }).should('be.visible');
      
      // Verify the offer no longer appears in the list
      cy.contains('Updated Individual Therapy E2E').should('not.exist');
    });
  });

  context('Public User - Offer Browsing', () => {
    beforeEach(() => {
      // Create a test offer first by logging in as admin
      cy.loginUser(testContext.adminUser.username, testContext.adminUser.password);
      cy.wait(1000);
      cy.createTestOffer({
        nameEng: 'Group Therapy E2E',
        namePl: 'Terapia Grupowa E2E',
        descriptionEng: 'Group therapy sessions for social anxiety.',
        descriptionPl: 'Sesje terapii grupowej na lęk społeczny.',
        organisationId: testContext.organization.id
      });
      
      // Logout and proceed as public user
      cy.clearStorage();
      cy.visit('/');
    });

    it('should browse offers as public user', () => {
      // Navigate to public offers page without authentication
      cy.visit('/offers');
      cy.wait(2000);
      
      // Check that offers page loads
      cy.contains('Browse Offers', { timeout: 10000 }).should('be.visible');
      cy.contains('Discover available services and offers').should('be.visible');
      
      // Check that the search field is present
      cy.get('input[placeholder*="Search offers"]').should('be.visible');
      
      // Verify that offers are displayed using card structure
      cy.get('.MuiCard-root', { timeout: 10000 }).should('have.length.greaterThan', 0);
    });

    it('should search offers as public user', () => {
      cy.visit('/offers');
      cy.wait(2000);
      
      // Search for specific offer
      cy.get('input[placeholder*="Search offers"]').type('Group');
      cy.wait(1000);
      
      // Verify search results
      cy.contains('Group Therapy E2E').should('be.visible');
      
      // Clear search and verify all offers shown
      cy.get('input[placeholder*="Search offers"]').clear();
      cy.wait(1000);
      cy.get('.MuiCard-root').should('have.length.greaterThan', 0);
    });
  });

  context('Access Control', () => {
    it('should deny access to offer management for non-admin users', () => {
      // Login as regular user (not admin)
      cy.loginUser(testContext.regularUser.username, testContext.regularUser.password);
      cy.wait(2000);
      
      // Try to access offer management
      cy.visit('/offer-management');
      
      // Should see access denied message
      cy.contains('Administrator access required', { timeout: 10000 }).should('be.visible');
    });

    it('should allow access to public offers page without authentication', () => {
      // Visit offers page without login
      cy.visit('/offers');
      
      // Should be able to see the page
      cy.contains('Browse Offers', { timeout: 10000 }).should('be.visible');
    });
  });
});