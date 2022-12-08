/* eslint-disable camelcase */
const fs = require("fs");
const { batchStat, studentStat } = require("../helpers");

const {
  generateUniqueCode,
  createPassword,
  getOpenTeachers,
  getOpenBatches,
  getAllStudentsData,
  getAllBatchesData,
  getAllTeachersData,
  getActiveBatches,
  getAllPaymentsData,
  paymentStat,
  getBatchesSeatCountData,
  getStudentsPerformance,
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
      let { page = 1, limit = 50 } = req.query;
      const { search = "", sort = "code" } = req.query;
      page = parseInt(page, 10);
      limit = parseInt(limit, 10);
      // get all batches data to display in table
      const data = await getAllBatchesData({ page, limit, search, sort });
      res.render("office/batches/index", {
        ...data,
        helpers: {
          batchStatus: (status) => {
            if (status === "Active") return "success";
            if (status === "Completed") return "dark";
            return "danger";
          },
        },
      });
    } catch (err) {
      res.render("office/batches/index", { allBatches: [] });
    }
  },

  putEditBatch: (req, res) => {
    if (req.validationErr) {
      res.status(400).json({
        success: false,
        message: req.validationErr,
      });
    } else {
      const { code, batch_head, seat_num } = req.validData;
      Batch.findOneAndUpdate(
        { code },
        { batch_head, seat_num },
        { runValidators: true }
      )
        .then(() => {
          res.status(200).json({
            success: true,
            message: "Batch updated successfully",
            data: { batch_head, seat_num },
          });
        })
        .catch(() => {
          res.status(500).json({
            success: false,
            message: "Something went wrong",
          });
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
      let { page = 1, limit = 50 } = req.query;
      const { search = "", sort = "registerId" } = req.query;
      page = parseInt(page, 10);
      limit = parseInt(limit, 10);
      // get all teachers data to display in table
      const data = await getAllTeachersData({ page, limit, search, sort });
      res.render("office/teachers/index", { ...data });
    } catch (err) {
      res.render("office/teachers/index", { allTeachers: [] });
    }
  },

  // pagination, sorting, search
  getBatchesData: async (req, res) => {
    let { page = 1, limit = 50 } = req.query;
    const { search = "", sort = "code" } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    try {
      const data = await getAllBatchesData({ search, sort, limit, page });
      res.status(200).json({
        data,
      });
    } catch (error) {
      res.status(200).json({
        success: false,
        data: {
          allTeachers: [],
          total: 0,
          page: 1,
          limit: 50,
        },
      });
    }
  },

  getStudentsData: async (req, res) => {
    let { page = 1, limit = 50 } = req.query;
    const { search = "", sort = "registerId" } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    try {
      const data = await getAllStudentsData({ search, sort, limit, page });
      res.status(200).json({
        data,
      });
    } catch (error) {
      res.status(200).json({
        success: false,
        data: {
          allTeachers: [],
          total: 0,
          page: 1,
          limit: 50,
        },
      });
    }
  },

  getTeachersData: async (req, res) => {
    let { page = 1, limit = 50 } = req.query;
    const { search = "", sort = "registerId" } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    try {
      const data = await getAllTeachersData({ search, sort, limit, page });
      res.status(200).json({
        data,
      });
    } catch (error) {
      res.status(200).json({
        success: false,
        data: {
          allTeachers: [],
          total: 0,
          page: 1,
          limit: 50,
        },
      });
    }
  },

  getPaymentsData: async (req, res) => {
    let { page = 1, limit = 50 } = req.query;
    const { search = "", sort = "createdAt,1" } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    try {
      const data = await getAllPaymentsData({ search, sort, limit, page });
      res.status(200).json({
        data,
      });
    } catch (error) {
      res.status(200).json({
        success: false,
        data: {
          allPayments: [],
          total: 0,
          page: 1,
          limit: 50,
        },
      });
    }
  },
  // pagination, sorting, search -- end

  putEditTeacher: (req, res) => {
    if (req.validationErr) {
      res.status(400).json({
        success: false,
        message: req.validationErr,
      });
    } else {
      const { registerId, salary, experience } = req.validData;
      Teacher.findOneAndUpdate(
        { registerId },
        { salary, experience },
        { runValidators: true }
      )
        .then(() => {
          res.status(200).json({
            success: true,
            message: "Teacher updated successfully",
            data: { salary, experience },
          });
        })
        .catch(() => {
          res.status(500).json({
            success: false,
            message: "Something went wrong",
          });
        });
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
      let { page = 1, limit = 50 } = req.query;
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
      // get batch data
      const { allBatches: batch } = await getAllBatchesData({ search: code });
      // get batch stats
      const stats = await batchStat(code);
      const seatNum = batch[0].seat_num;
      const studentNum = batch[0].students;
      stats.batchFill = ((studentNum / seatNum) * 100).toFixed(1);
      // students data for table
      const students = await getAllStudentsData({ search: code });
      const openTeachers = await getOpenTeachers();
      if (batch[0]) {
        res.render("office/batches/batch", {
          batch: batch[0],
          ...students,
          openTeachers,
          stats,
          helpers: {
            batchStatus: (status) => {
              if (status === "Active") return "success";
              if (status === "Completed") return "dark";
              return "danger";
            },
          },
        });
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
      const { allTeachers } = await getAllTeachersData({ search: registerId });
      if (allTeachers[0]) {
        res.render("office/teachers/teacher", { teacher: allTeachers[0] });
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
      const { allStudents } = await getAllStudentsData({ search: registerId });
      const studentStats = await studentStat(registerId);
      studentStats.fee_completion = (
        (studentStats.installment / 3) *
        100
      ).toFixed(1);
      const batchStats = await batchStat(studentStats.batch);
      if (batchStats.avg_performance === 0) studentStats.currentStand = 0;
      else
        studentStats.currentStand = Math.floor(
          (studentStats.avg_performance / batchStats.avg_performance) * 100
        );

      if (allStudents[0]) {
        res.render("office/students/student", {
          student: allStudents[0],
          studentStats,
        });
      } else {
        res.redirect("/office/students");
      }
    } catch (error) {
      console.log(error);
      res.redirect("/office/students");
    }
  },

  getDashboard: async (req, res) => {
    try {
      // get batches count
      const batchCount = await Batch.countDocuments();
      // get teachers count
      const teacherCount = await Teacher.countDocuments();
      // get student count
      const studentCount = await Student.countDocuments();
      // get active batches
      const activeBatchCount = await getActiveBatches();
      // last payment
      const { allPayments } = await getAllPaymentsData({});
      res.render("office/index", {
        batchCount,
        teacherCount,
        studentCount,
        lastPayment: allPayments[0],
        activeBatchCount: activeBatchCount.length,
      });
    } catch (error) {
      res.render("office/index");
    }
  },

  getPayments: async (req, res) => {
    try {
      let { page = 1, limit = 50 } = req.query;
      const { search = "", sort = "createdAt,1" } = req.query;
      page = parseInt(page, 10);
      limit = parseInt(limit, 10);
      const data = await getAllPaymentsData({ page, limit, search, sort });
      const paymentStats = await paymentStat();
      res.render("office/payment", {
        ...data,
        paymentStats,
        helpers: {
          maxAmount: (amount) => (amount > 10000000 ? "10000000+" : amount),
        },
      });
    } catch (error) {
      res.render("office/payment", { allPayments: [] });
    }
  },

  getDashboardData: async (req, res) => {
    let paymentStats = { total: 0, success: 0, failed: 0 };
    let batchStats = [];
    let studentStats = [];

    try {
      paymentStats = await paymentStat(); // payment chart
      paymentStats.failed = paymentStats.total - paymentStats.success;
      batchStats = await getBatchesSeatCountData(); // seat count chart
      studentStats = await getStudentsPerformance(); // students performance chart
      res.status(200).json({
        success: true,
        paymentStats,
        batchStats,
        studentStats,
      });
      res.end();
    } catch (error) {
      res.status(500).json({
        success: false,
      });
    }
  },
};
