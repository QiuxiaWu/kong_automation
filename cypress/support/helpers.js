import { TIMEOUTS, DEFAULT_TIMEOUT, LOG_PREFIX } from "../config/constants";
import serviceData from "../fixtures/serviceData.json";
import serviceRouteData from "../fixtures/serviceRouteData.json"
import logger from '../support/logger'

/**
 * Navigates to the service creation page in the UI
 * Clicks through the necessary navigation links with appropriate timeouts
 */
export const navigateToServiceCreation = () => {
    logger.log(`${LOG_PREFIX} Navigating to service creation page`);
    cy.get('a[href="/default/services"]',{ timeout: TIMEOUTS.LONG }).should('exist').click({ force: true });
    cy.get('a[href="/default/services/create"]', {timeout: DEFAULT_TIMEOUT}).click({ force: true });
    logger.log(`${LOG_PREFIX} Successfully arrived at service creation page`);
}

/**
 * Navigates to the route creation page in the UI
 * Similar to service creation but for routes
 */
export const navigateToRouteCreation = () => {
    logger.log(`${LOG_PREFIX} Navigating to route creation page`);
    cy.get('a[href="/default/routes"]', { timeout: TIMEOUTS.LONG }).should('exist').click({ force: true });
    cy.get('a[href="/default/routes/create"]', { timeout: DEFAULT_TIMEOUT}).click({ force: true });
    logger.log(`${LOG_PREFIX} Successfully arrived at route creation page`);
}

/**
 * Generic Form submission handler
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Timeout for success message
 * @param {string} options.buttonText - Text of the submit button
 * @param {string} options.successMessage - Expected success message 
 */
export const submitForm = ( options = {}) => {
    const {
        timeout = TIMEOUTS.NOTIFICATION,
        buttonText = 'Save',
        successMessage = 'successfully created'
    } = options;

    logger.log(`${LOG_PREFIX} Attempting to submit form with button: "${buttonText}"`);
    cy.contains(buttonText, { DEFAULT_TIMEOUT })
        .should('exist')
        .click();
    
    logger.log(`${LOG_PREFIX} Waiting for success message: "${successMessage}"`);
    cy.contains(successMessage, { timeout})
        .should('be.visible');
    logger.log(`${LOG_PREFIX} Form submitted successfully`);
}

/**
 * Helper function to fill a form field with robust clearing and typing
 * @param {string} selector - CSS selector for the field
 * @param {string} value - Value to enter
 * @param {Object} options - Additional options
 */
const fillFormField = (selector, value, options = {}) => {
    const {
        timeout = TIMEOUTS.MEDIUM,
        shouldClear = true,
        forceClear = false,
        waitAfterClear = 200
    } = options;

    logger.log(`${LOG_PREFIX} Filling field: ${selector} with value: "${value}"`);
    cy.get(selector, { timeout: timeout})
        .should('exist')
        .then($el => {
            if (shouldClear) {
                logger.log(`${LOG_PREFIX} Clearing field: ${selector}`);
                const clearActions = [
                    () => cy.wrap($el).invoke('val', ''),
                    () => cy.wrap($el).clear({ force: forceClear}),
                    () => cy.wrap($el).type('{selectall}{backspace}'),
                    () => cy.wrap($el).trigger('change')
                ];
                
                clearActions.forEach(action => action())

                cy.wrap($el).should('have.value', '');

                if (waitAfterClear > 0) {
                    cy.wait(waitAfterClear);
                }
            } 
            if (value) {
                logger.log(`${LOG_PREFIX} Typing value: "${value}" into field: ${selector}`);
                cy.wrap($el).type(value);
            } 
        });        
};

/**
 * Generates a unique name with timestamp and random suffix
 * @param {string} prefix - Name prefix
 * @returns {string} Generated unique name
 */
const generateUniqueNameFunc = (prefix = 'test-service') => {
    const now = new Date();
    const timestamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
        '-',
        String(now.getHours()).padStart(2, '0'),
        String(now.getMinutes()).padStart(2, '0'),
        String(now.getSeconds()).padStart(2, '0')
    ].join('');
    const randomSuffix = Math.floor(Math.random() * 10000);
    const generatedName = `${prefix}-${timestamp}-${randomSuffix}`;
    logger.log(`${LOG_PREFIX} Generated unique name: ${generatedName}`);
    return generatedName;
};

/**
 * Fills out the service form with protocol configuration
 * @param {Object} options - Configuration options
 */
