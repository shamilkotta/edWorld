const bcrypt = require("bcrypt");

const Teacher = require("../models/teacher");
const Student = require("../models/student");

module.exports = {
  postLogin: async (req, res) => {
    let { registerId } = req.body;
    const { password, role } = req.body;
    registerId = registerId.toUpperCase();
    let model;
    if (role === "student") model = Student;
    else if (role === "teacher") model = Teacher;
    else {
      req.session.loginError = "Please choose a account type";
      res.redirect("/login");
    }
    try {
      const user = await model.findOne({ registerId });
      if (user) {
        if (user?.account_status === false) {
          req.session.loginError = "You're blocked, contact office";
          res.redirect("/login");
        } else {
          bcrypt.compare(password, user.password).then((result) => {
            if (result) {
              req.session.loggedIn = true;
              req.session.user = {
                registerId,
                role,
                isPasswordStrong: user.password_strong,
              };
              if (role === "student") res.redirect("/student");
              else res.redirect("/teacher");
            } else {
              req.session.loginError = "Invalid register Id or password";
              res.redirect("/login");
            }
          });
        }
      } else {
        req.session.loginError = "Invalid register Id or password";
        res.redirect("/login");
      }
    } catch (err) {
      console.error(err);
      req.session.loginError = "Somthing went wrong, try again";
      res.redirect("/login");
    }
    model.findOne({ registerId });
  },
};
