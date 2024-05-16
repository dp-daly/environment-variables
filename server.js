require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Books = require('./models/books.js');
const port = 3000;

const app = express();

mongoose.connect(process.env.MONGODB_URI);

app.get('/', (req, res) => {
  res.send('The server is running');
});

app.get('/books', async (req, res) => {
  const books = await Books.find({});
  console.log(books)
  res.send(books)
})

app.use(express.json());

app.post('/books', async (req, res) => {
  console.log(req.body)
  const book = await Books.create(req.body)
  res.send(book)
})


app.get('/books/:bookId', async (req, res) => {
  console.log(req.params.bookId)
  const book = await Books.findById(req.params.bookId)
  res.send(book)
})

// app.delete('/books', async (req, res) => {
//   const book = await Books.deleteOne(req.body)
//   res.send(book)
// })

app.delete('/books/:bookId', async (req, res) => {
  const deletedBook = await Books.findByIdAndDelete(req.params.bookId)
  res.send(deletedBook)
})

app.put('/books', async (req, res) => {
  const book = await Books.updateOne(req.body, {genre: "Modernist Fiction"})
  res.send(book)
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
