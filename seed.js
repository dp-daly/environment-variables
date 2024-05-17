const mongoose = require('mongoose');
require('dotenv').config();

const books = require('./models/books.js')

async function seed() {
    console.log('Seeding has begun 🌱')
    mongoose.connect(process.env.MONGODB_URI)
    console.log('Connection is successful 🚀')

    const book = await books.create({
        title: "Journey from the North",
        author: "Storm Jameson",
        year: 1969,
        publisher: "Pushkin Press",
        language: "English",
        country: "United Kingdom",
        genre: "Memoir",
    },

    {
        title: "In Search of Lost Time, Vol 1: Swann's Way",
        author: "Marcel Proust",
        year: 1913,
        publisher: "Gallimard",
        language: "French",
        country: "France",
        genre: "Novel",
    },

    {
        title: "The Lodgers",
        author: "Holly Pester",
        year: 2024, 
        publisher: "Granta Books",
        language: "English",
        country: "United Kingdom",
        genre: "Novel",
        details: "Debut novel by an award-winning poet."
    }
)

    console.log(book);
    mongoose.disconnect()
}

seed();