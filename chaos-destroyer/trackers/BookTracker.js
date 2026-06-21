class BookTracker {
  constructor(book) {
    this.book = book;
  }

  async updateReadingStatus(status) {
    return await BookService.updateReadingStatus(this.book.title, status);
  }

  async getProgress() {
    const readingStatus = await BookService.getReadingStatus();
    if (readingStatus === 'Not Started') {
      return 0;
    }
    return Math.min(100, 1 - readingStatus);
  }

  static async getReadingStatus() {
    const books = await BookService.getBooks();
    for (const book of books) {
      if (book.readingStatus !== 'Not Started') {
        return book.readingStatus;
      }
    }
    return 'Not Started';
  }
}

module.exports = BookTracker;