const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    immutable: true,
  },
  start_date: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    immutable: true,
  },
  fee: {
    type: Number,
    required: true,
    immutable: true,
  },
  seat_num: {
    type: Number,
    required: true,
  },
  batch_head: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    default: "",
  },
  fee_type: {
    type: [String],
    required: true,
    default: ["One time"],
    validate: {
      validator: (arg) =>
        arg.length !== 0 &&
        arg.every((ele) => ["One time", "Installment"].includes(ele)),
    },
  },
});

module.exports = mongoose.model("Batch", batchSchema);
