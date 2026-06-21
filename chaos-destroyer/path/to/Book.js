
class Book {
  constructor(title, author, publicationDate = "", notes = "") {
    this.title = title;
    this.author = author;
    this.publicationDate = publicationDate;
    this.notes = notes;
  }

  static fromJson(data) {
    return new Book(
      data.title,
      data.author,
      data.publicationDate,
      data.notes
    );
  }
}

module.exports = Book;