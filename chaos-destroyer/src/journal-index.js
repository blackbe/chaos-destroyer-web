/**
 * Therapy Session Insight Extractor
 *
 * This script extracts insights from Ben's therapy session notes and tracks progress on self-confidence and ADHD.
 */

const fs = require('fs');
const path = require('path');

// Function to extract insights from notes
function extractInsights(note) {
  const text = note.body;
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

  return { confidence: confidenceScore, adhd: adhdScore };
}

// Function to track progress over time
function trackProgress(insights) {
  const progressFile = path.join(__dirname, 'progress.json');
  let progressData = [];
  
  if (fs.existsSync(progressFile)) {
    progressData = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
  }

  progressData.push(insights);
  fs.writeFileSync(progressFile, JSON.stringify(progressData, null, 2));
}

// Function to extract insights from a note and track progress
function processNote(note) {
  const insights = extractInsights(note);
  trackProgress(insights);
  return insights;
}

module.exports = { processNote };
