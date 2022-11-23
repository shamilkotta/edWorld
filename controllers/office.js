/* eslint-disable camelcase */
const fs = require("fs");

const { generateUniqueCode, createPassword } = require("../helpers/office");
const Batch = require("../models/batch");
const Student = require("../models/student");
const Teacher = require("../models/teacher");

module.exports = {
  postAddBatch: async (req, res) => {
    if (req.validationErr) {
      req.session.addBatchError = req.validationErr;
      res.redirect(303, "/office/batches/add-batch");
    } else {
      try {
        const data = req.validData;
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
        console.error(err);
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

  postAddTeacher: async (req, res) => {
    if (req.validationErr) {
      req.session.addTeacherError = req.validationErr;
      res.redirect(303, "/office/teachers/add-teacher");
    } else {
      try {
        const data = req.validData;
        data.registerId = await generateUniqueCode("teacher");
        data.password = await createPassword(data.birth_date);
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
            res.redirect(303, "/office/teachers/add-teacher");
          });
      } catch (err) {
        console.error(err);
        req.session.addTeacherError = "Something went wrong";
        res.redirect(303, "/office/teachers/add-teacher");
      }
    }
  },

  postAddStudent: async (req, res) => {
    if (req.validationErr) {
      req.session.addStudentError = req.validationErr;
      res.redirect(303, "/office/students/add-student");
    } else {
      try {
        const data = req.validData;
        data.registerId = await generateUniqueCode("student");
        data.password = await createPassword(data.birth_date);
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
        console.error(err);
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
