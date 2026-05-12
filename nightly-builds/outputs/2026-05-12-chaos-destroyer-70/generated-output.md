[FILE: src/tracker/west-coast-swing-tracker/index.js]

This is a simple West Coast Swing progress tracker that allows Ben to record his lesson notes, choreography, and competition prep. It's built using JavaScript and will be stored in the nightly builds directory.

```javascript
import console from 'console';

class WestCoastSwingTracker {
  constructor() {
    this.notes = {};
    this.choreography = {};
    this.competitionPrep = {};

    // Initialize arrays to hold data
    this.notesArray = [];
    this.choreographyArray = [];
    this.competitionPrepArray = [];

    // Set up local storage for data persistence
    if (typeof localStorage !== 'undefined') {
      const storedNotes = localStorage.getItem('west-coast-swing-tracker-notes');
      const storedChoreography = localStorage.getItem('west-coast-swing-tracker-choreography');
      const storedCompetitionPrep = localStorage.getItem('west-coast-swing-tracker-competition-prep');

      if (storedNotes) {
        this.notesArray = JSON.parse(storedNotes);
        this.notes = Object.assign({}, ...this.notesArray.map((note) => ({ ...note })));
      }

      if (storedChoreography) {
        this.choreographyArray = JSON.parse(storedChoreography);
        this.choreography = Object.assign({}, ...this.choreographyArray.map((choreo) => ({ ...choreo })));
      }

      if (storedCompetitionPrep) {
        this.competitionPrepArray = JSON.parse(storedCompetitionPrep);
        this.competitionPrep = Object.assign({}, ...this.competitionPrepArray.map((prep) => ({ ...prep })));
      }
    }
  }

  // Function to add a new note
  addNote(title, content) {
    const newNote = { title, content };
    this.notesArray.push(newNote);
    localStorage.setItem('west-coast-swing-tracker-notes', JSON.stringify(this.notesArray));
    this.notes = Object.assign({}, ...this.notesArray.map((note) => ({ ...note })));
  }

  // Function to add choreography
  addChoreography(step, direction, music) {
    const newChoreo = { step, direction, music };
    this.choreographyArray.push(newChoreo);
    localStorage.setItem('west-coast-swing-tracker-choreography', JSON.stringify(this.choreographyArray));
    this.choreography = Object.assign({}, ...this.choreographyArray.map((choreo) => ({ ...choreo })));
  }

  // Function to add competition prep
  addCompetitionPrep(topic, content) {
    const newPrep = { topic, content };
    this.competitionPrepArray.push(newPrep);
    localStorage.setItem('west-coast-swing-tracker-competition-prep', JSON.stringify(this.competitionPrepArray));
    this.competitionPrep = Object.assign({}, ...this.competitionPrepArray.map((prep) => ({ ...prep })));
  }

  // Function to display tracker
  displayTracker() {
    console.log('Notes:');
    console.log(this.notes);
    console.log('\nChoreography:');
    console.log(this.choreography);
    console.log('\nCompetition Prep:');
    console.log(this.competitionPrep);
  }
}

export default WestCoastSwingTracker;
```

[FILE: src/tracker/west-coast-swing-tracker/index.html]

This is a simple HTML file to display the tracker data in a browser.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>West Coast Swing Tracker</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        #tracker {
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <h1>West Coast Swing Tracker</h1>
    <button onclick="track.displayTracker()">Display Tracker</button>
    <div id="tracker"></div>

    <script src="src/tracker/west-coast-swing-tracker/index.js"></script>
</body>
</html>
```

[FILE: src/tracker/west-coast-swing-tracker/README.md]

This is a README file to explain how to use and integrate the tracker.

```markdown
# West Coast Swing Tracker

This is a simple West Coast Swing progress tracker built using JavaScript. It allows Ben to record his lesson notes, choreography, and competition prep.

## How to Use

1. Open `index.html` in a browser to view the tracker data.
2. Click the "Display Tracker" button to display the current notes, choreography, and competition prep.
3. To add new data, click the corresponding buttons (e.g., "Add Note", "Add Choreography", etc.) and enter the required information.

## Integration Steps

1. Save `index.js` and `index.html` in the `src/tracker/west-coast-swing-tracker/` directory.
2. Run `npm install` to install any dependencies.
3. Open `index.html` in a browser to view the tracker data.

## Setup Needed

* Make sure Ben has access to a web browser and a stable internet connection.
* Ensure that local storage is enabled on Ben's device (if applicable).

## Example Data

To populate the tracker with sample data, try running `track.addNote("Lesson 1", "This was my first lesson.")` in the console before opening `index.html`.
```

[FILE: src/tracker/west-coast-swing-tracker/index.test.js]

This is a test file to ensure that the tracker functions as expected.

```javascript
import WestCoastSwingTracker from './index.js';

describe('West Coast Swing Tracker', () => {
    let track;

    beforeEach(() => {
        track = new WestCoastSwingTracker();
    });

    it('should display initial data', () => {
        const displayTrackerSpy = jest.spyOn(track, 'displayTracker');
        track.displayTracker();
        expect(displayTrackerSpy).toHaveBeenCalledTimes(1);
    });

    it('should add note successfully', () => {
        track.addNote("Lesson 2", "This was my second lesson.");
        const notes = track.notes;
        expect(notes.length).toBe(2);
    });
});
```

To run the tests, use `npm test` in the terminal.

Please let me know if you have any questions or need further clarification!
