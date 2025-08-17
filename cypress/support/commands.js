// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })


Cypress.Commands.add('loginToKongManager', () => {
    const username = Cypress.env('KONG_MANAGER_USERNAME')
    const password = Cypress.env('KONG_MANAGER_PASSWORD')

    cy.session('kong-login', () => {

        cy.visit('/login');
        cy.document().its('readyState').should('eq', 'complete');
        
        cy.get('#username', { timeout: 60000 }).should('be.visible');

        cy.get('input[id="username"]').type(username);
        cy.get('input[id="password"]').type(password, { log: false });
        cy.get('button[type="submit"]').click();

        cy.url().should('include', '/default/overview');
    });
});