const { generateUniqueCode } = require("../helpers/office");
const Batch = require("../models/batch");
const Teacher = require("../models/teacher");

module.exports = {
  postAddBatch: async (req, res) => {
    if (req.validationErr) {
      req.session.addBatchError = req.validationErr;
      res.redirect("/batches/add-batch");
    } else {
      const data = req.validData;
      data.code = await generateUniqueCode("batch");
      const batch = new Batch(data);
      batch
        .save()
        .then(() => {
          req.session.addBatchSuccess = "New batch created successfully";
          res.redirect("/batches/add-batch");
        })
        .catch((err) => {
          if (err.code === 11000)
            req.session.addBatchError =
              "One teacher can only be head of one batch";
          else req.session.addBatchError = "Something went wrong";
          res.redirect("/batches/add-batch");
        });
    }
  },

  postAddTeacher: async (req, res) => {
    if (req.validationErr) {
      req.session.addTeacherError = req.validationErr;
      res.redirect("/teachers/add-teacher");
    } else {
      const data = req.validData;
      data.registerId = await generateUniqueCode("teacher");
      const teacher = new Teacher(data);
      teacher
        .save()
        .then(() => {
          req.session.addTeacherSuccess = "New teacher added successfully";
          res.redirect("/teachers/add-teacher");
        })
        .catch((err) => {
          if (err.code === 11000)
            req.session.addTeacherError = "Duplicate teacher register id";
          else req.session.addTeacherError = "Something went wrong";
          res.redirect("/teachers/add-teacher");
        });
    }
  },
};
