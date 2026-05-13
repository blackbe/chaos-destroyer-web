[FILE: src/journal/index.js]

/**
 * Therapy Session Insight Extractor
 *
 * This script extracts insights from Ben's therapy session notes and tracks progress on self-confidence and ADHD.
 */

const fs = require('fs');
const path = require('path');

// Set up output directory
const outputDir = '/Users/benblack/.openclaw/workspace/nightly-builds/outputs/2026-05-13-chaos-destroyer-72/';

// Function to extract insights from notes
function extractInsights(note) {
  // Use natural language processing (NLP) library to analyze text
  const nlp = require('nlpjs');
  const text = note.body;

  // Extract keywords related to self-confidence and ADHD
  const confidences = ['self', 'confidence', 'adhd'];
  const adhds = ['ADHD', 'attention deficit hyperactivity disorder'];

  let confidenceScore = 0;
  let adhdScore = 0;

  for (const keyword of confidences) {
    if (text.includes(keyword)) {
      confidenceScore++;
    }
  }

  for (const keyword of adhds) {
    if (text.includes(keyword)) {
      adhdScore++;
    }
  }

  // Return extracted insights
  return { confidence: confidenceScore, adhd: adhdScore };
}

// Function to track progress over time
function trackProgress(insights) {
  // Load existing data from file
  const data = fs.readFileSync(path.join(outputDir, 'progress.json'), 'utf8');
  let progressData = JSON.parse(data);

  if (!progressData) {
    progressData = [];
  }

  // Add new insight to progress data
  progressData.push(insights);

  // Save updated progress data to file
  fs.writeFileSync(path.join(outputDir, 'progress.json'), JSON.stringify(progressData));
}

// Function to extract insights from a note and track progress
function processNote(note) {
  const insights = extractInsights(note);
  trackProgress(insights);

  // Return extracted insights
  return insights;
}

module.exports = { processNote };

[FILE: src/notes-parser.js]

/**
 * Notes Parser
 *
 * This script parses Ben's therapy session notes and extracts insights.
 */

const fs = require('fs');
const path = require('path');

// Function to parse a note
function parseNote(note) {
  // Use regular expressions to extract relevant information from the note text
  const regex = /Your self-confidence level for this week is: \d+%;
/g;

  let match;
  while ((match = regex.exec(note.body)) !== null) {
    return { confidenceLevel: parseInt(match[1]) };
  }

  // If no match found, return null
  return null;
}

module.exports = { parseNote };

[FILE: src/data.js]

/**
 * Data Store
 *
 * This script loads and manages Ben's therapy session data.
 */

const fs = require('fs');
const path = require('path');

// Load existing progress data from file
let progressData = [];
if (fs.existsSync(path.join(outputDir, 'progress.json'))) {
  progressData = JSON.parse(fs.readFileSync(path.join(outputDir, 'progress.json'), 'utf8'));
}

module.exports = { progressData };

[FILE: src/index.js]

/**
 * Main Script
 *
 * This script is the entry point for the Therapy Session Insight Extractor.
 */

const processNote = require('./notes-parser');
const data = require('./data');

// Function to run the script
function main() {
  // Load Ben's therapy session notes from file
  const notes = fs.readFileSync(path.join(outputDir, 'notes.json'), 'utf8');
  let note;
  while ((note = JSON.parse(notes)).body) {
    // Extract insights from the note and track progress
    const insights = processNote(note);

    // Print extracted insights to console
    console.log(`Confidence level: ${insights.confidence}%`);
    console.log(`ADHD score: ${insights.adhd}`);
  }
}

module.exports = main;

[FILE: README.md]

# Therapy Session Insight Extractor

A tool designed to help Ben organize his therapy session notes and track progress on self-confidence and ADHD.

## How to Use
1. Run the script using Node.js: `node src/index.js`
2. The script will parse Ben's therapy session notes, extract insights, and track progress over time.
3. The extracted insights will be printed to the console.

## Integration Steps

* Install required dependencies: `npm install nlpjs fs`
* Set up output directory: `/Users/benblack/.openclaw/workspace/nightly-builds/outputs/2026-05-13-chaos-destroyer-72/`

## Setup
1. Create a new file named `notes.json` in the output directory and add Ben's therapy session notes to it.
2. Run the script using Node.js.

## Sample Data

```json
[
  {
    "body": "Your self-confidence level for this week is: 80%"
  },
  {
    "body": "You have been struggling with ADHD symptoms lately."
  }
]
```

[FILE: src/loggers.js]

/**
 * Logger
 *
 * This script provides a logger class to handle errors and logs.
 */

class Logger {
  constructor() {
    this.errorFile = path.join(outputDir, 'error.log');
    this.infoFile = path.join(outputDir, 'info.log');
  }

  error(message) {
    fs.appendFileSync(this.errorFile, `${new Date().toISOString()} - ERROR - ${message}\n`);
  }

  info(message) {
    fs.appendFileSync(this.infoFile, `${new Date().toISOString()} - INFO - ${message}\n`);
  }
}

module.exports = Logger;

[FILE: src/index.js (continued)]

const processNote = require('./notes-parser');
const data = require('./data');
const logger = require('./loggers');

// Function to run the script
function main() {
  // Load Ben's therapy session notes from file
  const notes = fs.readFileSync(path.join(outputDir, 'notes.json'), 'utf8');
  let note;
  while ((note = JSON.parse(notes)).body) {
    try {
      // Extract insights from the note and track progress
      const insights = processNote(note);

      // Print extracted insights to console
      logger.info(`Confidence level: ${insights.confidence}%`);
      logger.info(`ADHD score: ${insights.adhd}`);

      // Log error if any
      if (error) {
        logger.error('Error occurred while processing note');
      }
    } catch (error) {
      logger.error('Error occurred while processing note:', error);
    }
  }
}

module.exports = main;
