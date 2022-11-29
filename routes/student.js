const express = require("express");
const { getStudentView } = require("../controllers/student");

const router = express.Router();

// router level layout setting
router.all("/*", (req, res, next) => {
  req.app.locals.layout = "index";
  next();
});

router.get("/", getStudentView);

module.exports = router;
