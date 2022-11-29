const bcrypt = require("bcrypt");

const {
  getAllTeachersData,
  getAllBatchesData,
  getAllStudentsData,
  createPassword,
} = require("../helpers/office");
const Batch = require("../models/batch");
const Student = require("../models/student");
const Teacher = require("../models/teacher");

module.exports = {
  getTeacherView: async (req, res) => {
    try {
      const { registerId } = req.session.user;
      const { allTeachers } = await getAllTeachersData({ search: registerId });
      if (allTeachers[0]) {
        res.render("teacher/index", { teacher: allTeachers[0] });
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      res.redirect("/login");
    }
  },

  getClassRoom: async (req, res) => {
    try {
      const { registerId } = req.session.user;
      const batch = await Batch.findOne({ batch_head: registerId });
      if (!batch) res.redirect("/teacher");
      else {
        const { allBatches } = await getAllBatchesData({ search: batch.code });
        const students = await getAllStudentsData({ search: batch.code });
        res.render("teacher/classroom", { batch: allBatches[0], ...students });
      }
    } catch (error) {
      res.redirect("/teacher");
    }
  },

  editDetails: async (req, res) => {
    try {
      if (req.validationErr) {
        res.status(400).json({
          success: false,
          message: req.validationErr,
        });
      } else {
        const data = req.validData;
        const { registerId } = req.session.user;
        const result = await Teacher.updateOne({ registerId }, data, {
          runValidators: true,
        });
        if (result.acknowledged && result.modifiedCount)
          res.status(200).json({
            success: true,
            message: "Updated successfully",
          });
        else throw new Error("Something went wrong! try again");
      }
    } catch (error) {
      if (error.code === 11000)
        res.status(400).json({
          success: false,
          message: "Email or phone number already in use",
        });
      else
        res.status(500).json({
          success: false,
          message: "Something went wrong! try again",
        });
    }
  },

  changePassword: async (req, res) => {
    const { currentPassword, password, confirmPassword } = req.body;
    const { registerId, role } = req.session.user;
    // selecting user based on role
    let model;
    if (role === "teacher") model = Teacher;
    else model = Student;

    try {
      // finding user based on reigster id
      const user = await model.findOne({ registerId });
      if (!user)
        return res.status(400).json({
          success: false,
          message: "Can't find the user, please login again",
        });

      // if user exists > comparing current passswords
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match)
        return res.status(400).json({
          success: false,
          message: "Current password not matching",
        });

      // validating new passwords
      if (
        /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W])(?!.*\s).{8,16})/.test(
          password
        )
      ) {
        if (password === confirmPassword) {
          // if so creating new pass hash
          const newPass = await createPassword(password);
          // updating databse with new pass
          const result = await model.updateOne(
            { registerId },
            { password: newPass, password_strong: true }
          );

          if (result.acknowledged && result.modifiedCount) {
            return res.status(200).json({
              success: true,
              message: "Password changed succesfully",
            });
          }
          return res.status(500).json({
            success: false,
            message: "Something went wrong! try again",
          });
        }
        return res.status(400).json({
          success: false,
          message: "Password must be matching",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Enter a strong password",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong! try again",
      });
    }
  },
};
