/* eslint-disable camelcase */
const yup = require("yup");
const fs = require("fs");

const { getOpenBatches } = require("../../../helpers/office");

const createStudentSchema = yup.object().shape({
  name: yup
    .string()
    .transform((value) =>
      value !== null ? value.charAt(0).toUpperCase() + value.slice(1) : value
    )
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
    .transform((value) =>
      value !== null ? value.charAt(0).toUpperCase() + value.slice(1) : value
    )
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
  education: yup
    .string()
    .trim()
    .required("Education can not be empty")
    .transform((value) =>
      value !== null ? value.charAt(0).toUpperCase() + value.slice(1) : value
    ),
  institute: yup
    .string()
    .trim()
    .required("Institute can not be empty")
    .transform((value) =>
      value !== null ? value.charAt(0).toUpperCase() + value.slice(1) : value
    ),
  university: yup
    .string()
    .trim()
    .required("University can not be empty")
    .transform((value) =>
      value !== null ? value.charAt(0).toUpperCase() + value.slice(1) : value
    ),
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
  profile: yup.string().trim().required("Please porvide a profile image"),
});

module.exports = {
  createStudentValidation: (req, res, next) => {
    if (req.validationErr) next();
    else if (!req.file) {
      req.validationErr = "Please upload a profile image";
      next();
    } else {
      const { house_name, place, post, pin, district, state, ...rest } =
        req.body;
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
      req.body.profile = `/static/uploads/profile/${req.file.filename}`;
      createStudentSchema
        .validate(req.body, { stripUnknown: true, abortEarly: false })
        .then((data) => {
          req.validData = data;
          next();
        })
        .catch((err) => {
          fs.unlink(req.file.path, (fserr) => {
            if (fserr)
              console.error({
                message: `Cant't remove ${req?.file?.path}`,
                err: fserr,
              });
          });
          const validationErr = err.errors[0];
          req.validationErr = validationErr;
          next();
        });
    }
  },
};
