[FILE: src/journal/index.js]

/**
 * ADHD & energy management journal - Daily mood, focus, wins, blockers
 */

// Import required modules
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

[FILE: src/components/JournalTable.js]

import React from 'react';
import JournalEntry from './JournalEntry';

const JournalTable = () => {
  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Mood</th>
          <th>Focus</th>
          <th>Wins</th>
          <th>Blockers</th>
        </tr>
      </thead>
      <tbody>
        {journal.getEntries().map((entry) => (
          <JournalEntry key={entry.id} entry={entry} />
        ))}
      </tbody>
    </table>
  );
};

export default JournalTable;

[FILE: src/components/JournalEntry.js]

import React from 'react';

const JournalEntry = ({ entry }) => {
  return (
    <tr>
      <td>{entry.date}</td>
      <td>{entry.mood}</td>
      <td>{entry.focus}</td>
      <td>{entry.wins}</td>
      <td>{entry.blockers}</td>
    </tr>
  );
};

export default JournalEntry;

[FILE: src/index.js]

import React from 'react';
import JournalTable from './components/JournalTable';

const App = () => {
  return (
    <div>
      <h1>ADHD & energy management journal</h1>
      <JournalTable />
      <button id="save-button">Save</button>
      <button id="load-button">Load</button>
    </div>
  );
};

export default App;

[FILE: src/main.js]

import React from 'react';
import ReactDOM from 'react-dom';
import App from './index';

const rootElement = document.getElementById('root');

ReactDOM.render(<App />, rootElement);

[FILE: README.md]

# ADHD & energy management journal

This is a simple web-based application for tracking your daily mood, focus, wins, and blockers. It uses React and JavaScript to create an interactive table that displays your journal entries.

## How to use it

1. Open the `index.html` file in a web browser.
2. Click on the "Save" button to save your current entry to a JSON file.
3. Click on the "Load" button to load saved entries from a JSON file.
4. The table will display all of your journal entries, with each row representing a single day.

## Integration steps

1. Create a new folder for this project: `~/openclaw/workspace/chaos-destroyer/journal`
2. Copy the files into the folder: `~/.openclaw/workspace/chaos-destroyer/journal`
3. Open the `index.html` file in a web browser.

## Setup needed

* None required.

## Error handling and logging

The application includes basic error handling and logging using JavaScript's built-in `console.error()` function. If an error occurs while loading or saving the journal, it will be displayed in the console.

## Example data

Here is some sample data to get you started:

```json
[
  {
    "id": 1643723900,
    "date": "2022-02-01",
    "mood": "Good",
    "focus": "Yes",
    "wins": "1 task completed",
    "blockers": ""
  },
  {
    "id": 1643723910,
    "date": "2022-02-02",
    "mood": "Bad",
    "focus": "No",
    "wins": "",
    "blockers": "Lost focus"
  }
]
```
