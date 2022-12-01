/* eslint-disable camelcase */
const yup = require("yup");

const editStudentSchema = yup.object().shape({
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
  parent_phone: yup
    .number()
    .typeError("Invalid phone number")
    .required("Phone number can not be empty")
    .integer("Enter a valid phone number")
    .positive("Enter a valid phone number")
    .test("isValidPhone", "Enter a valid phone number", (arg) =>
      /^[0]?[6789]\d{9}$/.test(arg)
    ),
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
  editStudentValidation: (req, res, next) => {
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
    editStudentSchema
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
