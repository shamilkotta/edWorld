const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
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
    salary: {
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
        type: String,
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
    qualification: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: Number,
      required: true,
      default: 0,
      validate: {
        validator: (arg) => arg >= 0,
      },
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Teacher", teacherSchema);
