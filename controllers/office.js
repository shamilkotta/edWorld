/* eslint-disable camelcase */
const fs = require("fs");

const {
  generateUniqueCode,
  createPassword,
  getOpenTeachers,
  getOpenBatches,
} = require("../helpers/office");
const Batch = require("../models/batch");
const Student = require("../models/student");
const Teacher = require("../models/teacher");

module.exports = {
  getAddBatch: async (req, res) => {
    try {
      // open teachers to lead a bach
      const teachers = await getOpenTeachers();
      res.render("office/batches/add-batch", {
        error: req.session.addBatchError,
        success: req.session.addBatchSuccess,
        openTeachers: teachers,
        helpers: {
          today: () => new Date().toISOString().split("T")[0],
        },
      });
      req.session.addBatchError = "";
      req.session.addBatchSuccess = "";
    } catch (err) {
      res.render("office/batches/add-batch", {
        error: req.session.addBatchError,
        success: req.session.addBatchSuccess,
        openTeachers: [],
        helpers: {
          today: () => new Date().toISOString().split("T")[0],
        },
      });
      req.session.addBatchError = "";
      req.session.addBatchSuccess = "";
    }
  },

  postAddBatch: async (req, res) => {
    if (req.validationErr) {
      req.session.addBatchError = req.validationErr;
      res.redirect(303, "/office/batches/add-batch");
    } else {
      try {
        const data = req.validData;
        // generating batch code -->BH00X
        data.code = await generateUniqueCode("batch");
        const batch = new Batch(data);
        batch
          .save()
          .then(() => {
            req.session.addBatchSuccess = "New batch created successfully";
            res.redirect(303, "/office/batches/add-batch");
          })
          .catch((err) => {
            if (err.code === 11000)
              req.session.addBatchError =
                "This teacher already have a batch assigned";
            else req.session.addBatchError = "Something went wrong";
            res.redirect(303, "/office/batches/add-batch");
          });
      } catch (err) {
        req.session.addBatchError = "Something went wrong";
        res.redirect(303, "/office/batches/add-batch");
      }
    }
  },

  putEditBatch: (req, res) => {
    if (req.validationErr) {
      req.session.editBatchError = req.validationErr;
      res.redirect(303, "/office/batches/add-batch");
    } else {
      const { code, batch_head, seat_num } = req.validData;
      Batch.findOneAndUpdate({ code }, { batch_head, seat_num })
        .then(() => {
          req.session.addBatchSuccess = "Batch updated successfully";
          res.redirect(303, "/office/batches/add-batch");
        })
        .catch((err) => {
          console.error(err);
          req.session.addBatchError = "Something went wrong";
          res.redirect(303, "/office/batches/add-batch");
        });
    }
  },

  getAddTeacher: (req, res) => {
    res.render("office/teachers/add-teacher", {
      error: req.session.addTeacherError,
      success: req.session.addTeacherSuccess,
      helpers: {
        today: () => new Date().toISOString().split("T")[0],
      },
    });
    req.session.addTeacherError = "";
    req.session.addTeacherSuccess = "";
  },

  postAddTeacher: async (req, res) => {
    if (req.validationErr) {
      req.session.addTeacherError = req.validationErr;
      res.redirect(303, "/office/teachers/add-teacher");
    } else {
      try {
        const data = req.validData;
        // generating register id --> TR00X
        data.registerId = await generateUniqueCode("teacher");
        let date = data.birth_date;
        date = date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        // genraing password from DOB
        data.password = await createPassword(date);
        const teacher = new Teacher(data);
        teacher
          .save()
          .then(() => {
            req.session.addTeacherSuccess = "New teacher added successfully";
            res.redirect(303, "/office/teachers/add-teacher");
          })
          .catch((err) => {
            if (err.code === 11000)
              req.session.addTeacherError = "Duplicate email or phone number";
            else req.session.addTeacherError = "Something went wrong";
            fs.unlink(req.file.path, (fserr) => {
              if (fserr)
                console.error({
                  message: `Cant't remove ${req?.file?.path}`,
                  err: fserr,
                });
            });
            res.redirect(303, "/office/teachers/add-teacher");
          });
      } catch (err) {
        req.session.addTeacherError = "Something went wrong";
        fs.unlink(req.file.path, (fserr) => {
          if (fserr)
            console.error({
              message: `Cant't remove ${req?.file?.path}`,
              err: fserr,
            });
        });
        res.redirect(303, "/office/teachers/add-teacher");
      }
    }
  },

  getAddStudent: async (req, res) => {
    const openBatches = await getOpenBatches();
    res.render("office/students/add-student", {
      error: req.session.addStudentError,
      success: req.session.addStudentSuccess,
      openBatches,
      helpers: {
        today: () => new Date().toISOString().split("T")[0],
      },
    });
    req.session.addStudentError = "";
    req.session.addStudentSuccess = "";
  },

  postAddStudent: async (req, res) => {
    if (req.validationErr) {
      req.session.addStudentError = req.validationErr;
      res.redirect(303, "/office/students/add-student");
    } else {
      try {
        const data = req.validData;
        // generating register id --> ST00X
        data.registerId = await generateUniqueCode("student");
        let date = data.birth_date;
        date = date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        // genraing password from DOB
        data.password = await createPassword(date);
        const student = new Student(data);
        student
          .save()
          .then(() => {
            req.session.addStudentSuccess = "New student added successfully";
            res.redirect(303, "/office/students/add-student");
          })
          .catch((err) => {
            if (err.code === 11000)
              req.session.addStudentError = "Duplicate email or phone number";
            else req.session.addStudentError = "Something went wrong";
            fs.unlink(req.file.path, (fserr) => {
              if (fserr)
                console.error({
                  message: `Cant't remove ${req?.file?.path}`,
                  err: fserr,
                });
            });
            res.redirect(303, "/office/students/add-student");
          });
      } catch (err) {
        req.session.addStudentError = "Something went wrong";
        fs.unlink(req.file.path, (fserr) => {
          if (fserr)
            console.error({
              message: `Cant't remove ${req?.file?.path}`,
              err: fserr,
            });
        });
        res.redirect(303, "/office/students/add-student");
      }
    }
  },
};
