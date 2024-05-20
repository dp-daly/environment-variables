const mongoose = require("mongoose");

const grUserSchema = new mongoose.Schema({
    firstname: { type: String, required: true},
    lastname: { type: String, required: true},
    username: { type: String, required: true},
    password: { type: String, required: true},
});

const grUser = mongoose.model("GRUser", grUserSchema);

module.exports = grUser;