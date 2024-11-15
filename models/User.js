const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  isVerified: { type: Boolean, default: false },
  tokenVersion: { type: Number, default: 0 },
  createdAt: { type: Date, default: new Date() },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
