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
};
