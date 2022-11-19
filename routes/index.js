const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("/");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/office-login", (req, res) => {
  const error = req.session.officeLoginError;
  res.render("office-login", { error });
  req.session.officeLoginError = "";
});

router.post("/office-login", (req, res) => {
  const { username, password } = req.body;
  const name = process.env.OFFICE || "admin";
  const pass = process.env.OFFICE_PASS || "admin123";
  if (username === name && password === pass) {
    req.session.loggedIn = true;
    req.session.user = { role: "office" };
    res.redirect("/office");
  } else {
    req.session.officeLoginError = "Invalid user name or password";
    res.redirect("/office-login");
  }
});

router.get("/forgot-password", (req, res) => {
  res.render("forgot-pass");
});

module.exports = router;
