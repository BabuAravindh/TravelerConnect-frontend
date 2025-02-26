const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String, unique: true },
  role: { type: String, enum: ["admin", "user", "guide"], default: "user" },
  profilePic: { type: String },
});

module.exports = mongoose.model("User", UserSchema);
