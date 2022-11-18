const express = require("express");

const router = express.Router();

// router level layout setting
router.all("/*", (req, res, next) => {
  req.app.locals.layout = "office-layout";
  next();
});

router.get("/", (req, res) => {
  res.render("office/index");
});

module.exports = router;
