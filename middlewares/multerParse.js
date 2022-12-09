const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./public/uploads/profile"),
  filename: (req, file, cb) => cb(null, `${Date.now()}.png`),
});

const fileFilter = (req, file, cb) => {
  if (!["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) {
    return cb(new Error("Not a image"));
  }
  return cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 1048576 } });

module.exports = (req, res, next) => {
  upload.single("profile")(req, res, (err) => {
    if (err) {
      if (err.message === "Not a image")
        req.validationErr = "Please provide a valid profile image";
      else if (err.message === "File too large")
        req.validationErr = "Maximum image size is 1MB";
      else req.validationErr = "Something went wrong";
      return next();
    }
    return next();
  });
};
