const express = require("express");
const cookieParser = require("cookie-parser");
const { engine } = require("express-handlebars");
const session = require("express-session");
const morgan = require("morgan");
require("dotenv").config();

const connectDatabase = require("./config/database");
const indexRouter = require("./routes/index");
const officeRouter = require("./routes/office");
const teacherRouter = require("./routes/teacher");
const studentRouter = require("./routes/student");
const errorHandler = require("./middlewares/errorHandler");
const ErrorResponse = require("./utils/ErrorResponse");
const {
  officeAuthorization,
  teacherAuthorization,
  studentAuthorization,
} = require("./middlewares/authorization");
const { superfix } = require("./controllers/teacher");

const app = express();

// body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// connect databse
connectDatabase();

// view engine setup
app.set("views", "views");
app.set("view engine", "hbs");
app.engine(
  "hbs",
  engine({
    extname: "hbs",
    defaultLayout: "index",
    helpers: {
      superfix,
      isAttendancePending: (count) => count === -1 || count === "-1",
      json: (data) => JSON.stringify(data),
    },
  })
);

// logger
app.use(morgan("dev"));

// session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// static directory
app.use("/static", express.static(`${__dirname}/public`));

// route setup
app.use("/office", officeAuthorization, officeRouter);
app.use("/teacher", teacherAuthorization, teacherRouter);
app.use("/student", studentAuthorization, studentRouter);
app.use("/", indexRouter);

// 404 request
app.use((req, res, next) => {
  next(new ErrorResponse(404));
});

// error handling
app.use(errorHandler);

module.exports = app;
