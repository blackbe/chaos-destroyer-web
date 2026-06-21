```javascript
const fs = require('fs');
const path = require('path');

function markAsCompleted(entryId) {
  const entryData = JSON.parse(fs.readFileSync(path.join(__dirname, 'entries', `${entryId}.json`), 'utf8'));

  // Update the completed status of the entry
  entryData.completed = true;

  fs.writeFileSync(path.join(__dirname, 'entries', `${entryId}.json`), JSON.stringify(entryData));

  console.log(`Entry ${entryId} marked as completed`);
}

module.exports = markAsCompleted;