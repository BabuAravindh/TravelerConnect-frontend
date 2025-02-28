const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema({
  stateName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  order: { type: Number },
});

module.exports = mongoose.model("State", stateSchema);
