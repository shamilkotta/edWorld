const express = require("express");
const {
  postLogin,
  postOfficeLogin,
  getLogin,
  getOfficeLogin,
  postUpdatePassword,
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

router.get("/logout", (req, res) => {
  let role;
  if (req.session.loggedIn) role = req.session.user.role;
  req.session.destroy();
  if (role === "office") res.redirect("/office-login");
  else res.redirect("/login");
});

router.get("/forgot-password", (req, res) => {
  res.render("forgot-pass");
});

router.get("/update-password", (req, res) => {
  if (["teacher", "student"].includes(req.session?.user?.role)) {
    res.render("update-password", { error: req.session.updatePassError });
    req.session.updatePassError = "";
  } else res.redirect("/login");
});

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
