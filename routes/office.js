const express = require("express");

const { postAddBatch } = require("../controllers/office");
const batchValidations = require("../middlewares/validations/batchValidations");

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

router.post("/batches/add-btach", batchValidations, postAddBatch);

module.exports = router;
