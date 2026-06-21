```javascript
const fs = require('fs');
const path = require('path');

function createEntry() {
  const timestamp = new Date().toISOString();
  const entryData = {
    id: crypto.randomUUID(),
    timestamp,
    title: '',
    author: '',
    completed: false,
  };

  // Create a new JSON file for the entry
  fs.writeFileSync(path.join(__dirname, 'entries', entryData.id + '.json'), JSON.stringify(entryData));

  console.log(`Entry created with ID ${entryData.id}`);
}

module.exports = createEntry;