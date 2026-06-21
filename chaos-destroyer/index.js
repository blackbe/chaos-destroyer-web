-------------

```javascript
const express = require('express');
const app = express();
const port = 3000;

// Sample data
let books = [
    { title: 'Book Title 1', category: 'Read' },
    { title: 'Book Title 2', category: 'To-Read' },
    { title: 'Article Title 1', category: 'Favorites' }
];

let articles = [
    { title: 'Article Title 1', category: 'Read' },
    { title: 'Article Title 2', category: 'To-Read' }
];

// Route for logging books
app.get('/books', (req, res) => {
    res.render('books.ejs', { books });
});

// Route for logging articles
app.get('/articles', (req, res) => {
    res.render('articles.ejs', { articles });
});

// Route for filtering by category
app.get('/books/:category', (req, res) => {
    const category = req.params.category;
    const filteredBooks = books.filter(book => book.category === category);
    res.render('books.ejs', { books: filteredBooks });
});

// Route for exporting data
app.get('/export', (req, res) => {
    const csvData = [
        ['Title', 'Category'],
        ...books.map(book => [book.title, book.category]),
        ...articles.map(article => [article.title, article.category])
    ];
    const csvString = csvData.map(row => row.join(',')).join('\n');
    res.set('Content-Type', 'text/csv');
    res.send(csvString);
});

// Start the server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});