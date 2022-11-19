const express = require("express");

const batchValidations = require("../middlewares/validations/batchValidations");
const Batch = require("../models/batch");

const router = express.Router();

// router level layout setting
router.all("/*", (req, res, next) => {
  req.app.locals.layout = "office-layout";
  next();
});

router.get("/", (req, res) => {
  res.render("office/index");
});

router.get("/batches/add-btach", batchValidations, (req, res) => {
  res.render("", { error: req.session.addBatchError });
  req.session.addBatchError = "";
});

router.post("/batches/add-btach", batchValidations, (req, res) => {
  if (req.validationErr) {
    req.session.addBatchError = req.validationErr;
    res.redirect("/batches/add-batch");
  } else {
    const data = req.validData;
    const batch = new Batch(data);
    batch
      .save()
      .then(() => {
        req.session.addBatchSuccess = "New batch created successfully";
        res.redirect("/batches/add-batch");
      })
      .catch((err) => {
        if (err.code === 11000)
          req.session.addBatchError = "Duplicate batch code";
        else req.session.addBatchError = "Something went wrong";
        res.redirect("/batches/add-batch");
      });
  }
  res.end();
});

module.exports = router;
