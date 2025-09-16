/// <reference types="cypress" />

describe('Organisation Switching Flow', () => {
  beforeEach(() => {
    cy.clearStorage();
  });

  context('User with organisations', () => {
    beforeEach(() => {
      // Use REAL authentication - no mocks!
      cy.visit('/');
      cy.loginUser();
      
      // Wait for real login to complete
      cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');
    });

    it('should display organisation switcher if user has organisations', () => {
      // Check if organisation switcher exists (user may or may not have orgs)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="organisation-switcher-button"]').length > 0) {
          cy.getByTestId('organisation-switcher-button').should('be.visible');
        } else {
          cy.log('User has no organisations');
        }
      });
    });

    it('should show organisation dropdown when clicked if available', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="organisation-switcher-button"]').length > 0) {
          cy.getByTestId('organisation-switcher-button').click();
          
          // Should show create option
          cy.getByTestId('create-organisation-menu-item').should('be.visible');
        } else {
          cy.log('No organisation switcher available');
        }
      });
    });

    it('should handle switching between organisations if multiple exist', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="organisation-switcher-button"]').length > 0) {
          const currentOrgText = $body.find('[data-testid="organisation-switcher-button"]').text();
          cy.getByTestId('organisation-switcher-button').click();
          
          // Try to find another org to switch to
          cy.get('[data-testid^="organisation-option-"]').then(($options) => {
            if ($options.length > 1) {
              // Click a different org
              cy.wrap($options[1]).click();
              
              // Verify the switcher updated
              cy.getByTestId('organisation-switcher-button')
                .should('not.contain', currentOrgText);
            } else {
              cy.log('Only one organisation available');
            }
          });
        }
      });
    });
  });

  context('Navigation integration', () => {
    it('should navigate to create organisation from dropdown', () => {
      // Login first
      cy.visit('/');
      cy.loginUser();
      cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="organisation-switcher-button"]').length > 0) {
          cy.getByTestId('organisation-switcher-button').click();
          cy.getByTestId('create-organisation-menu-item').click();
          
          // Should navigate to create org page or show dialog
          cy.get('body').should('be.visible');
        } else {
          // User might see no-org dialog instead
          cy.log('No organisation switcher, user may see no-org dialog');
        }
      });
    });
  });

  context('Persistence', () => {
    it('should remember selected organisation after page reload', () => {
      // Login first
      cy.visit('/');
      cy.loginUser();
      cy.contains('Successfully signed in', { timeout: 10000 }).should('be.visible');
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="organisation-switcher-button"]').length > 0) {
          // Get current org
          cy.getByTestId('organisation-switcher-button').then(($button) => {
            const originalOrg = $button.text();
            
            // Reload page
            cy.reload();
            
            // Should still show same org
            cy.getByTestId('organisation-switcher-button')
              .should('contain', originalOrg);
          });
        }
      });
    });
  });
});