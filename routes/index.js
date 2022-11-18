const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("/");
});

router.use("/login", (req, res) => {
  res.send("/login");
});

router.use("/office-login", (req, res) => {
  res.send("/office");
});

module.exports = router;
