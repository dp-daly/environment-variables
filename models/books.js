const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    year: { type: Number, required: true },
    publisher: {type: String, required: true},
    language: { type: String, required: true },
    country: { type: String, required: true },
    genre: { type: String, required: false},
    details: { type: String, required: false},
    image: { type: String, required: false},
});

module.exports = mongoose.model('Book', bookSchema);