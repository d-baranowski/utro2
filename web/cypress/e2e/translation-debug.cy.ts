describe('Translation Debug Test', () => {
  it('investigates translation issues without authentication', () => {
    // Visit the page directly to see what happens
    cy.visit('http://localhost:3000/organization-members');

    // Check what's actually being rendered
    cy.get('body', { timeout: 10000 })
      .should('exist')
      .then(($body) => {
        // Log the body content to see what's being rendered
        cy.log('Body content:', $body.text().substring(0, 1000));
      });

    // Check if we can find the main heading or title
    cy.get('h1, h2, h3, h4')
      .first()
      .should('exist')
      .then(($heading) => {
        cy.log('First heading:', $heading.text());
      });

    // Check if we're seeing translation keys instead of translated text
    cy.get('body').then(($body) => {
      const bodyText = $body.text();

      if (bodyText.includes('organisation.members')) {
        cy.log('Found untranslated key: organisation.members');
      }
      if (bodyText.includes('organisation.inviteMember')) {
        cy.log('Found untranslated key: organisation.inviteMember');
      }
      if (bodyText.includes('common.name')) {
        cy.log('Found untranslated key: common.name');
      }

      // Check if we have actual translations
      if (bodyText.includes('Organization Members')) {
        cy.log('Found English translation: Organization Members');
      }
      if (bodyText.includes('Invite Member')) {
        cy.log('Found English translation: Invite Member');
      }
    });

    // Take a screenshot for debugging
    cy.screenshot('organization-members-translation-debug');
  });

  it('checks Polish translations without authentication', () => {
    // Visit the Polish version
    cy.visit('http://localhost:3000/pl/organization-members');

    // Check what's actually being rendered
    cy.get('body', { timeout: 10000 })
      .should('exist')
      .then(($body) => {
        // Log the body content to see what's being rendered
        cy.log('Polish body content:', $body.text().substring(0, 1000));
      });

    // Check if we can find the main heading or title in Polish
    cy.get('h1, h2, h3, h4')
      .first()
      .should('exist')
      .then(($heading) => {
        cy.log('Polish first heading:', $heading.text());
      });

    // Check for Polish translations
    cy.get('body').then(($body) => {
      const bodyText = $body.text();

      if (bodyText.includes('Członkowie organizacji')) {
        cy.log('Found Polish translation: Członkowie organizacji');
      }
      if (bodyText.includes('Zaproś członka')) {
        cy.log('Found Polish translation: Zaproś członka');
      }
    });

    // Take a screenshot for debugging
    cy.screenshot('organization-members-polish-translation-debug');
  });
});
