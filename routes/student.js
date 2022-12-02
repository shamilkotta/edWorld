const express = require("express");
const { getChangePassword, putEditDetails } = require("../controllers");
const {
  getStudentView,
  getFeeInvoice,
  getGenerateOrder,
} = require("../controllers/student");
const {
  editStudentValidation,
} = require("../middlewares/validations/studentValidations");

const router = express.Router();

// router level layout setting
router.all("/*", (req, res, next) => {
  req.app.locals.layout = "index";
  next();
});

router.get("/", getStudentView);

router.put("/edit-basic-details", editStudentValidation, putEditDetails);

router.put("/change-password", getChangePassword);

router.get("/get-invoice/:option", getFeeInvoice);

router.get("/generate-order/:option/:invoice", getGenerateOrder);

module.exports = router;
