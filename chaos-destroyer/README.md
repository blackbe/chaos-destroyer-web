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
