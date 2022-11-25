/* eslint-disable camelcase */
const fs = require("fs");

const {
  generateUniqueCode,
  createPassword,
  getOpenTeachers,
  getOpenBatches,
  getAllStudentsData,
  getBatch,
  getTeacher,
  getStudent,
  getAllBatchesData,
  getAllTeachersData,
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

  getAllBatches: async (req, res) => {
    try {
      let { page = 1, limit = 10 } = req.query;
      const { search = "", sort = "code" } = req.query;
      page = parseInt(page, 10);
      limit = parseInt(limit, 10);
      // get all batches data to display in table
      const data = await getAllBatchesData({ page, limit, search, sort });
      res.render("office/batches/index", { ...data, search });
    } catch (err) {
      res.render("office/batches/index", { allBatches: [] });
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

  getAllTeachers: async (req, res) => {
    try {
      let { page = 1, limit = 10 } = req.query;
      const { search = "", sort = "code" } = req.query;
      page = parseInt(page, 10);
      limit = parseInt(limit, 10);
      // get all teachers data to display in table
      const data = await getAllTeachersData({ page, limit, search, sort });
      res.render("office/teachers/index", { ...data });
    } catch (err) {
      res.render("office/teachers/index", { allTeachers: [] });
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

  getAllStudents: async (req, res) => {
    try {
      let { page = 1, limit = 10 } = req.query;
      const { search = "", sort = "code" } = req.query;
      page = parseInt(page, 10);
      limit = parseInt(limit, 10);
      // get all students data to display in table
      const data = await getAllStudentsData({ page, limit, search, sort });
      res.render("office/students/index", { ...data });
    } catch (err) {
      res.render("office/students/index", { allStudents: [] });
    }
  },

  getSingleBatch: async (req, res) => {
    const { code } = req.params;
    try {
      const batch = await getBatch(code);
      const students = await getAllStudentsData({ search: code });
      if (batch[0]) {
        res.render("office/batches/batch", { batch, students });
      } else {
        res.redirect("/office/batches");
      }
    } catch (error) {
      res.redirect("/office/batches");
    }
  },

  getSingleTeacher: async (req, res) => {
    const { registerId } = req.params;
    try {
      const teacher = await getTeacher(registerId);
      if (teacher[0]) {
        res.render("office/teachers/teacher", { teacher });
      } else {
        res.redirect("/office/teachers");
      }
    } catch (error) {
      res.redirect("/office/teachers");
    }
  },

  getSingleStudent: async (req, res) => {
    const { registerId } = req.params;
    try {
      const student = await getStudent(registerId);
      if (student[0]) {
        res.render("office/students/student", { student });
      } else {
        res.redirect("/office/students");
      }
    } catch (error) {
      res.redirect("/office/students");
    }
  },
};