export const fillServiceForm = (options = {}) => {
    const {
        timeout = TIMEOUTS.MEDIUM, 
        shouldCheckRadio = true, 
        customData,
        generateUniqueName = false
    } = options

    logger.log(`${LOG_PREFIX} Starting to fill service form`);
    const data = { ...(customData || serviceData.protocolService) };

    if (generateUniqueName || !data.name) {
        data.name = generateUniqueNameFunc('test-service');
    }

    if (shouldCheckRadio) {
        logger.log(`${LOG_PREFIX} Selecting protocol radio button`);
        cy.get('[data-testid="gateway-service-protocol-radio"]', { timeout: timeout })
            .should('be.visible')
            .click({ force: true })
            .should('have.attr', 'aria-checked', 'true');
    }

    fillFormField('input[name="host"]', data.host, { timeout: timeout });
    fillFormField('input[name="port"]', data.port, { timeout: timeout, forceClear: true });
    fillFormField('input[name="path"]', data.path, { timeout: timeout });
    fillFormField('input[name="name"]', data.name, { timeout: timeout});
    logger.log(`${LOG_PREFIX} Service form filled successfully`);
}

/**
 * Selects a random service from the dropdown
 * @param {Object} options - Configuration options
 */
const selectService = (options = {}) => {
    const {
        timeout = TIMEOUTS.MEDIUM
    } = options;

    cy.log(`${LOG_PREFIX} Selecting service from dropdown`);
    cy.get('[data-testid="route-form-service-id"]', {timeout: timeout })
        .click({force: true});

    cy.get('[data-testid^="select-item-"]')
        .then(($items) => {
            if ($items.length === 0) {
                logger.log(`${LOG_PREFIX} No services available for selection`);
                throw new Error('No service exists, please create a service first');
            }
            const randomIndex = Math.floor(Math.random() * $items.length);
            const selectedService = $items.eq(randomIndex).text().trim();
            cy.log(`${LOG_PREFIX} Randomly selected service: ${selectedService}`);
            return cy.wrap($items.eq(randomIndex)); 
        })
        .click({ force: true });
}

/**
 * Selects HTTP methods from multi-select dropdown
 * @param {Array<string>} methods - Array of methods to select (e.g., ['GET', 'POST'])
 */
const selectMethods = (methods = []) => {
    logger.log(`${LOG_PREFIX} Selecting HTTP methods: ${methods.join(', ')}`);
    cy.get('[data-testid="multiselect-trigger"]').click();

    methods.forEach(method => {
        logger.log(`${LOG_PREFIX} Selecting method: ${method}`);
        cy.contains('[role="option"]', method)
        .click({ force: true });
    });

    cy.get('body').click(10, 10);
    logger.log(`${LOG_PREFIX} Methods selection completed`);
};

/**
 * Fills out the basic route configuration form
 * @param {Object} options - Configuration options
 */

export const fillServiceRouteBasicConfigurationForm = (options = {}) => {
    const {
        timeout = TIMEOUTS.MEDIUM,
        shouldCheckRadio = true,
        customdata,
        generateUniqueName = false     
    } = options

    logger.log(`${LOG_PREFIX} Starting to fill basic route configuration`);
    const data = { ...(customdata || serviceRouteData.basicRouteConfiguration) };

    if ( generateUniqueName || !data.name ) {
        data.name = generateUniqueNameFunc('test-route');
    }

    if (shouldCheckRadio) {
        logger.log(`${LOG_PREFIX} Selecting basic configuration type`);
        cy.get('[data-testid="route-form-config-type-basic"]', { timeout: timeout })
            .should('exist')
            .click({ force: true })
            .should('have.attr', 'aria-checked', 'true');
    }

    fillFormField('[data-testid="route-form-name"]', data.name, { timeout: timeout, forceClear: true });
    
    selectService();

    fillFormField('[data-testid="route-form-paths-input-1"]', data.path, { timeout: timeout });
    fillFormField('[data-testid="route-form-hosts-input-1"]', data.host, { timeout: timeout });
    
    selectMethods(['PUT']);
    logger.log(`${LOG_PREFIX} Basic route configuration filled successfully`);  
}

/**
 * Fills out the service form with full URL configuration
 * @param {Object} options - Configuration options
 */

export const fillServiceFormWithFullUrl = (options = {}) => {
    const {
        timeout = TIMEOUTS.MEDIUM,
        shouldCheckRadio = true,
        customData,
        generateUniqueName = false
    } = options

    logger.log(`${LOG_PREFIX} Starting to fill service form with full URL`);
    const data = { ...(customData || serviceData.fullUrlService) };

    if (generateUniqueName || !data.name) {
        data.name = generateUniqueNameFunc('test-service')
    }

    if (shouldCheckRadio) {
        logger.log(`${LOG_PREFIX} Selecting URL radio button`);
        cy.get('[data-testid="gateway-service-url-radio"]', { timeout: timeout })
            .should('be.visible')
            .click({ force: true })
            .should('have.attr', 'aria-checked', 'true');
    }

    fillFormField('input[name="url"]', data.url, { timeout: timeout });
    fillFormField('input[name="name"]', data.name, { timeout: timeout});
    logger.log(`${LOG_PREFIX} Service form with full URL filled successfully`);
}