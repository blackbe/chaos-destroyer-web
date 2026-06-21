-------------

```javascript
module.exports = (books, articles) => {
    const csvData = [
        ['Title', 'Category'],
        ...books.map(book => [book.title, book.category]),
        ...articles.map(article => [article.title, article.category])
    ];
    return csvData.join('\n');
};