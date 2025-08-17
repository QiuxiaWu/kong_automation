const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');

const writeLog = ({ filePath, content }) => {
  const logDir = path.dirname(filePath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  fs.appendFileSync(filePath, content);
  return null;
};

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8002',
    experimentalRunAllSpecs: true,
    // setupNodeEvents(on, config) {
    //   require('cypress-grep/src/plugin')(config)
    //   return config
    // },
    env: {
      KONG_MANAGER_USERNAME: 'kong_admin',
      KONG_MANAGER_PASSWORD: 'handyshake',
      grepFilterSpecs: true,
      grepOmitFiltered: true,
    },
    setupNodeEvents(on, config) {
      on('task', {
        writeLog: (options) => writeLog(options)
      });
    },
  },
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: false,
    html: false,
    json: true,
    timestamp: 'mmddyyyy_HHMMss'
  }
});
