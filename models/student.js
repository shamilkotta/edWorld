const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  registerId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    immutable: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  birth_date: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    default: "Not specified",
    validate: {
      validator: (arg) =>
        ["Male", "Female", "Other", "Not specified"].includes(arg),
    },
  },
  parent_name: {
    type: String,
    required: true,
    trim: true,
  },
  parent_phone: {
    type: Number,
    required: true,
  },
  address: {
    house_name: {
      type: String,
      trim: true,
    },
    place: {
      type: String,
      required: true,
      trim: true,
    },
    post: {
      type: String,
      required: true,
      trim: true,
    },
    pin: {
      type: Number,
      required: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
  },
  education: {
    type: String,
    required: true,
    trim: true,
  },
  institute: {
    type: String,
    required: true,
    trim: true,
  },
  university: {
    type: String,
    required: true,
    trim: true,
  },
  batch: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  profile: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  password_strong: {
    type: Boolean,
    default: false,
  },
  account_status: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Student", studentSchema);
