const yup = require("yup");
const {
  getOpenTeachers,
  getStudentsCountInBatch,
  getAllBatchesData,
} = require("../../../helpers/office");

const createBatchSchema = yup.object().shape({
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
          message:
            "This teacher already have a batch assigned or not a valid teacher Id",
        });
      }
    ),
  fee_type: yup
    .array()
    .typeError("Invalid fee type option")
    .of(yup.string("Invalid payment options"))
    .min(1, "Give atleast one payment options")
    .test(
      "isWhite",
      "Enter valid payment options",
      (arg) =>
        arg.length !== 0 &&
        arg.every((ele) => ["One time", "Installment"].includes(ele))
    ),
  subjects: yup
    .array()
    .typeError("Invalid subjects given")
    .min(1, "Atleast one subject is required")
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
        teacher_id: yup
          .string()
          .required("Can't find teacher")
          .uppercase()
          .max(5, "Register id can not be greater than 5 charecters"),
        teacher_name: yup
          .string()
          .trim()
          .required("Name can not be empty")
          .transform((value) =>
            value !== null
              ? value.charAt(0).toUpperCase() + value.slice(1)
              : value
          )
          .test("isPerfectString", "Please enter valid name", (arg) =>
            /^[A-Za-z]+$/.test(arg)
          ),
      })
    ),
});

const editBatchSchema = yup.object().shape({
  code: yup
    .string()
    .required("Can't find batch")
    .uppercase()
    .max(5, "Batch code can not be greater than 5 charecters"),
  seat_num: yup
    .number()
    .typeError("Invalid seat number")
    .required("Seat numbers are required")
    .integer("Enter a valid seat number")
    .positive("Enter a valid seat number")
    .test(
      "isAlreadyFull",
      "Seat count can't be below of number of students",
      async (value, testContext) => {
        const data = await getStudentsCountInBatch(testContext.parent.code);
        if (!data)
          return testContext.createError({
            message: "Invalid batch provided",
          });
        if (value < data.student_count)
          return testContext.createError({
            message: `Seat count can't be below of number of students`,
          });
        return true;
      }
    ),
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
        const { allBatches: batch } = await getAllBatchesData({
          search: testContext.parent.code,
        });
        let flag = false;
        data.forEach((ele) => {
          if (value === ele.registerId) flag = true;
        });
        if (flag) return flag;
        if (value === batch[0].batch_head) return true;
        return testContext.createError({
          message: "This teacher already have a batch assigned",
        });
      }
    ),
  subjects: yup
    .array()
    .typeError("Invalid subjects given")
    .min(1, "Atleast one subject is required")
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
        teacher_id: yup
          .string()
          .required("Can't find teacher")
          .uppercase()
          .max(5, "Register id can not be greater than 5 charecters"),
        teacher_name: yup
          .string()
          .trim()
          .required("Name can not be empty")
          .transform((value) =>
            value !== null
              ? value.charAt(0).toUpperCase() + value.slice(1)
              : value
          )
          .test("isPerfectString", "Please enter valid name", (arg) =>
            /^[A-Za-z]+$/.test(arg)
          ),
      })
    ),
});

module.exports = {
  createBatchValidation: (req, res, next) => {
    createBatchSchema
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

  editBatchValidation: (req, res, next) => {
    req.body.code = req.params.code;
    editBatchSchema
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
