const mongoose = require("mongoose");
const { isEmail } = require("validator");

const userSchema = new mongoose.Schema(
  {
    lastName: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 55,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 55,
      trim: true,
    },
    fullName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      validate: [isEmail],
    },
    token: String,
    hash: String,
    salt: String,
    gender: {
      type: String,
    },
    birthday: {
      type: String,
    },
    bio: {
      type: String,
      max: 1024,
    },
    followers: {
      type: [String],
    },
    following: {
      type: [String],
    },
    pending: {
      type: [String],
    },
    friends: {
      type: [String],
    },
    likes: {
      type: [String],
    },

    informations: {
      phone: String,
      adress: String,
      cp: Number,
      city: String,
    },
    avatar: {
      type: String,
      default: "test",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
