/*-------------------------------- Dependencies --------------------------------*/

const methodOverride = require("method-override");
const morgan = require("morgan"); 
require('dotenv').config();
const express = require('express');
const session = require("express-session");
const mongoose = require('mongoose');
const path = require("path");
const Books = require('./models/books.js');
const MongoStore = require("connect-mongo");


const port = process.env.PORT ? process.env.PORT : 3000;
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
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
      }),
})
);

//! pass the user to nav.ejs for conditional formatting
//Use the locals object to pass it through without sending or rendering
//This is more efficient but is essentially the same effect as if we added user to individual get request locals objects
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

//middleware for flashmessages
//logic: if there is a message on the cookie, put that message on the locals object and set that message everywhere (on the session). Then wipe the message (so it disappears?)
app.use((req, res, next) => {
  if (req.session.message) {
    res.locals.message = req.session.message;
    req.session.message = null;
  }
  next();
});

/*-------------------------------- Routes --------------------------------*/

//! HOME

//unnecessary try catch here because it's just renders route and performs no async action?
app.get('/', (req, res) => {
  try {
  res.render('home.ejs');
  } catch (err) {
    res.render("error.ejs", {systemErrorMessage: err.message})
  }
});

//instruct our Express app to use this authController for handling requests that match the /auth URL pattern.
app.use("/auth", authController);

//! SHELF

//standard shelf page
app.get('/books', async (req, res) => {
  if (req.session.user) {
    try {
  const books = await Books.find();
  console.log(books)
  res.render('all-books.ejs', {
    books,
  })
} catch (err) {
  res.render("error.ejs", { systemErrorMessage: err.message })
}
} else {
  res.redirect("/auth/sign-in");
}
})

//! ADD A BOOK

//page with form
app.get('/new-book', (req, res) => {
  if (req.session.user) {
    try {
  res.render('new-book.ejs')
    } catch (err) {
      res.render("error.ejs", { systemErrorMessage: err.message })
    }
  } else {
    res.redirect("/auth/sign-in");
  }
});

//create in database and redirect to new page with separate validation and system error handling
//this could be refactored into shorter helper functions for readability
app.post('/books', async (req, res) => {
  const validationErrors = [];
  const yearString = req.body.year.trim();
  const year = parseInt(req.body.year, 10);

  if (!req.body.title.trim()) {
    validationErrors.push('Please provide the book title');
  }
  if (!req.body.author.trim()) {
    validationErrors.push('Please provide the author');
  }
  if (!req.body.year.trim() || isNaN(year) || yearString.length !== 4) {
    validationErrors.push('Please provide the four-digit publication year');
  }
  if (!req.body.publisher.trim()) {
    validationErrors.push('Please provide the publisher');
  }
  if (!req.body.language.trim()) {
    validationErrors.push('Please provide the language');
  }
  if (!req.body.country.trim()) {
    validationErrors.push('Please provide the country');
  }

  if (validationErrors.length > 0) {
    res.render('new-book.ejs', { 
      valErrorMessages: validationErrors,
      formData: req.body,
    });
  } else {
    try {
      //Here we're assigning the current user's ID to the request body as the new book is created.
      //We've added it to the schema separately so it can be stored in the database.
      req.body.createdBy = req.session.user.userId;
      const book = await Books.create(req.body);
      //Flash message greets the user when they preview their new entry.
      req.session.message = `${req.body.title} by ${req.body.author} successfully added to your shelf.`;
      res.redirect(`/books/${book._id}`);
    } catch (err) {
      req.session.message = `There was an error adding the book to your shelf. Please see details: ${err.message}`;
      res.render('new-book.ejs', { 
        systemErrorMessage: err.message,
        formData: req.body,
      });
    }
  }
});


//! SPECIFIC BOOK PAGE
app.get('/books/:bookId', async (req, res) => {
  try {
  console.log(req.params.bookId)
  const book = await Books.findById(req.params.bookId)
  res.render('show.ejs', {
    book,
  })
} catch (err) {
  res.render("error.ejs", {systemErrorMessage: err.message})
}
})

//! DELETE A BOOK
app.delete('/books/:bookId', async (req, res) => {
  if (req.session.user) {
    try {
  const deletedBook = await Books.findByIdAndDelete(req.params.bookId)
  res.redirect('/books')
    } catch(err) {
      res.render("error.ejs", { systemErrorMessage: "You must be signed in to delete a book." })
    }
  } else {
    res.redirect("/auth/sign-in")
  }
})

//! EDIT AN ENTRY
//page with form
  app.get('/books/:bookId/edit', async (req, res) => {
    if (req.session.user) {
      try {
    const foundBook = await Books.findById(req.params.bookId);
    res.render("edit.ejs", {
      book: foundBook,
    });
  } catch(err) {
    res.render("error.ejs", { systemErrorMessage: err.message })
  }
  } else {
    res.redirect("/auth/sign-in")
  }
  });

  //update db and redirect to updated page
  app.put('/books/:bookId', async (req, res) => {
    try {
  const updatedBook = await Books.findByIdAndUpdate(req.params.bookId, req.body)
  res.redirect(`/books/${req.params.bookId}`)
    } catch(err) {
      res.render("error.ejs", { systemErrorMessage: "You must be signed in to edit an entry." })
    }
})

app.get('/books/:bookId/reviews', (req, res) => {
  res.render("new-review.ejs", { bookId: req.params.bookId, });
});

app.post('/books/:bookId/reviews', async (req, res) => {
  if (req.session.user) {
    const bookId = req.params.bookId;
    console.log("THIS IS MY CONSOLE LOG" + bookId)
    const bookFromDb = await Books.findById(bookId);
    req.body.reviewer = req.session.user.userId;
    bookFromDb.reviews.push(req.body);
    await bookFromDb.save();
    res.redirect(`/books/${bookId}`);
  } else {
    res.redirect("/auth/sign-in");
  }
  });

app.get("*", function (req, res) {
  res.render("error.ejs", { systemErrorMessage: "Error 404: Page not found." });
});

/*-------------------------------- Listener --------------------------------*/

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
