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
  registerId: yup
    .string()
    .trim()
    .uppercase()
    .required("Can't find the student")
    .max(5, "register id can not be greater than 5 charecters"),
  id: yup.string().required("Can't find the student"),
  subject_performance: yup
    .array()
    .typeError("Invalid subjects given")
    .of(
      yup.object().shape({
        subject: yup
          .string()
          .transform((value) =>
            value !== null
              ? value.charAt(0).toUpperCase() + value.slice(1)
              : value
          )
          .trim()
          .required("Subject can not be empty")
          .test("isPerfectString", "Please enter valid subject", (arg) =>
            /^[A-Za-z ]+$/.test(arg)
          ),
        score: yup
          .number()
          .typeError("Invalid performance provided")
          .required("Performance can not be empty")
          .min(0, "Enter a valid performance")
          .max(100, "Enter valid performance"),
      })
    ),
});

const editTeacherSchema = yup.object().shape({
  phone: yup
    .number()
    .typeError("Invalid phone number")
    .required("Phone number can not be empty")
    .integer("Enter a valid phone number")
    .positive("Enter a valid phone number")
    .test("isValidPhone", "Enter a valid phone number", (arg) =>
      /^[0]?[6789]\d{9}$/.test(arg)
    ),
  email: yup
    .string()
    .trim()
    .required("Email can not be empty")
    .email("Enter a valid email"),
  address: yup.object({
    house_name: yup
      .string()
      .trim()
      .transform((value) =>
        value !== null ? value.charAt(0).toUpperCase() + value.slice(1) : value
      )
      .default("")
      .ensure(),
    place: yup
      .string()
      .trim()
      .required("Place can not be empty")
      .transform((value) =>
        value !== null ? value.charAt(0).toUpperCase() + value.slice(1) : value
      ),
    post: yup
      .string()
      .trim()
      .required("Post can not be empty")
      .transform((value) =>
        value !== null ? value.charAt(0).toUpperCase() + value.slice(1) : value
      ),
    pin: yup
      .string()
      .trim()
      .required("Pin code can not be empty")
      .test("isValidPin", "Enter a valid PIN code", (arg) =>
        /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/.test(arg)
      ),
    district: yup
      .string()
      .trim()
      .required("District can not be empty")
      .transform((value) =>
        value !== null ? value.charAt(0).toUpperCase() + value.slice(1) : value
      ),
    state: yup
      .string()
      .trim()
      .required("State can not be empty")
      .transform((value) =>
        value !== null ? value.charAt(0).toUpperCase() + value.slice(1) : value
      ),
  }),
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
        const newAttend = (data.attendance / req.body.total) * 100;
        req.validData = data;
        req.validData.attendance = newAttend.toFixed(2);
        let total = 0;
        data.subject_performance.forEach((ele) => {
          total += ele.score;
        });
        req.validData.performance = total / data.subject_performance.length;
        next();
      })
      .catch((err) => {
        [req.validationErr] = err.errors;
        next();
      });
  },

  editTeacherValidation: (req, res, next) => {
    const { house_name, place, post, pin, district, state, ...rest } = req.body;
    const address = {
      house_name,
      place,
      post,
      pin,
      district,
      state,
    };
    req.body = rest;
    req.body.address = address;
    editTeacherSchema
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
