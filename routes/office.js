const express = require("express");

const {
  postAddBatch,
  postAddTeacher,
  postAddStudent,
} = require("../controllers/office");
const {
  createBatchValidation,
  editBatchValidation,
} = require("../middlewares/validations/office/batchValidations");
const {
  createStudentValidation,
} = require("../middlewares/validations/office/studentValidations");
const {
  createTeacherValidation,
} = require("../middlewares/validations/office/teacherValidations");

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
router.get("/batches/add-batch", (req, res) => {
  res.render("office/add-batch", {
    error: req.session.addBatchError,
    success: req.session.addBatchSuccess,
  });
  req.session.addBatchError = "";
  req.session.addBatchSuccess = "";
});

// create a batch
router.post("/batches/add-batch", createBatchValidation, postAddBatch);

// edit a batch
router.put("/batches/edit-batch", editBatchValidation);

// get add teacher view
router.get("/teachers/add-teacher", (req, res) => {
  res.render("office/add-teacher", {
    error: req.session.addTeacherError,
    success: req.session.addTeacherSuccess,
  });
  req.session.addTeacherError = "";
  req.session.addTeacherSuccess = "";
});

// add teacher
router.post("/teachers/add-teacher", createTeacherValidation, postAddTeacher);

// get add student view
router.get("/students/add-student", (req, res) => {
  res.render("office/add-student", {
    error: req.session.addStudentError,
    success: req.session.addStudentSuccess,
  });
  req.session.addStudentError = "";
  req.session.addStudentSuccess = "";
});

// add student
router.post("/students/add-student", createStudentValidation, postAddStudent);

module.exports = router;
