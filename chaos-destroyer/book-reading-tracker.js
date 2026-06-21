```javascript
const fs = require('fs');
const path = require('path');

// Data storage file
const dataFilePath = path.join(process.env.USERPROFILE, '.openclaw', 'workspace', 'nightly-builds', 'outputs', `2026-06-16-chaos-destroyer-94`, 'book-reading-tracker.json`);

class BookReadingTracker {
  constructor() {
    this.data = this.loadData();
    this.reconnectionResearch = [];
  }

  loadData() {
    try {
      return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    } catch (err) {
      return { books: [], reconnectionResearch: [] };
    }
  }

  saveData() {
    fs.writeFileSync(dataFilePath, JSON.stringify(this.data, null, 2));
  }

  addBook(book) {
    this.data.books.push(book);
    this.saveData();
  }

  removeBook(bookId) {
    const index = this.data.books.findIndex((book) => book.id === bookId);
    if (index !== -1) {
      this.data.books.splice(index, 1);
      this.saveData();
    }
  }

  addReconnectionResearch(research) {
    this.reconnectionResearch.push(research);
    this.saveData();
  }

  removeReconnectionResearch(researchId) {
    const index = this.reconnectionResearch.findIndex((research) => research.id === researchId);
    if (index !== -1) {
      this.reconnectionResearch.splice(index, 1);
      this.saveData();
    }
  }

  displayBooks() {
    console.log('Books:');
    this.data.books.forEach((book) => console.log(book.title));
  }

  displayReconnectionResearch() {
    console.log('Reconnection Research:');
    this.reconnectionResearch.forEach((research) => console.log(research.name));
  }
}

const tracker = new BookReadingTracker();

// Example usage:
tracker.addBook({ id: 1, title: 'Book 1', author: 'Author 1' });
tracker.displayBooks();
tracker.addReconnectionResearch({ id: 1, name: 'Reconnection Research 1' });
tracker.displayReconnectionResearch();