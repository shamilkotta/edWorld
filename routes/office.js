const express = require("express");

const { postAddBatch, postAddTeacher } = require("../controllers/office");
const batchValidations = require("../middlewares/validations/batchValidations");
const teacherValidations = require("../middlewares/validations/teacherValidations");

const router = express.Router();

// router level layout setting
router.all("/*", (req, res, next) => {
  req.app.locals.layout = "office-layout";
  next();
});

router.get("/", (req, res) => {
  res.render("office/index");
});

// get add batch view
router.get("/batches/add-btach", (req, res) => {
  res.render("", {
    error: req.session.addBatchError,
    success: req.session.addBatchSuccess,
  });
  req.session.addBatchError = "";
  req.session.addBatchSuccess = "";
});

// create a batch
router.post("/batches/add-btach", batchValidations, postAddBatch);

// get add teacher view
router.get("/teachers/add-teacher", (req, res) => {
  res.render("", {
    error: req.session.addTeacherError,
    success: req.session.addTeacherSuccess,
  });
  req.session.addTeacherError = "";
  req.session.addTeacherSuccess = "";
});

router.post("/teachers/add-teacher", teacherValidations, postAddTeacher);

module.exports = router;
