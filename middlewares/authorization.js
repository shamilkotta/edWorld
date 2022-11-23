const ErrorResponse = require("../utils/ErrorResponse");

module.exports = {
  officeAuthorization: (req, res, next) => {
    if (req.session.loggedIn && req.session.user.role === "office") next();
    else if (req.session.loggedIn && req.session.user.role !== "office")
      next(new ErrorResponse(404));
    else res.redirect("/office-login");
  },

  teacherAuthorization: (req, res, next) => {
    if (req.session.loggedIn && req.session.user.role === "teacher") {
      if (req.session.user.isPasswordStrong) next();
      else res.redirect("/update-password");
    } else if (req.session.loggedIn) next(new ErrorResponse(404));
    else res.redirect("/login");
  },

  studentAuthorization: (req, res, next) => {
    if (req.session.loggedIn && req.session.user.role === "student") {
      if (req.session.user.isPasswordStrong) next();
      else res.redirect("/update-password");
    } else if (req.session.loggedIn) next(new ErrorResponse(404));
    else res.redirect("/login");
  },
};
