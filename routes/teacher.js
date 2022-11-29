const express = require("express");
const {
  getTeacherView,
  getClassRoom,
  editDetails,
  changePassword,
  getStudent,
} = require("../controllers/teacher");
const {
  editTeacherValidationUser,
} = require("../middlewares/validations/office/teacherValidations");

const router = express.Router();

// router level layout setting
router.all("/*", (req, res, next) => {
  req.app.locals.layout = "index";
  next();
});

router.get("/", getTeacherView);

router.get("/classroom", getClassRoom);

router.put("/edit-basic-details", editTeacherValidationUser, editDetails);

router.put("/change-password", changePassword);

router.get("/classroom/:registerId", getStudent);

module.exports = router;
