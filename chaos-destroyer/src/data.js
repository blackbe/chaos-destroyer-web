const fs = require('fs');
const path = require('path');

let progressData = [];
const progressFile = path.join(__dirname, 'progress.json');

if (fs.existsSync(progressFile)) {
  progressData = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
}

module.exports = { progressData };
