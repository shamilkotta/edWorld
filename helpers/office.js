/* eslint-disable no-param-reassign */
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
          if (count < 9) num = `00${count + 1}`;
          else if (count > 8 && count < 99) num = `0${count + 1}`;
          const code = `${pre}${num}`;
          resolve(code);
        })
        .catch((err) => {
          reject(err);
        });
    }),

  createPassword: (data) =>
    new Promise((resolve, reject) => {
      const salt = Number(process.env.SALT) || 10;
      bcrypt
        .hash(`${data}`, salt)
        .then((hash) => {
          resolve(hash);
        })
        .catch((err) => {
          reject(err);
        });
    }),

  getOpenTeachers: () =>
    new Promise((resolve, reject) => {
      const today = new Date();
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
          $unwind: {
            path: "$closed_batches",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $or: [
              {
                closed_batches: { $exists: false },
              },
              {
                $expr: {
                  $lt: [
                    {
                      $dateAdd: {
                        startDate: "$closed_batches.start_date",
                        unit: "month",
                        amount: "$closed_batches.duration",
                      },
                    },
                    today,
                  ],
                },
              },
            ],
          },
        },
        {
          $project: {
            registerId: 1,
            name: 1,
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

  getStudentsCountInBatch: (batchId) =>
    new Promise((resolve, reject) => {
      batchId.toUpperCase();
      Batch.aggregate([
        {
          $match: {
            code: batchId,
          },
        },
        {
          $lookup: {
            from: "students",
            localField: "code",
            foreignField: "batch",
            as: "students",
          },
        },
        {
          $project: {
            code: 1,
            seat_num: 1,
            _id: 0,
            student_count: {
              $size: "$students",
            },
          },
        },
      ])
        .then((data) => {
          resolve(data[0]);
        })
        .catch((err) => {
          reject(err);
        });
    }),

  getAllBatchesData: () =>
    new Promise((resolve, reject) => {
      Batch.aggregate([
        {
          $lookup: {
            from: "teachers",
            localField: "batch_head",
            foreignField: "registerId",
            pipeline: [
              {
                $project: {
                  _id: 0,
                  name: 1,
                },
              },
            ],
            as: "head",
          },
        },
        {
          $unwind: "$head",
        },
        {
          $lookup: {
            from: "students",
            localField: "code",
            foreignField: "batch",
            pipeline: [
              {
                $project: {
                  registerId: 1,
                  _id: 0,
                },
              },
            ],
            as: "students",
          },
        },
        {
          $addFields: {
            head: "$head.name",
            start_date: {
              $dateToString: {
                format: "%m/%d/%Y",
                date: "$start_date",
              },
            },
            end_date: {
              $dateToString: {
                format: "%m/%d/%Y",
                date: {
                  $dateAdd: {
                    startDate: "$start_date",
                    unit: "month",
                    amount: "$duration",
                  },
                },
              },
            },
            students: {
              $size: "$students",
            },
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

  getAllTeachersData: () =>
    new Promise((resolve, reject) => {
      Teacher.aggregate([
        {
          $lookup: {
            from: "batches",
            localField: "registerId",
            foreignField: "batch_head",
            pipeline: [
              {
                $project: {
                  code: 1,
                  _id: 0,
                },
              },
            ],
            as: "batch",
          },
        },
        {
          $unwind: { path: "$batch", preserveNullAndEmptyArrays: true },
        },
        {
          $addFields: {
            batch: "$batch.code",
            birth_date: {
              $dateToString: {
                format: "%m/%d/%Y",
                date: "$birth_date",
              },
            },
          },
        },
        {
          $project: {
            password: 0,
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

  getOpenBatches: () =>
    new Promise((resolve, reject) => {
      const today = new Date();
      Batch.aggregate([
        {
          $lookup: {
            from: "students",
            localField: "code",
            foreignField: "batch",
            as: "students",
          },
        },
        {
          $addFields: {
            studentsCount: {
              $size: "$students",
            },
          },
        },
        {
          $match: {
            start_date: { $gte: today },
            $expr: { $lt: ["$studentsCount", "$seat_num"] },
          },
        },
        {
          $project: {
            code: 1,
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

  getAllStudentsData: () =>
    new Promise((resolve, reject) => {
      Student.aggregate([
        {
          $addFields: {
            birth_date: {
              $dateToString: {
                format: "%m/%d/%Y",
                date: "$birth_date",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            password: 0,
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
