/* eslint-disable camelcase */
const yup = require("yup");
const { getOpenBatches } = require("../../../helpers/office");

const createStudentSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Name can not be empty")
    .test("isPerfectString", "Please enter valid name", (arg) =>
      /^[A-Za-z ]+$/.test(arg)
    ),
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
  birth_date: yup
    .date()
    .typeError("Invalid birth date")
    .required("Birth date can not be emptey")
    .max(new Date(), "Enter valid birth date"),
  gender: yup
    .string()
    .trim()
    .required("Gender can not be empty")
    .default("Not specified")
    .test("isValidGenderOption", "Select valid gender option", (arg) =>
      ["Male", "Female", "Other", "Not specified"].includes(arg)
    ),
  parent_name: yup
    .string()
    .trim()
    .required("Name can not be empty")
    .test("isPerfectString", "Please enter valid name", (arg) =>
      /^[A-Za-z ]+$/.test(arg)
    ),
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
    house_name: yup.string().trim().default("").ensure(),
    place: yup.string().trim().required("Place can not be empty"),
    post: yup.string().trim().required("Post can not be empty"),
    pin: yup
      .number()
      .typeError("Invalid pin code")
      .required("Pin code can not be empty")
      .integer("Enter a valid pin code"),
    district: yup.string().trim().required("District can not be empty"),
    state: yup.string().trim().required("State can not be empty"),
  }),
  education: yup.string().trim().required("Education can not be empty"),
  institute: yup.string().trim().required("Institute can not be empty"),
  university: yup.string().trim().required("University can not be empty"),
  batch: yup
    .string()
    .trim()
    .uppercase()
    .required("Batch is reaquired")
    .max(5, "Batch code can not be greater than 5 charecters")
    .test(
      "isOpenBatch",
      "This batch already full or started",
      async (value, testContext) => {
        const data = await getOpenBatches();
        if (!data)
          return testContext.createError({
            message:
              "You can't assign a student to this batch, its already full or started",
          });
        let flag = false;
        data.forEach((ele) => {
          if (value === ele.code) flag = true;
        });
        if (flag) return flag;
        return testContext.createError({
          message: "This batch already full or started",
        });
      }
    ),
  profile: yup
    .string()
    .trim()
    .url("Provide a profile image")
    .required("Please porvide a profile image"),
});

module.exports = {
  createStudentValidation: (req, res, next) => {
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
    createStudentSchema
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
