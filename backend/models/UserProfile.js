const mongoose = require("mongoose");
const country = require('./Country')
const state = require('./State')
const userProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  dateOfBirth: { type: Date },
  profilePicture: { type: String },
  address: {
    street: String,
    city: String,
    stateId: { type: mongoose.Schema.Types.ObjectId, ref: "State" },
    countryId: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
    postalCode: Number,
  },
  dateJoined: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  gender: {
    type: String,
    enum: ["male", "female", "others"],
    required:true,
  },
  role: { 
    type: String, 
    enum: ["user", "guide"], 
    required: true 
  },
  
});

const UserProfile = mongoose.model("UserProfile", userProfileSchema);
module.exports = UserProfile;
