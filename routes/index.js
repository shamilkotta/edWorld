const express = require("express");
const { postLogin } = require("../controllers");

const router = express.Router();

// router level layout setting
router.all("/*", (req, res, next) => {
  req.app.locals.layout = "index";
  next();
});

router.get("/", (req, res) => {
  res.send("/");
});

router.get("/login", (req, res) => {
  if (req.session.loggedIn && req.session.user.role === "student")
    res.redirect("/student");
  else if (req.session.loggedIn && req.session.user.role === "teacher")
    res.redirect("/teacher");
  else {
    const error = req.session.loginError;
    res.render("login", { error });
    req.session.loginError = "";
  }
});

router.post("/login", postLogin);

router.get("/office-login", (req, res) => {
  if (req.session.loggedIn && req.session.user.role === "office")
    res.redirect("/office");
  else if (req.session.loggedIn && req.session.user !== "office")
    res.redirect("/404");
  else {
    const error = req.session.officeLoginError;
    res.render("office-login", { error });
    req.session.officeLoginError = "";
  }
});

router.post("/office-login", (req, res) => {
  const { username, password } = req.body;
  const name = process.env.OFFICE || "admin";
  const pass = process.env.OFFICE_PASS || "admin123";
  if (username === name && password === pass) {
    req.session.loggedIn = true;
    req.session.user = { username: name, role: "office" };
    res.redirect("/office");
  } else {
    req.session.officeLoginError = "Invalid user name or password";
    res.redirect("/office-login");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/office");
});

router.get("/forgot-password", (req, res) => {
  res.render("forgot-pass");
});

router.get("/update-password", (req, res) => {
  if (["teacher", "student"].includes(req.session?.user?.role))
    res.render("update-password");
  else res.redirect("/login");
});

module.exports = router;
