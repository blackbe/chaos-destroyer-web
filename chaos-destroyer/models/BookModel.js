class BookModel extends Book {
  constructor(title, author, pages, rating) {
    super(title, author);
    this.pages = pages;
    this.rating = rating;
  }
}

module.exports = BookModel;