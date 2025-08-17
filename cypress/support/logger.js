import path from 'path'

/**
 * Custom test logger that writes logs to both Cypress console and log files
 * Provides timestamped logging with error level support
 */
class TestLogger {
    /**
    * Constructor - Initializes logger with timestamped log file path
    */
    constructor() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.logPath = path.join(
            'cypress',
            'logs',
            `${Cypress.spec.name}-${timestamp}.log`
        );
        this.initialized = false;
    }

    /**
    * Initializes the log file by creating an empty file
    * Only runs once per logger instance
    */
    initialize() {
        if (this.initialized) return;

        cy.task('writeLog', {
            filePath: this.logPath,
            content: ''
        }, { log: false });

        this.initialized = true;
    }

    /**
    * Logs a message with timestamp to both file and Cypress console
    * @param {string} message - The message to log
    */
    log(message) {
        if (!this.initialized) {
            this.initialize();
        }

        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;

        cy.task('writeLog', {
            filePath: this.logPath,
            content: logMessage
        }, { log: false });

        cy.log(message);
    }

    /**
    * Logs an error message (prefixed with [ERROR])
    * @param {string} message - The error message to log
    */
    error(message) {
        return this.log(`[ERROR] ${message}`);
    }
}

const logger = new TestLogger();
export default logger;
