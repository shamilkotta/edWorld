const { getAllStudentsData } = require("../helpers/office");

const superfix = (index, inc = false) => {
  if (inc) {
    if (index === 0 || index === "0") return "1<sup>st</sup>";
    if (index === 1 || index === "1") return "2<sup>nd</sup>";
    if (index === 2 || index === "2") return "3<sup>rd</sup>";
    return `${index + 1}<sup>th</sup>`;
  }
  if (index === 1 || index === "1") return "1<sup>st</sup>";
  if (index === 2 || index === "2") return "2<sup>nd</sup>";
  if (index === 3 || index === "3") return "3<sup>rd</sup>";
  return `${index}<sup>th</sup>`;
};

module.exports = {
  getStudentView: async (req, res) => {
    try {
      const { registerId } = req.session.user;
      const { allStudents } = await getAllStudentsData({ search: registerId });
      if (allStudents[0]) {
        res.render("student/index", {
          student: allStudents[0],
          helpers: {
            superfix,
            isAttendancePending: (count) => count === -1 || count === "-1",
          },
        });
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      res.redirect("/login");
    }
  },
};
