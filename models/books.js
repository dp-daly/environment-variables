const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    text: {type: String, required: true },
    reviewer: {type: mongoose.Schema.ObjectId, required: true, ref: "greatreadsdb.grusers"},
},
    { timestamps: true },
)

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    year: { type: Number, required: true },
    publisher: {type: String, required: true},
    language: { type: String, required: true },
    country: { type: String, required: true },
    genre: { type: String, required: false },
    details: { type: String, required: false },
    image: { type: String, required: false },
    createdBy: { type: mongoose.Schema.ObjectId, ref: "greatreadsdb.grusers" },
    reviews: [reviewSchema],
});

module.exports = mongoose.model('Book', bookSchema);