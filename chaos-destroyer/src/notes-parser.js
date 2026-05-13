const fs = require('fs');
const path = require('path');

function parseNote(note) {
  const regex = /Your self-confidence level for this week is: (\d+)%/g;
  let match;
  while ((match = regex.exec(note.body)) !== null) {
    return { confidenceLevel: parseInt(match[1]) };
  }
  return null;
}

module.exports = { parseNote };
