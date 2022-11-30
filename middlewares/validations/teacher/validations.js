/* eslint-disable camelcase */
const yup = require("yup");

const workingDaysSchema = yup.object().shape({
  working_days: yup
    .number()
    .typeError("Invalid Working days")
    .required("Working days count can not be empty")
    .min(0, "Enter a valid count")
    .max(31, "Enter valid count"),
});

const monthlyDataSchema = yup.object().shape({
  attendance: yup
    .number()
    .typeError("Invalid attendance provided")
    .required("Attendance can not be empty")
    .min(0, "Enter a valid count")
    .max(31, "Enter valid count"), //
  performance: yup
    .number()
    .typeError("Invalid performance provided")
    .required("Performance can not be empty")
    .min(0, "Enter a valid performance")
    .max(100, "Enter valid performance"),
  registerId: yup
    .string()
    .trim()
    .uppercase()
    .required("Can't find the student")
    .max(5, "register id can not be greater than 5 charecters"),
  id: yup.string().required("Can't find the student"),
});

module.exports = {
  totalWorkingDaysValidation: (req, res, next) => {
    req.body.registerId = req.params.registerId;
    workingDaysSchema
      .validate(req.body, { stripUnknown: true, abortEarly: false })
      .then((data) => {
        req.validData = data;
        next();
      })
      .catch((err) => {
        [req.validationErr] = err.errors;
        next();
      });
  },

  monthlyDataValidation: (req, res, next) => {
    monthlyDataSchema
      .validate(req.body, { stripUnknown: true, abortEarly: false })
      .then((data) => {
        req.validData = data;
        next();
      })
      .catch((err) => {
        [req.validationErr] = err.errors;
        next();
      });
  },
};
