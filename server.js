require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Books = require('./models/books.js');
const port = 3000;

const app = express();

mongoose.connect(process.env.MONGODB_URI);

app.get('/', (req, res) => {
  res.render('home.ejs');
});

app.get('/books', async (req, res) => {
  const books = await Books.find();
  console.log(books)
  res.render('all-books.ejs', {
    books,
  })
})

app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.post('/books', async (req, res) => {
  console.log(req.body)
  const book = await Books.create(req.body)
  res.redirect(`/books/${book._id}`)
})

app.get('/new-book', (req, res) => {
  res.render('new-book.ejs')
})

app.get('/books/:bookId', async (req, res) => {
  console.log(req.params.bookId)
  const book = await Books.findById(req.params.bookId)
  res.render('show.ejs', {
    book,
  })
})

// app.delete('/books', async (req, res) => {
//   const book = await Books.deleteOne(req.body)
//   res.send(book)
// })

app.delete('/books/:bookId', async (req, res) => {
  const deletedBook = await Books.findByIdAndDelete(req.params.bookId)
  res.send(deletedBook)
})

// ! Updating using whole body with pre-specified update
// app.put('/books', async (req, res) => {
//   const book = await Books.updateOne(req.body, {genre: "Modernist Fiction"})
//   res.send(book)
// })

// ! Two-step approach
// app.put('/books/:bookId', async (req, res) => {
//   const Book = await Books.findById(req.params.bookId)
//   const updatedBook = Books.updatedOne(Book, req.body)
//   res.send(updatedBook)
// })


// ! All in one updated by ID
app.put('/books/:bookId', async (req, res) => {
  const updatedBook = await Books.findByIdAndUpdate(req.params.bookId, req.body)
  res.send(updatedBook)
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
