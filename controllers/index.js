const bcrypt = require("bcrypt");

const Teacher = require("../models/teacher");
const Student = require("../models/student");

module.exports = {
  getLogin: (req, res) => {
    if (req.session.loggedIn && req.session.user.role === "student")
      res.redirect("/student");
    else if (req.session.loggedIn && req.session.user.role === "teacher")
      res.redirect("/teacher");
    else {
      const error = req.session.loginError;
      res.render("login", { error });
      req.session.loginError = "";
    }
  },

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
      // find user
      const user = await model.findOne({ registerId });
      if (user) {
        if (user?.account_status === false) {
          // blocked account
          req.session.loginError = "You're blocked, contact office";
          res.redirect("/login");
        } else {
          // compare passwords
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
      req.session.loginError = "Somthing went wrong, try again";
      res.redirect("/login");
    }
    model.findOne({ registerId });
  },

  getOfficeLogin: (req, res) => {
    if (req.session.loggedIn && req.session.user.role === "office")
      res.redirect("/office");
    else if (req.session.loggedIn && req.session.user !== "office")
      res.redirect("/404");
    else {
      const error = req.session.officeLoginError;
      res.render("office-login", { error });
      req.session.officeLoginError = "";
    }
  },

  postOfficeLogin: (req, res) => {
    if (req.session.loggedIn && req.session.user.role === "office")
      res.redirect("/office");
    else if (req.session.loggedIn && req.session.user !== "office")
      res.redirect("/404");
    else {
      const { username, password } = req.body;
      const name = process.env.OFFICE || "admin";
      const pass = process.env.OFFICE_PASS || "admin123";
      if (username === name && password === pass) {
        req.session.loggedIn = true;
        req.session.user = { username: name, role: "office" };
        res.redirect("/office");
      } else {
        req.session.officeLoginError = "Invalid user name or password";
        res.redirect("/office-login");
      }
    }
  },
};
