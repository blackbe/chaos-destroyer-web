const BookRepository = require('../repositories/BookRepository');

class BookService {
  async addBook(book) {
    return await BookRepository.addBook(book);
  }

  async updateReadingStatus(title, status) {
    return await BookRepository.updateReadingStatus(title, status);
  }

  async getBooks() {
    const books = [];
    fs.readdirSync('books').forEach((file) => {
      const data = JSON.parse(fs.readFileSync(`books/${file}`, 'utf8'));
      books.push(BookModel.fromData(data));
    });
    return books;
  }
}

module.exports = BookService;