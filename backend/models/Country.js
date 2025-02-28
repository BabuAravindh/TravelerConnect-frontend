const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema({
  countryName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  order: { type: Number },
});

module.exports = mongoose.model("Country", countrySchema);
