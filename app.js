const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const indexRouter = require("./routes/index");
const errorHandler = require("./middlewares/errorHandler");
const ErrorResponse = require("./utils/ErrorResponse");

const app = express();

// body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// static directory
app.use("/static", express.static(`${__dirname}/public`));

// route setup
// app.use("/office");
// app.use("/teacher");
// app.use("/student");
app.use("/", indexRouter);

// 404 request
app.use((req, res, next) => {
  next(new ErrorResponse(404));
});

// error handling
app.use(errorHandler);

module.exports = app;
