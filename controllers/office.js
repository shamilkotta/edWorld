const Batch = require("../models/batch");

module.exports = {
  postAddBatch: (req, res) => {
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
  },
};
