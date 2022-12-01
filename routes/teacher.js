const express = require("express");
const { getChangePassword, putEditDetails } = require("../controllers");
const {
  getTeacherView,
  getClassRoom,
  getStudent,
  putTotalWrokingDays,
  putMonthlyData,
} = require("../controllers/teacher");
const {
  editTeacherValidation,
  totalWorkingDaysValidation,
  monthlyDataValidation,
} = require("../middlewares/validations/teacherValidations");

const router = express.Router();

// router level layout setting
router.all("/*", (req, res, next) => {
  req.app.locals.layout = "index";
  next();
});

router.get("/", getTeacherView);

router.get("/classroom", getClassRoom);

router.put("/edit-basic-details", editTeacherValidation, putEditDetails);

router.put("/change-password", getChangePassword);

router.get("/classroom/:registerId", getStudent);

router.put(
  "/add-total-working-days",
  totalWorkingDaysValidation,
  putTotalWrokingDays
);

router.put("/add-monthly-data", monthlyDataValidation, putMonthlyData);

module.exports = router;
