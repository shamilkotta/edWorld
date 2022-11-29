const {
  getAllTeachersData,
  getAllBatchesData,
  getAllStudentsData,
} = require("../helpers/office");
const Batch = require("../models/batch");
const Teacher = require("../models/teacher");

module.exports = {
  getTeacherView: async (req, res) => {
    try {
      const { registerId } = req.session.user;
      const { allTeachers } = await getAllTeachersData({ search: registerId });
      if (allTeachers[0]) {
        res.render("teacher/index", { teacher: allTeachers[0] });
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      res.redirect("/login");
    }
  },

  getClassRoom: async (req, res) => {
    try {
      const { registerId } = req.session.user;
      const batch = await Batch.findOne({ batch_head: registerId });
      if (!batch) res.redirect("/teacher");
      else {
        const { allBatches } = await getAllBatchesData({ search: batch.code });
        const students = await getAllStudentsData({ search: batch.code });
        res.render("teacher/classroom", { batch: allBatches[0], ...students });
      }
    } catch (error) {
      res.redirect("/teacher");
    }
  },

  editDetails: async (req, res) => {
    try {
      if (req.validationErr) {
        res.status(400).json({
          success: false,
          message: req.validationErr,
        });
      } else {
        const data = req.validData;
        const { registerId } = req.session.user;
        const result = await Teacher.updateOne({ registerId }, data, {
          runValidators: true,
        });
        if (result.acknowledged && result.modifiedCount)
          res.status(200).json({
            success: true,
            message: "Updated successfully",
          });
        else throw new Error("Something went wrong! try again");
      }
    } catch (error) {
      if (error.code === 11000)
        res.status(400).json({
          success: false,
          message: "Email or phone number already in use",
        });
      else
        res.status(500).json({
          success: false,
          message: "Something went wrong! try again",
        });
    }
  },

  changePassword: (req, res) => {
    res.status(200).json({
      success: true,
      message: "chagned",
    });
  },
};
