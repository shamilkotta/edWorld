/* eslint-disable camelcase */
const yup = require("yup");
const fs = require("fs");

const createTeacherSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Name can not be empty")
    .test("isPerfectString", "Please enter valid name", (arg) =>
      /^[A-Za-z]+$/.test(arg)
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
  salary: yup
    .number()
    .typeError("Invalid salary")
    .required("Salary can not be empty")
    .positive("Enter valid salary")
    .integer("Enter valid salary"),
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
  qualification: yup.string().trim().required("Qualification can not be empty"),
  experience: yup
    .number()
    .typeError("Invalid experience count")
    .required("Experience can not be empty"),
  profile: yup.string().trim().required("Please porvide a profile image"),
});

module.exports = {
  createTeacherValidation: (req, res, next) => {
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
      createTeacherSchema
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
          })[req.validationErr] = err.errors;
          next();
        });
    }
  },
};
