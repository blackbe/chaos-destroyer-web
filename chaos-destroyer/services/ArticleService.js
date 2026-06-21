const ArticleRepository = require('../repositories/ArticleRepository');

class ArticleService {
  async addArticle(article) {
    return await ArticleRepository.addArticle(article);
  }

  async updateReadingStatus(title, status) {
    return await ArticleRepository.updateReadingStatus(title, status);
  }

  async getArticles() {
    const articles = [];
    fs.readdirSync('articles').forEach((file) => {
      const data = JSON.parse(fs.readFileSync(`articles/${file}`, 'utf8'));
      articles.push(ArticleModel.fromData(data));
    });
    return articles;
  }
}

module.exports = ArticleService;