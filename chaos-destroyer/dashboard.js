```javascript
const fs = require('fs');
const path = require('path');

// Get all log files in the logs directory
function getLogFiles() {
  const logDirPath = path.join(__dirname, '../logs');
  const logFiles = fs.readdirSync(logDirPath).filter(file => file.endsWith('.js'));

  return logFiles;
}

// Visualize progress on dashboard
function dashboard() {
  const logFiles = getLogFiles();
  let totalHoursRead = 0;

  logFiles.forEach(logFile => {
    const logDate = logFile.split('.')[0];
    const logContent = fs.readFileSync(path.join(__dirname, '../logs', logFile), 'utf8');
    const hoursRead = parseInt(logContent.split('Duration: ')[1].split('\n')[0]);

    totalHoursRead += hoursRead;
  });

  console.log(`\nTotal Hours Read: ${totalHoursRead}`);
}

// Call dashboard function when script is run
dashboard();