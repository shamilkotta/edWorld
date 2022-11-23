const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("student router");
});

module.exports = router;
