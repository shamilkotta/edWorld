const { getAllStudentsData } = require("../helpers/office");

module.exports = {
  getStudentView: async (req, res) => {
    try {
      const { registerId } = req.session.user;
      const { allStudents } = await getAllStudentsData({ search: registerId });
      if (allStudents[0]) {
        res.render("student/index", { student: allStudents[0] });
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      res.redirect("/login");
    }
  },
};
