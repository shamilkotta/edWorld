const yup = require("yup");
const { getOpenTeachers } = require("../../../helpers/office");

const batchValidationSchema = yup.object().shape({
  start_date: yup
    .date()
    .typeError("Invalid starting date")
    .required("Starting date is required")
    .min(new Date(), "Invalid starting date"),
  duration: yup
    .number("Duration of batch must be valid type")
    .typeError("Invalid course duration")
    .required("Duration of batch is required")
    .positive("Enter valid duration"),
  fee: yup
    .number()
    .typeError("Invalid fee amount")
    .required("Batch fee required")
    .positive("Enter a valid fee amount"),
  seat_num: yup
    .number()
    .typeError("Invalid seat number")
    .required("Seat numbers are required")
    .integer("Enter a valid seat number")
    .positive("Enter a valid seat number"),
  batch_head: yup
    .string()
    .trim()
    .uppercase()
    .required("Batch head reaquired")
    .max(5, "Batch head id can not be greater than 5 charecters")
    .test(
      "isOpenTeacher",
      "Batch head validation error",
      async (value, testContext) => {
        const data = await getOpenTeachers();
        let flag = false;
        data.forEach((ele) => {
          if (value === ele.registerId) flag = true;
        });
        if (flag) return flag;
        return testContext.createError({
          message: "This teacher already have a batch assigned",
        });
      }
    ),
  fee_type: yup
    .array()
    .of(yup.string("Invalid payment options"))
    .min(1, "Give atleast one payment options")
    .test(
      "isWhite",
      "Enter valid payment options",
      (arg) =>
        arg.length !== 0 &&
        arg.every((ele) => ["One time", "Installment"].includes(ele))
    ),
});

module.exports = (req, res, next) => {
  batchValidationSchema
    .validate(req.body, { stripUnknown: true, abortEarly: false })
    .then((data) => {
      req.validData = data;
      next();
    })
    .catch((err) => {
      [req.validationErr] = err.errors;
      next();
    });
};
