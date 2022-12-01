const { create } = require("express-handlebars");
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
};
