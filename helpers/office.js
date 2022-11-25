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
      const salt = parseInt(process.env.SALT, 10) || 10;
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

  getAllBatchesData: ({ page = 1, limit = 10, search = "", sort = "code" }) =>
    new Promise((resolve, reject) => {
      page -= 1;

      if (sort === "code") sort = [sort];
      else sort = sort.split(",");

      const sortBy = {};
      if (sort[1] && sort[1] === "1") sortBy[sort[0]] = -1;
      else sortBy[sort[0]] = 1;

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
                format: "%d/%m/%Y",
                date: "$start_date",
                timezone: "+05:30",
              },
            },
            end_date: {
              $dateToString: {
                format: "%d/%m/%Y",
                date: {
                  $dateAdd: {
                    startDate: "$start_date",
                    unit: "month",
                    amount: "$duration",
                  },
                },
                timezone: "+05:30",
              },
            },
            students: {
              $size: "$students",
            },
          },
        },
        // search
        {
          $match: {
            $or: [
              { code: { $regex: search, $options: "i" } },
              { head: { $regex: search, $options: "i" } },
              { start_date: { $regex: search, $options: "i" } },
              { end_date: { $regex: search, $options: "i" } },
              { fee: { $regex: search, $options: "i" } },
            ],
          },
        },
        {
          $sort: sortBy,
        },
        // transforming results
        {
          $facet: {
            allBatches: [
              {
                $skip: page * limit,
              },
              {
                $limit: limit,
              },
            ],
            total: [{ $count: "total" }],
          },
        },
        {
          $unwind: {
            path: "$total",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            total: "$total.total",
            page: page + 1,
            limit,
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

  getAllTeachersData: ({
    page = 1,
    limit = 10,
    search = "",
    sort = "registerId",
  }) =>
    new Promise((resolve, reject) => {
      page -= 1;

      if (sort === "registerId") sort = [sort];
      else sort = sort.split(",");

      const sortBy = {};
      if (sort[1] && sort[1] === "1") sortBy[sort[0]] = -1;
      else sortBy[sort[0]] = 1;

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
                format: "%d/%m/%Y",
                date: "$birth_date",
                timezone: "+05:30",
              },
            },
          },
        },
        {
          $project: {
            password: 0,
          },
        },
        // search
        {
          $match: {
            $or: [
              { registerId: { $regex: search, $options: "i" } },
              { name: { $regex: search, $options: "i" } },
              { batch: { $regex: search, $options: "i" } },
              { qualification: { $regex: search, $options: "i" } },
              { phone: { $regex: search, $options: "i" } },
            ],
          },
        },
        {
          $sort: sortBy,
        },
        // transforming results
        {
          $facet: {
            allTeachers: [
              {
                $skip: page * limit,
              },
              {
                $limit: limit,
              },
            ],
            total: [{ $count: "total" }],
          },
        },
        {
          $unwind: {
            path: "$total",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            total: "$total.total",
            page: page + 1,
            limit,
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

  getAllStudentsData: ({
    page = 1,
    limit = 10,
    search = "",
    sort = "registerId",
  }) =>
    new Promise((resolve, reject) => {
      page -= 1;

      if (sort === "registerId") sort = [sort];
      else sort = sort.split(",");

      const sortBy = {};
      if (sort[1] && sort[1] === "1") sortBy[sort[0]] = -1;
      else sortBy[sort[0]] = 1;

      Student.aggregate([
        {
          $addFields: {
            birth_date: {
              $dateToString: {
                format: "%d/%m/%Y",
                date: "$birth_date",
                timezone: "+05:30",
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
        // search
        {
          $match: {
            $or: [
              { registerId: { $regex: search, $options: "i" } },
              { name: { $regex: search, $options: "i" } },
              { batch: { $regex: search, $options: "i" } },
              { education: { $regex: search, $options: "i" } },
              { phone: { $regex: search, $options: "i" } },
            ],
          },
        },
        {
          $sort: sortBy,
        },
        // transforming results
        {
          $facet: {
            allStudents: [
              {
                $skip: page * limit,
              },
              {
                $limit: limit,
              },
            ],
            total: [{ $count: "total" }],
          },
        },
        {
          $unwind: {
            path: "$total",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            total: "$total.total",
            page: page + 1,
            limit,
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

  getBatch: (code) =>
    new Promise((resolve, reject) => {
      code = code.toUpperCase();
      Batch.aggregate([
        {
          $match: {
            code,
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

  getTeacher: (registerId) =>
    new Promise((resolve, reject) => {
      registerId = registerId.toUpperCase();
      Teacher.aggregate([
        {
          $match: {
            registerId,
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

  getStudent: (registerId) =>
    new Promise((resolve, reject) => {
      registerId = registerId.toUpperCase();
      Student.aggregate([
        {
          $match: {
            registerId,
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
