class ArticleModel extends Article {
  constructor(title, author, publicationDate, tags) {
    super(title, author);
    this.publicationDate = publicationDate;
    this.tags = tags;
  }
}

module.exports = ArticleModel;