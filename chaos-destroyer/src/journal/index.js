import moment from 'moment';
import JournalEntry from './JournalEntry';

class Journal {
  constructor() {
    this.entries = [];
  }

  // Add a new entry to the journal
  addEntry(entry) {
    this.entries.push(new JournalEntry(entry));
  }

  // Get all entries in the journal
  getEntries() {
    return this.entries;
  }
}

// Journal Entry class
class JournalEntry {
  constructor(entry) {
    this.id = Date.now();
    this.date = moment().format('YYYY-MM-DD');
    this.mood = entry.mood;
    this.focus = entry.focus;
    this.wins = entry.wins;
    this.blockers = entry.blockers;
  }

  // Display the journal entry in a readable format
  display() {
    return `
      ${this.date}:
      Mood: ${this.mood}
      Focus: ${this.focus}
      Wins: ${this.wins}
      Blockers: ${this.blockers}
    `;
  }
}

// Initialize the journal
const journal = new Journal();

// Function to save the journal entries to a file
function saveJournal() {
  const data = [];
  journal.getEntries().forEach((entry) => {
    data.push({
      id: entry.id,
      date: entry.date.format('YYYY-MM-DD'),
      mood: entry.mood,
      focus: entry.focus,
      wins: entry.wins,
      blockers: entry.blockers,
    });
  });

  // Save the journal entries to a JSON file
  fs.writeFileSync('./journal.json', JSON.stringify(data, null, 2));
}

// Function to load the journal from a file
function loadJournal() {
  try {
    const data = fs.readFileSync('./journal.json', 'utf8');
    journal.getEntries().forEach((entry) => {
      // Parse the JSON data and update the entry objects
      const parsedData = JSON.parse(data);
      parsedData.forEach((parsedEntry) => {
        const newEntry = new JournalEntry({
          id: parsedEntry.id,
          date: moment(parsedEntry.date, 'YYYY-MM-DD').format('YYYY-MM-DD'),
          mood: parsedEntry.mood,
          focus: parsedEntry.focus,
          wins: parsedEntry.wins,
          blockers: parsedEntry.blockers,
        });
        journal.addEntry(newEntry);
      });
    });
  } catch (error) {
    console.error(error);
  }
}

// Load the journal from a file when the program starts
loadJournal();

// Function to save the journal entries to a file when the user clicks the 'Save' button
function save() {
  saveJournal();
  alert('Journal saved!');
}

// Display the journal entries in an HTML table
const table = document.createElement('table');
journal.getEntries().forEach((entry) => {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${entry.date}</td>
    <td>${entry.mood}</td>
    <td>${entry.focus}</td>
    <td>${entry.wins}</td>
    <td>${entry.blockers}</td>
  `;
  table.appendChild(row);
});

// Append the table to the HTML document
document.body.appendChild(table);

// Set up event listeners for saving and loading the journal
document.getElementById('save-button').addEventListener('click', save);
document.getElementById('load-button').addEventListener('click', loadJournal);
