```javascript
const fs = require('fs');
const path = require('path');

// Get all log files in the logs directory
function getLogFiles() {
  const logDirPath = path.join(__dirname, '../logs');
  const logFiles = fs.readdirSync(logDirPath).filter(file => file.endsWith('.js'));

  return logFiles;
}

// View all logs
function viewLogs() {
  const logFiles = getLogFiles();
  console.log("Your Reading Log:");
  logFiles.forEach(logFile => {
    const logDate = logFile.split('.')[0];
    const logContent = fs.readFileSync(path.join(__dirname, '../logs', logFile), 'utf8');
    console.log(`\n${logDate}:\n${logContent}`);
  });
}

// Call viewLogs function when script is run
viewLogs();