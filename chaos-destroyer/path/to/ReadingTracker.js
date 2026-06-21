
const fs = require("fs");
const path = require("path");
const Book = require("./Book");

class ReadingTracker {
  constructor() {
    this.books = [];
  }

  addBook(book) {
    this.books.push(book);
  }

  updateBook(title, data) {
    const bookIndex = this.books.findIndex((book) => book.title === title);
    if (bookIndex !== -1) {
      this.books[bookIndex] = Book.fromJson(data);
    }
  }

  getBook(title) {
    return this.books.find((book) => book.title === title);
  }

  saveData() {
    const data = this.books.map((book) => ({
      title: book.title,
      author: book.author,
      publicationDate: book.publicationDate,
      notes: book.notes,
    }));
    fs.writeFileSync(path.join(__dirname, "..", "books.json"), JSON.stringify(data));
  }

  loadBooks() {
    try {
      const data = fs.readFileSync(path.join(__dirname, "..", "books.json"));
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }
}

module.exports = ReadingTracker;