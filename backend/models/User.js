const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  googleId: String,
  avatar: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);