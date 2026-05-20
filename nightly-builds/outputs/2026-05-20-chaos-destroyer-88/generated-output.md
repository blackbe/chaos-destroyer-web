[FILE: src/career-tracker/index.js]

/**
 * Career Progression Tracker
 *
 * This tool helps Ben track his career growth and skills learned.
 */

import { v4 as uuidv4 } from 'uuid';

class CareerTracker {
  constructor() {
    this.entries = [];
  }

  addEntry(jobTitle, company, startDate, endDate) {
    const entry = {
      id: uuidv4(),
      jobTitle,
      company,
      startDate,
      endDate,
    };

    this.entries.push(entry);

    return entry;
  }

  getEntries() {
    return this.entries;
  }

  updateEntry(id, updatedFields) {
    const index = this.entries.findIndex((entry) => entry.id === id);
    if (index !== -1) {
      Object.assign(this.entries[index], updatedFields);
    }
  }

  deleteEntry(id) {
    const index = this.entries.findIndex((entry) => entry.id === id);
    if (index !== -1) {
      this.entries.splice(index, 1);
    }
  }
}

export default CareerTracker;
[FILE: src/career-tracker/data.js]

/**
 * Sample data for the career tracker
 */

const sampleData = [
  {
    id: 'job-1',
    jobTitle: 'Software Engineer',
    company: 'ABC Inc.',
    startDate: '2020-01-01',
    endDate: '2022-12-31',
  },
  {
    id: 'job-2',
    jobTitle: 'Senior Software Engineer',
    company: 'XYZ Corp.',
    startDate: '2023-01-01',
    endDate: null,
  },
];

export default sampleData;
[FILE: src/career-tracker/index.test.js]

/**
 * Unit tests for the career tracker
 */

import CareerTracker from './index.js';

describe('CareerTracker', () => {
  it('should create a new entry', async () => {
    const tracker = new CareerTracker();
    const entry = await tracker.addEntry(
      'Software Engineer',
      'ABC Inc.',
      '2020-01-01',
      '2022-12-31'
    );

    expect(entry.id).toBe(uuidv4());
    expect(entry.jobTitle).toBe('Software Engineer');
    expect(entry.company).toBe('ABC Inc.');
    expect(entry.startDate).toBe('2020-01-01');
    expect(entry.endDate).toBe('2022-12-31');
  });

  it('should retrieve all entries', async () => {
    const tracker = new CareerTracker();
    for (const entry of sampleData) {
      await tracker.addEntry(entry.jobTitle, entry.company, entry.startDate, entry.endDate);
    }

    expect(tracker.getEntries()).toEqual(sampleData.map((entry) => ({ ...entry })));
  });

  it('should update an entry', async () => {
    const tracker = new CareerTracker();
    const entry = await tracker.addEntry(
      'Software Engineer',
      'ABC Inc.',
      '2020-01-01',
      '2022-12-31'
    );

    await tracker.updateEntry(entry.id, { endDate: '2025-12-31' });

    expect(tracker.getEntries()).toEqual([
      {
        id: entry.id,
        jobTitle: 'Software Engineer',
        company: 'ABC Inc.',
        startDate: '2020-01-01',
        endDate: '2025-12-31',
      },
    ]);
  });

  it('should delete an entry', async () => {
    const tracker = new CareerTracker();
    const entry = await tracker.addEntry(
      'Software Engineer',
      'ABC Inc.',
      '2020-01-01',
      '2022-12-31'
    );

    await tracker.deleteEntry(entry.id);

    expect(tracker.getEntries()).toEqual([]);
  });
});
[FILE: src/career-tracker/index.html]

/**
 * HTML template for the career tracker
 */

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Career Tracker</title>
  <style>
    body {
      font-family: Arial, sans-serif;
    }
  </style>
</head>
<body>
  <h1>Career Tracker</h1>
  <button id="add-entry-btn">Add Entry</button>
  <button id="update-entry-btn">Update Entry</button>
  <button id="delete-entry-btn">Delete Entry</button>

  <div id="entry-list"></div>

  <script src="index.js"></script>
  <script src="data.js"></script>
  <script>
    const tracker = new CareerTracker();
    const entryList = document.getElementById('entry-list');

    addEntryBtn.addEventListener('click', async () => {
      const jobTitle = prompt('Enter job title');
      const company = prompt('Enter company name');
      const startDate = prompt('Enter start date (YYYY-MM-DD)');
      const endDate = prompt('Enter end date (YYYY-MM-DD)');

      const entry = await tracker.addEntry(jobTitle, company, startDate, endDate);
      const entryHtml = `
        <p id="entry-${entry.id}">
          ${entry.jobTitle}
          (${company})
          (${startDate}) - (${endDate ? `${endDate}` : 'Present'})
        </p>
      `;

      entryList.innerHTML += entryHtml;
    });

    updateEntryBtn.addEventListener('click', async () => {
      const id = prompt('Enter entry ID');
      const updatedFields = await tracker.updateEntry(id, { endDate: '2025-12-31' });
      console.log(updatedFields);
    });

    deleteEntryBtn.addEventListener('click', async () => {
      const id = prompt('Enter entry ID');
      await tracker.deleteEntry(id);
      console.log(tracker.getEntries());
    });
  </script>
</body>
</html>

[FILE: src/career-tracker/README.md]

# Career Tracker

A simple career progression tracker built with JavaScript.

## How to use it

1. Run `npm install` in the project directory.
2. Open `index.html` in a web browser.
3. Fill out the entry form and click "Add Entry".
4. Update an existing entry by clicking "Update Entry" and entering the entry ID.
5. Delete an entry by clicking "Delete Entry" and entering the entry ID.

## Integration steps

1. Install Node.js and npm on your machine.
2. Clone this repository or download the source code.
3. Run `npm install` to install dependencies.
4. Open `index.html` in a web browser.

## Setup

* Make sure you have Node.js and npm installed on your machine.
* Create a new directory for your project if one doesn't exist already.
* Clone this repository or download the source code into the new directory.
* Run `npm install` to install dependencies.

[FILE: src/career-tracker/package.json]

{
  "name": "career-tracker",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {}
}

[FILE: src/career-tracker/README.md]

# Career Tracker

A simple career progression tracker built with JavaScript.

## How to use it

1. Run `npm install` in the project directory.
2. Open `index.html` in a web browser.
3. Fill out the entry form and click "Add Entry".
4. Update an existing entry by clicking "Update Entry" and entering the entry ID.
5. Delete an entry by clicking "Delete Entry" and entering the entry ID.

## Integration steps

1. Install Node.js and npm on your machine.
2. Clone this repository or download the source code.
3. Run `npm install` to install dependencies.
4. Open `index.html` in a web browser.

## Setup

* Make sure you have Node.js and npm installed on your machine.
* Create a new directory for your project if one doesn't exist already.
* Clone this repository or download the source code into the new directory.
* Run `npm install` to install dependencies.
