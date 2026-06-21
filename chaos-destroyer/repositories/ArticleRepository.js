const ArticleModel = require('../models/ArticleModel');
const fs = require('fs');

class ArticleRepository {
  async addArticle(article) {
    const existingArticle = await this.findOne(article.title);
    if (existingArticle) {
      return existingArticle;
    }
    const newArticle = new ArticleModel(article.title, article.author);
    fs.writeFileSync(`articles/${article.title}.json`, JSON.stringify(newArticle));
    return newArticle;
  }

  async updateReadingStatus(title, status) {
    const article = await this.findOne(title);
    if (article) {
      article.updateReadingStatus(status);
      return article;
    }
    throw new Error(`Article not found`);
  }

  async findOne(title) {
    try {
      const data = JSON.parse(fs.readFileSync(`articles/${title}.json`, 'utf8'));
      return ArticleModel.fromData(data);
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new Error(`Article not found`);
      }
      throw err;
    }
  }
}

module.exports = ArticleRepository;