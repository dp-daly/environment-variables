const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    year: { type: Number, required: true },
    publisher: {type: String, required: true},
    language: { type: String, required: false },
    country: { type: String, required: false },
    genre: { type: String, required: false},
    details: { type: String, required: false},
});

module.exports = mongoose.model('Book', bookSchema);