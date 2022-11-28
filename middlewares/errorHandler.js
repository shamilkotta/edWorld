/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
module.exports = (err, req, res, next) => {
  let { status = 500, message = "Something went wrong" } = err;
  if (status === 404) {
    return res.redirect("/404");
  }
  if (status === 401) message = "Unauthorized";
  return res.status(status).json({ success: false, status, message });
};
