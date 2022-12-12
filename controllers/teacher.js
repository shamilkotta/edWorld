/* eslint-disable camelcase */
const { studentStat, batchStat } = require("../helpers");
const {
  getAllTeachersData,
  getAllBatchesData,
  getAllStudentsData,
  getOpenTeachers,
} = require("../helpers/office");
const Batch = require("../models/batch");
const Student = require("../models/student");

module.exports = {
  getTeacherView: async (req, res) => {
    try {
      const { registerId } = req.session.user;
      const { allTeachers } = await getAllTeachersData({ search: registerId });
      await getOpenTeachers();
      if (allTeachers[0]) {
        res.render("teacher/index", { teacher: allTeachers[0] });
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      res.redirect("/login");
    }
  },

  superfix: (index, inc = false) => {
    if (inc) {
      if (index === 0 || index === "0") return "1<sup>st</sup>";
      if (index === 1 || index === "1") return "2<sup>nd</sup>";
      if (index === 2 || index === "2") return "3<sup>rd</sup>";
      return `${index + 1}<sup>th</sup>`;
    }
    if (index === 1 || index === "1") return "1<sup>st</sup>";
    if (index === 2 || index === "2") return "2<sup>nd</sup>";
    if (index === 3 || index === "3") return "3<sup>rd</sup>";
    return `${index}<sup>th</sup>`;
  },

  getClassRoom: async (req, res) => {
    try {
      const { registerId } = req.session.user;
      const batch = await Batch.findOne({ batch_head: registerId });
      if (!batch) res.redirect("/teacher");
      else {
        const { allBatches } = await getAllBatchesData({ search: batch.code });
        const students = await getAllStudentsData({ search: batch.code });
        const batchStats = await batchStat(batch.code);
        const seatNum = allBatches[0].seat_num;
        const studentNum = allBatches[0].students;
        batchStats.batchFill = ((studentNum / seatNum) * 100).toFixed(1);
        res.render("teacher/classroom", {
          batch: allBatches[0],
          ...students,
          batchStats,
        });
      }
    } catch (error) {
      res.redirect("/teacher");
    }
  },

  getStudent: async (req, res) => {
    const { registerId } = req.params;
    try {
      const { allStudents } = await getAllStudentsData({ search: registerId });
      const studentStats = await studentStat(registerId);
      const subjects = await Batch.aggregate([
        { $match: { code: allStudents[0].batch } },
        { $project: { _id: 0, subjects: 1 } },
      ]);
      studentStats.fee_completion = (
        (studentStats.installment / 3) *
        100
      ).toFixed(1);
      const batchStats = await batchStat(studentStats.batch);
      if (batchStats.avg_performance === 0) studentStats.currentStand = 0;
      else
        studentStats.currentStand = Math.floor(
          (studentStats.avg_performance / batchStats.avg_performance) * 100
        );
      if (allStudents[0]) {
        res.render("teacher/student", {
          student: allStudents[0],
          studentStats,
          subjects: subjects[0].subjects,
        });
      } else {
        res.redirect("/teacher/classroom");
      }
    } catch (error) {
      res.redirect("/teacher/classroom");
    }
  },

  putTotalWrokingDays: async (req, res) => {
    try {
      if (req.validationErr)
        res.status(400).json({
          success: false,
          message: req.validationErr,
        });
      else {
        // eslint-disable-next-line camelcase
        const { working_days } = req.validData;
        const { registerId } = req.session.user;
        const batchResult = await Batch.findOneAndUpdate(
          { batch_head: registerId },
          {
            // eslint-disable-next-line camelcase
            $push: { working_days },
            $inc: { current_month: 1 },
          }
        );
        if (!batchResult)
          res.status(400).json({
            success: false,
            message: "Can't add working days, please login again",
          });
        else {
          const studentResult = await Student.updateMany(
            { batch: batchResult.code },
            {
              $push: {
                monthly_data: {
                  // eslint-disable-next-line camelcase
                  total: working_days,
                  attended: -1,
                  performance: 0,
                },
              },
            }
          );
          if (studentResult.acknowledged && studentResult.modifiedCount) {
            res.status(200).json({
              success: true,
              message: "Working days added successfully",
            });
          } else {
            res.status(400).json({
              success: false,
              message: "Can't add working days, please login again",
            });
          }
        }
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }
  },

  putMonthlyData: async (req, res) => {
    if (req.validationErr) {
      res.status(400).json({
        success: false,
        message: req.validationErr,
      });
    } else {
      try {
        const { attendance, performance, subject_performance, registerId, id } =
          req.validData;
        const result = await Student.updateOne(
          {
            registerId,
            "monthly_data._id": id,
          },
          {
            $set: {
              "monthly_data.$.attended": attendance,
              "monthly_data.$.performance": performance,
              "monthly_data.$.subject_performance": subject_performance,
            },
          }
        );

        if (result.acknowledged && result.modifiedCount) {
          res.status(200).json({
            success: true,
            message: "Monthly data added",
          });
        } else {
          res.status(400).json({
            success: false,
            message: "Can't find student",
          });
        }
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Something went wrong, try again",
        });
      }
    }
  },
};
