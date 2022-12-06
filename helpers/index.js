/* eslint-disable no-param-reassign */
const crypto = require("crypto");

const { create } = require("express-handlebars");
const Batch = require("../models/batch");
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
                    $cond: [
                      { $eq: ["$total", 0] },
                      0,
                      {
                        $divide: [
                          {
                            $sum: "$monthly_data.attended",
                          },
                          "$total",
                        ],
                      },
                    ],
                  },
                  avg_performance: {
                    $cond: [
                      { $eq: ["$total", 0] },
                      0,
                      {
                        $divide: [
                          {
                            $sum: "$monthly_data.performance",
                          },
                          "$total",
                        ],
                      },
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
              $round: [
                {
                  $cond: [
                    { $eq: ["$total", 0] },
                    0,
                    {
                      $divide: [
                        {
                          $sum: "$data.avg_attendance",
                        },
                        "$total",
                      ],
                    },
                  ],
                },
                1,
              ],
            },
            avg_performance: {
              $round: [
                {
                  $cond: [
                    { $eq: ["$total", 0] },
                    0,
                    {
                      $divide: [
                        {
                          $sum: "$data.avg_performance",
                        },
                        "$total",
                      ],
                    },
                  ],
                },
                1,
              ],
            },
            paymentComplete: {
              $round: [
                {
                  $multiply: [
                    {
                      $cond: [
                        { $eq: ["$total", 0] },
                        0,
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
                      ],
                    },
                    100,
                  ],
                },
                1,
              ],
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

  studentStat: (registerId) =>
    new Promise((resolve, reject) => {
      Student.aggregate([
        {
          $match: { registerId },
        },
        {
          $project: {
            registerId: 1,
            batch: 1,
            _id: 0,
            payment_done: 1,
            installment: 1,
            monthly_data: 1,
            total_month: {
              $size: "$monthly_data",
            },
          },
        },
        {
          $addFields: {
            avg_attendance: {
              $round: [
                {
                  $cond: [
                    { $eq: ["$total_month", 0] },
                    0,
                    {
                      $divide: [
                        {
                          $sum: "$monthly_data.attended",
                        },
                        "$total_month",
                      ],
                    },
                  ],
                },
                1,
              ],
            },
            avg_performance: {
              $round: [
                {
                  $cond: [
                    { $eq: ["$total_month", 0] },
                    0,
                    {
                      $divide: [
                        {
                          $sum: "$monthly_data.performance",
                        },
                        "$total_month",
                      ],
                    },
                  ],
                },
                1,
              ],
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
};
