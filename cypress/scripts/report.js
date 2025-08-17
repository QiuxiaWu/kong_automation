// @ts-ignore
const { merge } = require('mochawesome-merge');
const generator = require('mochawesome-report-generator');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
require('dotenv').config({ path: path.join(__dirname, '../../.env') })

/**
 * Merges multiple Mochawesome JSON reports into a single report object 
 * @returns {Promise<Object>} Merged report object containing all test results
 */
async function mergeReports() {
    const jsonDir = path.resolve(__dirname, '../reports');
    const jsonFiles = glob.sync(path.join(jsonDir, '*.json'));

    try {
        const merged = await merge({ files: jsonFiles });
        console.log(`Merge successful, contains ${merged.stats.tests} test cases`);
        return merged;
    } catch (error) {
        console.error('Merged failed:', error);
        throw new Error('Report merge failed: ' + error.message);
    }
}

/**
 * Generates an HTML test report from merged JSON test data
 * @param {object} mergedReport - The merged report object from mergeReports()
 * @returns {Promise<string> Path to the generated HTML report}
 */
async function generateReport(mergedReport) {
    const reportDir = path.resolve(__dirname, '../reports/mochawesome-merged');

    if (fs.existsSync(reportDir)) {
        fs.rmSync(reportDir, { recursive: true });
    }
    fs.mkdirSync(reportDir, { recursive: true });

    fs.writeFileSync(
        path.join(reportDir, 'merged-raw.json'),
        JSON.stringify(mergedReport, null, 2)
    );

    try {
        await generator.create(mergedReport, {
            reportDir,
            reportTitle: 'Cypress Test report',
            reportFilename: 'index',
            overwrite: true,
            cdn: true,
            charts: true
        });

        const htmlPath = path.join(reportDir, 'index.html');
        if (!fs.existsSync(htmlPath)) {
            throw new Error('HTML generation failed: No output file detected');
        }

        console.log(`Report generated at ${htmlPath}`);
        return htmlPath;
    } catch (error) {
        console.error('Generator error details', error.stack);
        throw error;
    }
}

/**
 * Asynchronously sends an email with an HTML report attachment using Nodemailer
 * @param {string} htmlReportPath - Path to the HTML report file to be attached 
 * @returns {Promise} Resolves with email sending info, rejects on error
 * @throws {Error} If the report file doesn't exist or email sending fails
 */
async function sendEmail(htmlReportPath) {
    if (!fs.existsSync(htmlReportPath)) {
        throw new Error(`Email attachment not found: ${htmlReportPath}`);
    }
    if (!process.env.SMTP_PASSWORD) {
        throw new Error('SMTP_PASSWORD is missing in .env file');
    }

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.126.com',
            port: 465,
            secure: true,
            auth: {
                user: 'kong_test@126.com',
                pass: process.env.SMTP_PASSWORD
            }
        });

        const mailOptions = {
            from: '"Cypress Test" <kong_test@126.com>',
            to: '772589799@qq.com',
            subject: `Cypress Test Report_${new Date().toLocaleDateString()}`,
            text: 'Testing completed. See HTML report in attachments.',
            attachments: [{
                filename: `cypress-report-${new Date().toISOString().slice(0, 10)}.html`,
                path: htmlReportPath,
                contentType: 'text/html'
            }]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully. Message ID:', info.messageId);
        return info;
    } catch (error) {
        console.error('Failed to send email:', error.message);
        throw error;
    }
}

/**
 * Main asynchronous function that orchestrates the report processing workflow.
 * It sequentially merges reports, generates an HTML report, and sends it via email.
 * Handles any errors that occur during the process.
 */
async function main() {
    try {

        console.log('=== Starting report processing ===');
        const merged = await mergeReports();
        const htmlPath = await generateReport(merged);
        await sendEmail(htmlPath);

        console.log('=== Processing completed successfully ===');
    } catch (error) {
        console.error('!!! Processing failed', error.message);
        process.exit(1);
    }
}

main()