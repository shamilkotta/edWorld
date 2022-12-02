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
    order_id: {
      type: String,
      required: true,
    },
    invoice: {
      type: String,
      required: true,
    },
    payment_id: {
      type: String,
    },
    signature: {
      type: String,
    },
    receipt: {
      type: String,
    },
    status: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
