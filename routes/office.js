const express = require("express");

const {
  postAddBatch,
  postAddTeacher,
  postAddStudent,
  putEditBatch,
  getAddBatch,
  getAddTeacher,
  getAddStudent,
  getSingleBatch,
  getSingleTeacher,
  getSingleStudent,
  getAllBatches,
  getAllTeachers,
  getAllStudents,
  putEditTeacher,
  getTeachersData,
  getStudentsData,
  getBatchesData,
  getDashboard,
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
  editTeacherValidation,
} = require("../middlewares/validations/office/teacherValidations");
const profileUpload = require("../middlewares/uploadFile");

const router = express.Router();

// router level layout setting
router.all("/*", (req, res, next) => {
  req.app.locals.layout = "office-layout";
  next();
});

router.get("/", getDashboard);

// view all batches
router.get("/batches", getAllBatches);

// get add batch view
router.get("/batches/add-batch", getAddBatch);

// create a batch
router.post("/batches/add-batch", createBatchValidation, postAddBatch);

// edit a batch
router.put("/batch/edit-batch/:code", editBatchValidation, putEditBatch);

// view individual batch
router.get("/batch/:code", getSingleBatch);

// view all teachers
router.get("/teachers", getAllTeachers);

// pagination, sorting, search
router.get("/batches-data", getBatchesData);
router.get("/students-data", getStudentsData);
router.get("/teachers-data", getTeachersData);

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
router.put(
  "/teacher/edit-teacher/:registerId",
  editTeacherValidation,
  putEditTeacher
);

// view individual teacher
router.get("/teacher/:registerId", getSingleTeacher);

// view all students
router.get("/students", getAllStudents);

// get add student view
router.get("/students/add-student", getAddStudent);

// add student
router.post(
  "/students/add-student",
  profileUpload,
  createStudentValidation,
  postAddStudent
);

// view individual student
router.get("/student/:registerId", getSingleStudent);

module.exports = router;
