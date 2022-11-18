const ErrorResponse = require("../utils/ErrorResponse");

module.exports = {
  officeAuthorization: (req, res, next) => {
    if (req.session.loggedIn && req.session.user.role === "office") next();
    else if (req.session.loggedIn && req.session.user.role !== "office")
      next(new ErrorResponse(404));
    else res.redirect("/office-login");
  },
};
