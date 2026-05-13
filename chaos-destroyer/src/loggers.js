const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.errorFile = path.join(__dirname, 'error.log');
    this.infoFile = path.join(__dirname, 'info.log');
  }

  error(message) {
    fs.appendFileSync(this.errorFile, `${new Date().toISOString()} - ERROR - ${message}\n`);
  }

  info(message) {
    fs.appendFileSync(this.infoFile, `${new Date().toISOString()} - INFO - ${message}\n`);
  }
}

module.exports = Logger;
