[FILE: ~/.openclaw/workspace/chaos-destroyer/src/journal/index.js]

import express from "express";
import app from "./app";

app.use(express.json());

const journal = [];

const addEntry = (date, mood, focus, wins, blockers) => {
  const entry = { date, mood, focus, wins, blockers };
  journal.push(entry);
  console.log("New entry added!");
};

const getEntries = () => {
  return journal;
};

app.post("/add-entry", (req, res) => {
  const { date, mood, focus, wins, blockers } = req.body;

  if (!date || !mood || !focus || !wins || !blockers) {
    console.log("Invalid request body!");
    res.status(400).send({ message: "Please provide all required fields!" });
    return;
  }

  addEntry(date, mood, focus, wins, blockers);
  res.send({ message: "Entry added successfully!" });
});

app.get("/get-entries", (req, res) => {
  const entries = getEntries();
  if (!entries.length) {
    console.log("No entries found!");
    res.status(404).send({ message: "No entries found!" });
  } else {
    res.json(entries);
  }
});

export default app;
[FILE: ~/.openclaw/workspace/chaos-destroyer/src/journal/model.js]

class JournalEntry {
  constructor(date, mood, focus, wins, blockers) {
    this.date = date;
    this.mood = mood;
    this.focus = focus;
    this.wins = wins;
    this.blockers = blockers;
  }

  toString() {
    return `Date: ${this.date}, Mood: ${this.mood}, Focus: ${this.focus}, Wins: ${this.wins}, Blockers: ${this.blockers}`;
  }
}

export default JournalEntry;
[FILE: ~/.openclaw/workspace/chaos-destroyer/src/journal/reducer.js]

const initialState = [];

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "ADD_ENTRY":
      return [...state, new JournalEntry(action.date, action.mood, action.focus, action.wins, action.blockers)];
    default:
      return state;
  }
};

export default reducer;
[FILE: ~/.openclaw/workspace/chaos-destroyer/src/journal/store.js]

import express from "express";
import app from "./app";
import { reducer } from "./reducer";

const store = {
  states: [],
  dispatch: (action) => {
    switch (action.type) {
      case "ADD_ENTRY":
        this.states.push(action.payload);
        break;
      default:
        break;
    }
  },
};

store.dispatch({
  type: "ADD_ENTRY",
  payload: new JournalEntry("2026-05-05", "Good", "Focused", ["Task completed"], []),
});

export default store;

[FILE: ~/.openclaw/workspace/chaos-destroyer/src/journal/app.js]

import express from "express";
import app from "./index";

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
[FILE: ~/.openclaw/workspace/chaos-destroyer/src/journal/templates/index.html]

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ADHD & energy management journal</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin-top: 20px;
    }
  </style>
</head>

<body>
  <h1 style="font-size: 36px; color: #0097a7;">ADHD & energy management journal</h1>
  <form id="add-entry-form">
    <label for="date">Date:</label>
    <input type="date" id="date" name="date" />
    <br />
    <label for="mood">Mood:</label>
    <select id="mood" name="mood">
      <option value="Good">Good</option>
      <option value="Bad">Bad</option>
    </select>
    <br />
    <label for="focus">Focus:</label>
    <input type="text" id="focus" name="focus" placeholder="Focused or unfocused" />
    <br />
    <label for="wins">Wins:</label>
    <input type="text" id="wins" name="wins" placeholder="List of wins" />
    <br />
    <label for="blockers">Blockers:</label>
    <input type="text" id="blockers" name="blockers" placeholder="List of blockers" />
    <br />
    <button id="submit-btn" type="submit">Add entry</button>
  </form>

  <h2>Entries:</h2>
  <ul id="entries-list">
    <!-- List will be populated dynamically -->
  </ul>

  <script src="app.js"></script>
</body>
</html>
[FILE: ~/.openclaw/workspace/chaos-destroyer/src/journal/templates/index.html]

import { fetch } from "node-fetch";
const url = "/add-entry";

fetch(url)
  .then((response) => response.json())
  .then((data) => {
    if (data.type === "ADD_ENTRY") {
      const entryList = document.getElementById("entries-list");
      const newEntryHTML = `
        <li>${data.payload.toString()}</li>
      `;
      entryList.innerHTML += newEntryHTML;
    }
  })
  .catch((error) => console.error(error));

document.getElementById("submit-btn").addEventListener("click", (event) => {
  event.preventDefault();
  const form = document.getElementById("add-entry-form");
  const formData = new FormData(form);
  fetch(url, { method: "POST", body: formData })
    .then((response) => response.json())
    .then((data) => {
      if (data.type === "ADD_ENTRY") {
        console.log(data.message);
      }
    })
    .catch((error) => console.error(error));
});
[FILE: ~/.openclaw/workspace/chaos-destroyer/src/journal/README.md]

# ADHD & energy management journal

A simple, lightweight web application designed to help you track your mood, focus, wins, and blockers on a daily basis.

## Getting Started

1. Clone this repository.
2. Install the required dependencies using npm.
3. Run `npm start` to start the server.
4. Open your web browser and navigate to `http://localhost:3000`.
5. Fill in the form with your daily data and submit it.

## Usage

The journal application allows you to add new entries by submitting a POST request to `/add-entry`. Each entry is represented as an object with four properties: `date`, `mood`, `focus`, and `wins`/`blockers`.

Example JSON payload:
```json
{
  "date": "2026-05-05",
  "mood": "Good",
  "focus": "Focused",
  "wins": ["Task completed"],
  "blockers": []
}
```
The server will respond with a success message if the entry is added successfully.

## Integration

This application integrates with other tools, such as your calendar and email client, to provide a more comprehensive view of your daily activities. However, this feature is not currently implemented.

## Setup

To run the application, make sure you have Node.js installed on your system. Then, clone this repository and navigate to it in your terminal/command prompt. Run `npm install` to install the required dependencies, and then run `npm start` to start the server.

Note: This is a basic implementation, and you may want to add more features and functionality as needed.
