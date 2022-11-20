const bcrypt = require("bcrypt");

const Batch = require("../models/batch");
const Teacher = require("../models/teacher");
const Student = require("../models/student");

module.exports = {
  generateUniqueCode: (data) =>
    new Promise((resolve, reject) => {
      let model;
      let pre;
      let num;
      if (data === "batch") {
        model = Batch;
        pre = "BH";
      } else if (data === "teacher") {
        model = Teacher;
        pre = "TR";
      } else {
        model = Student;
        pre = "ST";
      }

      model
        .countDocuments({})
        .then((count) => {
          if (count < 10) num = `00${count + 1}`;
          else if (count > 9 && count < 100) num = `0${count + 1}`;
          const code = `${pre}${num}`;
          resolve(code);
        })
        .catch((err) => {
          reject(err);
        });
    }),

  createPassword: (date) =>
    new Promise((resolve, reject) => {
      const salt = Number(process.env.SALT) || 10;
      bcrypt
        .hash(`${date}`, salt)
        .then((hash) => {
          resolve(hash);
        })
        .catch((err) => {
          reject(err);
        });
    }),

  getOpenTeachers: () =>
    new Promise((resolve, reject) => {
      Teacher.aggregate([
        {
          $lookup: {
            from: "batches",
            localField: "registerId",
            foreignField: "batch_head",
            as: "closed_batches",
          },
        },
        {
          $match: {
            closed_batches: { $eq: [] },
          },
        },
        {
          $project: {
            registerId: 1,
            _id: 0,
          },
        },
      ])
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    }),
};
