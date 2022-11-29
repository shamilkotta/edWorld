const express = require("express");
const { getTeacherView, getClassRoom } = require("../controllers/teacher");

const router = express.Router();

// router level layout setting
router.all("/*", (req, res, next) => {
  req.app.locals.layout = "index";
  next();
});

router.get("/", getTeacherView);

router.get("/classroom", getClassRoom);

module.exports = router;
