class ArticleTracker {
  constructor(article) {
    this.article = article;
  }

  async updateReadingStatus(status) {
    return await ArticleService.updateReadingStatus(this.article.title, status);
  }

  async getProgress() {
    const readingStatus = await ArticleService.getReadingStatus();
    if (readingStatus === 'Not Started') {
      return 0;
    }
    return Math.min(100, 1 - readingStatus);
  }

  static async getReadingStatus() {
    const articles = await ArticleService.getArticles();
    for (const article of articles) {
      if (article.readingStatus !== 'Not Started') {
        return article.readingStatus;
      }
    }
    return 'Not Started';
  }
}

module.exports = ArticleTracker;