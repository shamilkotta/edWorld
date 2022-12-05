/* eslint-disable camelcase */
const generateRazorpayOrder = require("../config/razorpay");
const { getFeeData, studentStat, batchStat } = require("../helpers");
const { getAllStudentsData } = require("../helpers/office");
const Payment = require("../models/payment");

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
      const studentStats = await studentStat(registerId);
      const batchStats = await batchStat(studentStats.batch);
      if (batchStats.avg_performance === 0) studentStats.currentStand = 0;
      else
        studentStats.currentStand = Math.floor(
          (studentStats.avg_performance / batchStats.avg_performance) * 100
        );
      if (allStudents[0]) {
        res.render("student/index", {
          student: allStudents[0],
          studentStats,
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
        result.data.invoice = registerId + Date.now();
        res.status(200).json(result);
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

  getGenerateOrder: async (req, res) => {
    const { registerId } = req.session.user;
    const { option, invoice } = req.params;

    try {
      // getting invoice data
      const result = await getInvoiceData(registerId, option);
      if (result.success) {
        // generating new order and id
        const orderRes = await generateRazorpayOrder(result.data.total);
        if (orderRes.success) {
          const amount = result.data.total;
          // saving generated order
          const payment = new Payment({
            registerId,
            amount,
            option,
            order_id: orderRes.order.id,
            invoice,
          });
          const saveRes = await payment.save();
          if (saveRes)
            // send res to client
            return res.status(200).json({
              success: true,
              data: {
                id: orderRes.order.id,
                registerId,
                amount,
              },
            });
          // on failure of save of order
          return res.status(500).json({
            success: false,
            message: "Something went wrong, try again",
          });
        }
        // on failure of ordergeneration
        return res.status(500).json({
          success: false,
          message: "Something went wrong, try again",
        });
      }
      // if can't get invoice
      if (result.statusCode) return res.status(result.statusCode).json(result);
      // else
      return res.status(404).json({
        success: false,
        message: "Can't generate your order, please try again later",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Can't generate your order, please try again later",
      });
    }
  },
};
