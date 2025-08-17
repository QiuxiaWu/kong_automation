import { 
    fillServiceRouteBasicConfigurationForm,
    navigateToRouteCreation,
    submitForm 
} from '../support/helpers';

describe('Create service route', () => {

    beforeEach(() => {
        cy.loginToKongManager();
        cy.visit('/default/overview');
        navigateToRouteCreation();
    });

    it('test basic route configuration', () =>{
        fillServiceRouteBasicConfigurationForm({  generateUniqueName: true });
        submitForm();
    })
});