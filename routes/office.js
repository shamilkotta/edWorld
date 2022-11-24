const express = require("express");

const {
  postAddBatch,
  postAddTeacher,
  postAddStudent,
  putEditBatch,
  getAddBatch,
  getAddTeacher,
  getAddStudent,
} = require("../controllers/office");
const {
  getAllBatchesData,
  getAllTeachersData,
  getAllStudentsData,
} = require("../helpers/office");
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
const profileUpload = require("../middlewares/uploadFile");

const router = express.Router();

// router level layout setting
router.all("/*", (req, res, next) => {
  req.app.locals.layout = "office-layout";
  next();
});

router.get("/", (req, res) => {
  res.render("office/index");
});

// view all batches
router.get("/batches", async (req, res) => {
  try {
    // get all batches data to display in table
    const allBatches = await getAllBatchesData();
    res.render("office/batches/index", { allBatches });
  } catch (err) {
    res.render("office/batches/index", { allBatches: [] });
  }
});

// get add batch view
router.get("/batches/add-batch", getAddBatch);

// create a batch
router.post("/batches/add-batch", createBatchValidation, postAddBatch);

// edit a batch
router.put("/batches/edit-batch", editBatchValidation, putEditBatch);

// view all teachers
router.get("/teachers", async (req, res) => {
  try {
    // get all teachers data to display in table
    const allTeachers = await getAllTeachersData();
    res.render("office/teachers/index", { allTeachers });
  } catch (err) {
    res.render("office/teachers/index", { allTeachers: [] });
  }
});

// get add teacher view
router.get("/teachers/add-teacher", getAddTeacher);

// add teacher
router.post(
  "/teachers/add-teacher",
  profileUpload,
  createTeacherValidation,
  postAddTeacher
);

// edit teacher
router.put("/teachers/edit-teacher");

// view all students
router.get("/students", async (req, res) => {
  try {
    // get all students data to display in table
    const allStudents = await getAllStudentsData();
    res.render("office/students/index", { allStudents });
  } catch (err) {
    res.render("office/students/index", { allStudents: [] });
  }
});

// get add student view
router.get("/students/add-student", getAddStudent);

// add student
router.post(
  "/students/add-student",
  profileUpload,
  createStudentValidation,
  postAddStudent
);

module.exports = router;
