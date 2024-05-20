const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user.js");

router.get("/sign-in", (req, res) => {
    res.render("auth/sign-in.ejs");
  });

module.exports = router;
