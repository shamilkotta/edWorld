const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    registerId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    option: {
      type: Number,
      required: true,
      default: 0,
    },
    razorpay_payment_id: {
      type: String,
      required: true,
    },
    razorpay_order_id: {
      type: String,
      required: true,
    },
    razorpay_signature: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
