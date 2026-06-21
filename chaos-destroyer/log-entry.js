```javascript
const fs = require('fs');
const path = require('path');

// Get today's date and create a new entry in the logbook
function createLogEntry() {
  const currentDate = new Date();
  const logFilePath = path.join(__dirname, '../logs', `${currentDate.toISOString().split('T')[0]}.js`);

  // Create a new file for the current day
  fs.writeFileSync(logFilePath, `Date: ${currentDate.toISOString().split('T')[0]}\n`);

  // Prompt user for details about their reading activity
  console.log("Enter details about your reading activity:");
  const title = prompt("Title of book/article read: ");
  const author = prompt("Author of book/article read: ");
  const duration = prompt("Duration spent reading (in hours): ");

  // Write log entry to file
  fs.appendFileSync(logFilePath, `Title: ${title}\n` +
    `Author: ${author}\n` +
    `Duration: ${duration}\n\n`);
}

// Call createLogEntry function when script is run
createLogEntry();