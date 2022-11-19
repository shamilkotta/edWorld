const yup = require("yup");

const teacherValidationSchema = yup.object().shape({
  registerId: yup
    .string()
    .trim()
    .uppercase()
    .required("Register id can not be empty")
    .max(4, "Register id can't be more than 4 characters long"),
  name: yup
    .string()
    .trim()
    .required("Name can not be empty")
    .test("isPerfectString", "Please enter valid name", (arg) =>
      /^[A-Za-z]+$/.test(arg)
    ),
  phone: yup
    .number()
    .required("Phone number can not be empty")
    .integer("Enter a valid phone number")
    .positive("Enter a valid phone number")
    .matches(/^[0]?[6789]\d{9}$/, "Enter a valid phone number"),
  email: yup
    .string()
    .trim()
    .required("Email can not be empty")
    .email("Enter a valid email"),
  birth_date: yup
    .date()
    .required("Birth date can not be emptey")
    .max(new Date(), "Enter valid birth date"),
  gender: yup
    .string()
    .trim()
    .required("Gender can not be empty")
    .default("Not specified")
    .test("isValidGenderOption", "Select valid gender option", (arg) =>
      ["Male", "Femail", "Other", "Not specified"].includes(arg)
    ),
  salary: yup
    .number()
    .required("Salary can not be empty")
    .positive("Enter valid salary")
    .integer("Enter valid salary"),
  address: yup.object({
    house_name: yup.string().trim().default("").ensure(),
    place: yup.string().trim().required("Place can not be empty"),
    post: yup.string().trim().required("Post can not be empty"),
    pin: yup
      .number()
      .required("Pin code can not be empty")
      .integer("Enter a valid pin code"),
    district: yup.string().trim().required("District can not be empty"),
    state: yup.string().trim().required("State can not be empty"),
  }),
  qualification: yup.string().trim().required("Qualification can not be empty"),
  experience: yup.number().required("Experience can not be empty"),
  profile: yup
    .string()
    .trim()
    .url("Provide a profile image")
    .required("Please porvide a profile image"),
});

module.exports = (req, res, next) => {
  teacherValidationSchema
    .validate(req.body)
    .then((data) => {
      req.validData = data;
      next();
    })
    .catch((err) => {
      [req.validationErr] = err.errors;
      next();
    });
};
