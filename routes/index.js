const express = require("express");
const {
  postLogin,
  postOfficeLogin,
  getLogin,
  getOfficeLogin,
} = require("../controllers");

const router = express.Router();

// router level layout setting
router.all("/*", (req, res, next) => {
  req.app.locals.layout = "index";
  next();
});

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/login", getLogin);

router.post("/login", postLogin);

router.get("/office-login", getOfficeLogin);

router.post("/office-login", postOfficeLogin);

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

router.get("/404", (req, res) => {
  res.render("404");
});

module.exports = router;
