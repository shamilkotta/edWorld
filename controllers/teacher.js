const {
  getAllTeachersData,
  getAllBatchesData,
  getAllStudentsData,
} = require("../helpers/office");
const Batch = require("../models/batch");

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
};
