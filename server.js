/*-------------------------------- Dependencies --------------------------------*/

const methodOverride = require("method-override");
const morgan = require("morgan"); 
require('dotenv').config();
const express = require('express');
const session = require("express-session");
const mongoose = require('mongoose');
const path = require("path");
const Books = require('./models/books.js');


const port = 3000;
const authController = require("./controllers/auth.js");
const app = express();

/*-------------------------------- DB Connect --------------------------------*/

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`)
});

/*-------------------------------- Deps/Middleware --------------------------------*/

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride("_method"));
app.use(morgan("dev")); 
app.use(express.static(path.join(__dirname, "public")));

//Use express session for auth
app.use(
  session({
      secret: process.env.SESSION_SECRET, 
      resave: false,
      saveUninitialized: true,
})
);


//! pass the user to nav.ejs for conditional formatting
//Use the locals object to pass it through without sending or rendering
//Could also add user to indiviual get request locals objects
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});


/*-------------------------------- Routes --------------------------------*/

//! HOME
app.get('/', (req, res) => {
  res.render('home.ejs');
});

//instruct our Express app to use this authController for handling requests that match the /auth URL pattern.
app.use("/auth", authController);

//! SHELF
//auth to make sure only those sign in can view their shelf
// app.get("/books", (req, res) => {
//   if (!req.session.user) {
//     res.send("Please sign in to view your shelf.")
//   }
// });

//standard shelf page
app.get('/books', async (req, res) => {
  const books = await Books.find();
  console.log(books)
  res.render('all-books.ejs', {
    books,
  })
})

//! ADD A BOOK
//auth to control access 
// app.get("/new-book", (req, res) => {
//   if (!req.session.user) {
//       res.send("Please sign in to add to your shelf.")
//   }
// });

//page with form
app.get('/new-book', (req, res) => {
  res.render('new-book.ejs')
})

//create in database and redirect to new page with error handling
app.post('/books', async (req, res) => {
  try {

    const errors = [];

    if (!req.body.title.trim()) {
      errors.push('Please provide the book title');
    }
    if (!req.body.author.trim()) {
      errors.push('Please provide the author');
    }
    if (!req.body.year.trim()) {
      errors.push('Please provide the publication year');
    }
    if (!req.body.publisher.trim()) {
      errors.push('Please provide the publisher');
    }
    if (!req.body.language.trim()) {
      errors.push('Please provide the language');
    }
    if (!req.body.country.trim()) {
      errors.push('Please provide the country');
    }

    if (errors.length > 0) {
      // This is controlling the flow by not allowing the book to be created until the errors are cleared; however, an error isn't being "thrown" per se. To fix?
      res.render('new-book.ejs', { 
        errorMessages: errors,
        formData: req.body,
       });
    } else {
    const book = await Books.create(req.body);
    res.redirect(`/books/${book._id}`);
    }
  } catch (err) {
    res.render('new-book.ejs', { 
      errorMessages: err.message,
      formData: req.body,
     });
  }
});


//! SPECIFIC BOOK PAGE
app.get('/books/:bookId', async (req, res) => {
  console.log(req.params.bookId)
  const book = await Books.findById(req.params.bookId)
  res.render('show.ejs', {
    book,
  })
})

//! DELETE A BOOK
app.delete('/books/:bookId', async (req, res) => {
  const deletedBook = await Books.findByIdAndDelete(req.params.bookId)
  res.redirect('/books')
})

//! EDIT AN ENTRY
//page with form
  app.get('/books/:bookId/edit', async (req, res) => {
    const foundBook = await Books.findById(req.params.bookId);
    res.render("edit.ejs", {
      book: foundBook,
    });
  });

  //update db and redirect to updated page
  app.put('/books/:bookId', async (req, res) => {
  const updatedBook = await Books.findByIdAndUpdate(req.params.bookId, req.body)
  res.redirect(`/books/${req.params.bookId}`)

})

/*-------------------------------- Listener --------------------------------*/

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
