const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("/");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/office-login", (req, res) => {
  res.render("office-login");
});

router.get("/forgot-password", (req, res) => {
  res.render("forgot-pass");
});

module.exports = router;
