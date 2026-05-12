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
