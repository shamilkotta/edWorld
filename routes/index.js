const express = require("express");
const {
  postLogin,
  postOfficeLogin,
  getLogin,
  getOfficeLogin,
  postUpdatePassword,
  postForgotPass,
  getResetPass,
  postResetPass,
  logout,
  getForgotPass,
  getUpdatePass,
} = require("../controllers");
const { loginRedirection } = require("../middlewares/authorization");

const router = express.Router();

// router level layout setting
router.all("/*", (req, res, next) => {
  req.app.locals.layout = "index";
  next();
});

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/login", loginRedirection, getLogin);

router.post("/login", loginRedirection, postLogin);

router.get("/office-login", loginRedirection, getOfficeLogin);

router.post("/office-login", loginRedirection, postOfficeLogin);

router.get("/logout", logout);

router.get("/forgot-password", getForgotPass);

router.post("/forgot-password", postForgotPass);

router.get("/reset-password/:id", getResetPass);

router.post("/reset-password/:id", postResetPass);

router.get("/update-password", getUpdatePass);

router.post(
  "/update-password",
  (req, res, next) => {
    if (!req.session.loggedIn || req.session.user.role === "office")
      res.redirect(303, "/login");
    else next();
  },
  postUpdatePassword
);

router.get("/404", (req, res) => {
  res.render("404");
});

module.exports = router;
