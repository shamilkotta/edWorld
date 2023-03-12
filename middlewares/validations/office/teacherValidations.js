/* eslint-disable camelcase */
const yup = require("yup");
const fs = require("fs");
const { getAllTeachersData } = require("../../../helpers/office");
const { uploader } = require("../../../config/cloudinary");

const createTeacherSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Name can not be empty")
    .transform((value) =>
      value !== null ? value.charAt(0).toUpperCase() + value.slice(1) : value
    )
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
  salary: yup
    .number()
    .typeError("Invalid salary")
    .required("Salary can not be empty")
    .positive("Enter valid salary")
    .integer("Enter valid salary"),
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
  qualification: yup
    .string()
    .trim()
    .required("Qualification can not be empty")
    .transform((value) =>
      value !== null ? value.charAt(0).toUpperCase() + value.slice(1) : value
    ),
  experience: yup
    .number()
    .typeError("Invalid experience count")
    .required("Experience can not be empty"),
});

const editTeacherSchema = yup.object().shape({
  registerId: yup
    .string()
    .required("Can't find teacher")
    .uppercase()
    .max(5, "Register id can not be greater than 5 charecters"),
  experience: yup
    .number()
    .typeError("Invalid experience count")
    .required("Experience are required")
    .test(
      "isValidExperience",
      "Experience count can't be below of current experience count",
      async (value, testContext) => {
        const { allTeachers } = await getAllTeachersData({
          search: testContext.parent.registerId,
        });
        const data = allTeachers[0];
        if (!data)
          return testContext.createError({
            message: "Invalid register id",
          });
        if (value < data.experience)
          return testContext.createError({
            message: `Experience count can't be below of current experience count`,
          });
        return true;
      }
    ),
  salary: yup
    .number()
    .typeError("Invalid salary")
    .required("Salary can not be empty")
    .positive("Enter valid salary")
    .integer("Enter valid salary"),
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
      createTeacherSchema
        .validate(req.body, { stripUnknown: true, abortEarly: false })
        .then((data) => {
          uploader
            .upload(req.file.path, { folder: "edWorld" })
            .then((cloudRes) => {
              fs.unlink(req.file.path, (fserr) => {
                if (fserr)
                  console.error({
                    message: `Cant't remove ${req?.file?.path}`,
                    err: fserr,
                  });
              });
              req.validData = data;
              req.validData.profile = cloudRes.secure_url;
              next();
            })
            .catch(() => {
              const validationErr = "Something went wrong try again";
              req.validationErr = validationErr;
              next();
            });
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

  editTeacherValidation: (req, res, next) => {
    req.body.registerId = req.params.registerId;
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
