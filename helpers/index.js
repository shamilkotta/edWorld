/* eslint-disable no-param-reassign */
const { create } = require("express-handlebars");
const Batch = require("../models/batch");
const Payment = require("../models/payment");
const Student = require("../models/student");

module.exports = {
  compileHTMLEmailTemplate: (HTMLTemplatePath, replacements = {}) =>
    new Promise((resolve) => {
      const compiledHTML = create().render(HTMLTemplatePath, replacements);
      resolve(compiledHTML);
    }),

  getFeeData: (registerId) =>
    new Promise((resolve, reject) => {
      Student.aggregate([
        {
          $match: {
            registerId,
          },
        },
        {
          $lookup: {
            from: "batches",
            localField: "batch",
            foreignField: "code",
            pipeline: [
              {
                $project: {
                  _id: 0,
                  fee: 1,
                  fee_type: 1,
                },
              },
            ],
            as: "batchData",
          },
        },
        {
          $unwind: "$batchData",
        },
        {
          $project: {
            _id: 0,
            registerId: 1,
            batch: 1,
            payment_done: 1,
            installment: 1,
            amount: "$batchData.fee",
            feeOptions: {
              $cond: {
                if: {
                  $in: ["Installment", "$batchData.fee_type"],
                },
                then: 1,
                else: 0,
              },
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

  savePaymentStatus: ({ registerId, option }) =>
    new Promise((resolve, reject) => {
      let edit = [];
      if (option) {
        edit = [
          {
            $set: {
              installment: {
                $add: ["$installment", 1],
              },
            },
          },
          {
            $set: {
              payment_done: {
                $cond: {
                  if: {
                    $gte: ["$installment", 3],
                  },
                  then: true,
                  else: false,
                },
              },
            },
          },
        ];
      } else {
        edit = [
          {
            $set: {
              payment_done: true,
              installment: 3,
            },
          },
        ];
      }
      Student.updateOne({ registerId }, edit)
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    }),

  verifyRazorpaySignature: (paymentId, orderId, paymentSignature) =>
    new Promise((resolve) => {
      const generatedSignature = crypto
        .createHmac("SHA256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      const isValid = generatedSignature === paymentSignature;
      resolve(isValid);
    }),

  getAllPaymentsData: () =>
    new Promise((resolve, reject) => {
      // page -= 1;

      // if (sort === "date") sort = [sort];
      // else sort = sort.split(",");

      // const sortBy = {};
      // if (sort[1] && sort[1] === "1") sortBy[sort[0]] = -1;
      // else sortBy[sort[0]] = 1;

      // const today = new Date();

      Payment.aggregate([
        {
          $project: {
            registerId: 1,
            amount: 1,
            payment_type: {
              $cond: {
                if: {
                  $eq: ["$option", 1],
                },
                then: "Installment",
                else: "One time",
              },
            },
            ref_id: "$razorpay_order_id",
            receipt: 1,
            date: "$createdAt",
          },
        },
        {
          $lookup: {
            from: "students",
            localField: "registerId",
            foreignField: "registerId",
            pipeline: [
              {
                $project: {
                  _id: 0,
                  name: 1,
                  batch: 1,
                  address: 1,
                  email: 1,
                  phone: 1,
                },
              },
            ],
            as: "student",
          },
        },
        {
          $unwind: {
            path: "$student",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "batches",
            localField: "student.batch",
            foreignField: "code",
            pipeline: [
              {
                $project: {
                  fee: 1,
                  _id: 0,
                },
              },
            ],
            as: "fee",
          },
        },

        // search
        // {
        //   $match: {
        //     $or: [
        //       { code: { $regex: search, $options: "i" } },
        //       { head: { $regex: search, $options: "i" } },
        //       { start_date: { $regex: search, $options: "i" } },
        //       { end_date: { $regex: search, $options: "i" } },
        //       { fee: { $regex: search, $options: "i" } },
        //     ],
        //   },
        // },
        // {
        //   $sort: sortBy,
        // },
        // // transforming results
        // {
        //   $facet: {
        //     allBatches: [
        //       {
        //         $skip: page * limit,
        //       },
        //       {
        //         $limit: limit,
        //       },
        //     ],
        //     total: [{ $count: "total" }],
        //   },
        // },
        // {
        //   $unwind: {
        //     path: "$total",
        //     preserveNullAndEmptyArrays: true,
        //   },
        // },
        // {
        //   $addFields: {
        //     total: "$total.total",
        //     page: page + 1,
        //     limit,
        //   },
        // },
      ])
        .then((data) => {
          resolve(data[0]);
        })
        .catch((err) => {
          reject(err);
        });
    }),

  batchStat: (code) =>
    new Promise((resolve, reject) => {
      Batch.aggregate([
        {
          $match: {
            code,
          },
        },
        {
          $lookup: {
            from: "students",
            localField: "code",
            foreignField: "batch",
            pipeline: [
              {
                $project: {
                  _id: 0,
                  payment_done: 1,
                  installment: 1,
                  monthly_data: 1,
                  total: {
                    $size: "$monthly_data",
                  },
                },
              },
              {
                $addFields: {
                  avg_attendance: {
                    $divide: [
                      {
                        $sum: "$monthly_data.attended",
                      },
                      "$total",
                    ],
                  },
                  avg_performance: {
                    $divide: [
                      {
                        $sum: "$monthly_data.performance",
                      },
                      "$total",
                    ],
                  },
                },
              },
            ],
            as: "data",
          },
        },
        {
          $project: {
            _id: 0,
            fee: 1,
            working_days: 1,
            current_month: 1,
            data: 1,
            total: {
              $size: "$data",
            },
          },
        },
        {
          $addFields: {
            avg_attendance: {
              $round: {
                $divide: [
                  {
                    $sum: "$data.avg_attendance",
                  },
                  "$total",
                ],
              },
            },
            avg_performance: {
              $round: {
                $divide: [
                  {
                    $sum: "$data.avg_performance",
                  },
                  "$total",
                ],
              },
            },
            paymentComplete: {
              $round: {
                $multiply: [
                  {
                    $divide: [
                      {
                        $size: {
                          $filter: {
                            input: "$data",
                            as: "ele",
                            cond: "$ele.payment_done",
                          },
                        },
                      },
                      "$total",
                    ],
                  },
                  100,
                ],
              },
            },
          },
        },
        {
          $project: {
            data: 0,
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
};
