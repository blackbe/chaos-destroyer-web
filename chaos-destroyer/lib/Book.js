class Book {
  constructor(title, author) {
    this.title = title;
    this.author = author;
    this.readingStatus = 'Not Started';
  }

  updateReadingStatus(status) {
    this.readingStatus = status;
  }
}

module.exports = Book;