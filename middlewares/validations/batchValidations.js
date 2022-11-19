const yup = require("yup");

const batchValidationSchema = yup.object().shape({
  start_date: yup
    .date("Invalid starting date")
    .required("Starting date is required")
    .min(new Date(), "Invalid starting date"),
  duration: yup
    .number("Duration of batch must be valid type")
    .required("Duration of batch is required")
    .positive("Enter valid duration"),
  fee: yup
    .number()
    .required("Batch fee required")
    .positive("Enter a valid fee amount"),
  seat_num: yup
    .number()
    .required("Seat numbers are required")
    .positive("Enter a valid seat number"),
  batch_head: yup
    .string()
    .trim()
    .uppercase()
    .required("Batch head reaquired")
    .max(5, "Batch head id can not be greater than 5 charecters"),
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
