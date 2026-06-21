const BookModel = require('../models/BookModel');
const fs = require('fs');

class BookRepository {
  async addBook(book) {
    const existingBook = await this.findOne(book.title);
    if (existingBook) {
      return existingBook;
    }
    const newBook = new BookModel(book.title, book.author);
    fs.writeFileSync(`books/${book.title}.json`, JSON.stringify(newBook));
    return newBook;
  }

  async updateReadingStatus(title, status) {
    const book = await this.findOne(title);
    if (book) {
      book.updateReadingStatus(status);
      return book;
    }
    throw new Error(`Book not found`);
  }

  async findOne(title) {
    try {
      const data = JSON.parse(fs.readFileSync(`books/${title}.json`, 'utf8'));
      return BookModel.fromData(data);
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new Error(`Book not found`);
      }
      throw err;
    }
  }
}

module.exports = BookRepository;