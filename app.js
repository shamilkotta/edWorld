const express = require("express");
const errorHandler = require("./middlewares/errorHandler");
const ErrorResponse = require("./utils/ErrorResponse");
require("dotenv").config();

const app = express();

// body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// route setup
app.use("/office");
app.use("/teacher");
app.use("/student");
app.use("/");

// 404 request
app.use((req, res, next) => {
  next(new ErrorResponse(404));
});

// error handling
app.use(errorHandler);

module.exports = app;
