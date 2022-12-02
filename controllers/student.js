/* eslint-disable camelcase */
const generateRazorpayOrder = require("../config/razorpay");
const { getFeeData } = require("../helpers");
const { getAllStudentsData } = require("../helpers/office");

const superfix = (index, inc = false) => {
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
};

const getInvoiceData = async (registerId, option) => {
  try {
    const feeData = await getFeeData(registerId);
    if (!feeData)
      return {
        success: false,
        message: "Can't fetch your invoice, please try again later",
      };

    // else
    const { feeOptions, amount, payment_done, installment } = feeData;
    const tax = 0.0;
    const taxAmount = 0.0;
    const first = amount / 3.0;
    const firstAmount = Math.round(first / 100) * 100;
    const second = (amount - firstAmount) / 2.0;
    const secondAmount = Math.round(second / 100) * 100;
    const thirdAmount = amount - (secondAmount + firstAmount);

    // if user selected 'installment' and has 'installment' option enabled
    if (option === "1" && feeData.feeOptions) {
      // payment already done
      if (payment_done)
        return {
          success: false,
          statusCode: 200,
          errorType: "completed alredy",
          message: "You have completed your fee payment already, thank you",
        };

      // pending payment
      let currentAmount;
      let currentBalance;

      if (installment === 0) {
        currentAmount = firstAmount;
        currentBalance = amount - firstAmount;
      } else if (installment === 1) {
        currentAmount = secondAmount;
        currentBalance = amount - (firstAmount + secondAmount);
      } else if (installment === 2) {
        currentAmount = thirdAmount;
        currentBalance = 0.0;
      } else {
        currentAmount = 0.0;
        currentBalance = 0.0;
      }

      const data = {
        feeOptions,
        amount: currentAmount,
        tax,
        taxAmount,
        total: currentAmount + taxAmount,
        balance: currentBalance,
      };

      return {
        success: true,
        data,
      };

      // if user selected 'onetime' and has 'installment' option enabled
    }
    if (option === "0" && feeData.feeOptions) {
      // payment alredy done
      if (payment_done)
        return {
          success: false,
          statusCode: 200,
          errorType: "completed alredy",
          message: "You have completed your fee payment already, thank you",
        };

      // payment pending
      let currentAmount;

      if (installment === 3) currentAmount = 0.0;
      else if (installment === 2)
        currentAmount = amount - (secondAmount + firstAmount);
      else if (installment === 1) currentAmount = amount - firstAmount;
      else currentAmount = amount;

      const data = {
        feeOptions,
        amount: currentAmount,
        tax,
        taxAmount,
        total: currentAmount + taxAmount,
        balance: 0.0,
      };

      return {
        success: true,
        data,
      };

      // if user selected 'onetime' and has 'no installment' option
    }
    if (option === "0" && !feeData.feeOptions) {
      // payment alredy done
      if (payment_done)
        return {
          success: false,
          statusCode: 200,
          errorType: "completed alredy",
          message: "You have completed your fee payment already, thank you",
        };

      // payment pending
      const data = {
        feeOptions,
        amount,
        tax,
        taxAmount,
        total: amount + taxAmount,
        balance: 0.0,
      };

      return {
        success: true,
        data,
      };

      // invalid option combo
    }
    return {
      success: false,
      statusCode: 404,
      errorType: "can't fetch",
      message: "Can't fetch your invoice, please try again later",
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 404,
      errorType: "can't fetch",
      message: "Can't fetch your invoice, please try again later",
    };
  }
};

module.exports = {
  getStudentView: async (req, res) => {
    try {
      const { registerId } = req.session.user;
      const { allStudents } = await getAllStudentsData({ search: registerId });
      if (allStudents[0]) {
        res.render("student/index", {
          student: allStudents[0],
          helpers: {
            superfix,
            isAttendancePending: (count) => count === -1 || count === "-1",
          },
        });
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      res.redirect("/login");
    }
  },

  getFeeInvoice: async (req, res) => {
    const { registerId } = req.session.user;
    const { option } = req.params;

    try {
      // getting invoice data
      const result = await getInvoiceData(registerId, option);
      if (result.success) {
        // generating new order and id
        const orderRes = await generateRazorpayOrder(result.data.total);
        if (orderRes.success) {
          result.data.orderId = orderRes.order.id;
          result.data.registerId = registerId;
          res.status(200).json(result);
        } else {
          res.status(500).json({
            success: false,
            message: "Something went wrong, try again",
          });
        }
      } else if (result.statusCode) res.status(result.statusCode).json(result);
      else
        res.status(404).json({
          success: false,
          message: "Can't fetch your invoice, please try again later",
        });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Can't fetch your invoice, please try again later",
      });
    }
  },
};
