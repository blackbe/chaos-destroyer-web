const fs = require('fs');
const path = require('path');

// Constants
const DATA_DIR = path.join(__dirname, 'data');
const READINGS_FILE = path.join(DATA_DIR, 'readings.json');
const BOOKS_FILE = path.join(DATA_DIR, 'books.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(READINGS_FILE)) {
  fs.writeFileSync(READINGS_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(BOOKS_FILE)) {
  fs.writeFileSync(BOOKS_FILE, JSON.stringify([], null, 2));
}

// Functions

function logReading(title, author, completed = true, notes = '') {
  const readings = JSON.parse(fs.readFileSync(READINGS_FILE, 'utf8'));
  const bookIndex = readings.findIndex((book) => book.title === title);
  if (bookIndex !== -1) {
    readings[bookIndex] = { title, author, completed, notes, dateRead: new Date().toISOString() };
  } else {
    readings.push({ title, author, completed, notes, dateRead: new Date().toISOString() });
  }
  fs.writeFileSync(READINGS_FILE, JSON.stringify(readings, null, 2));
  console.log('Book logged!');
}

function addBook(title, author, reason = '') {
  const books = JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf8'));
  const bookIndex = books.findIndex((book) => book.title === title);
  if (bookIndex !== -1) {
    books[bookIndex] = { title, author, reason, addedDate: new Date().toISOString() };
  } else {
    books.push({ title, author, reason, addedDate: new Date().toISOString() });
  }
  fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2));
  console.log('Book added!');
}

function viewProgress() {
  const readings = JSON.parse(fs.readFileSync(READINGS_FILE, 'utf8'));
  const books = JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf8'));
  
  console.log('\n=== BOOKS READ ===');
  readings.forEach((reading) => {
    console.log(`- ${reading.title} by ${reading.author} ${reading.completed ? '✓' : ''}`);
    if (reading.notes) console.log(`  Notes: ${reading.notes}`);
  });
  
  console.log('\n=== READING LIST ===');
  books.forEach((book) => {
    console.log(`- ${book.title} by ${book.author}`);
    if (book.reason) console.log(`  Reason: ${book.reason}`);
  });
  
  console.log(`\nTotal read: ${readings.length} | To read: ${books.length}`);
}

// CLI Interface

function printHelp() {
  console.log(`
Usage: node reading-tracker.js [command]

Commands:
  log <title> <author>    Log a book as read
  add <title> <author>     Add a book to reading list
  view                   View reading progress
  help                   Show this help
`);
}

const args = process.argv.slice(2);
const command = args[0];

if (command === 'log') {
  const [title, author, ...rest] = args.slice(1);
  if (!title || !author) printHelp();
  else logReading(title, author, true, rest.join(' '));
} else if (command === 'add') {
  const [title, author, ...rest] = args.slice(1);
  if (!title || !author) printHelp();
  else addBook(title, author, rest.join(' '));
} else if (command === 'view') {
  viewProgress();
} else {
  printHelp();
}
