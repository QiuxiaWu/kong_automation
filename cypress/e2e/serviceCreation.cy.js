import { 
    fillServiceForm, 
    fillServiceFormWithFullUrl, 
    navigateToServiceCreation, 
    submitForm 
} from '../support/helpers';

describe('Create Gateway Service', () => {

    beforeEach(() => {
        cy.loginToKongManager();
        cy.visit('/default/overview');
        navigateToServiceCreation();
    });

    it('create service without full url', () => {
        fillServiceForm({ generateUniqueName: true });
        submitForm();
    });
    
    it('create service with full url', () => {
        fillServiceFormWithFullUrl({ generateUniqueName: true });
        submitForm();
    });
});