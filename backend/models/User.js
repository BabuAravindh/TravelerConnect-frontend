const mongoose = require("mongoose");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const doteenv = require('dotenv')
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Required for local auth
  role: { type: String, enum: ["admin", "user", "guide"], default: "user" },
  profilePic: { type: String },
  resetPasswordCode: String,
  resetPasswordExpires: Date, 
});



UserSchema.methods.createJWT = function () {
  return jwt.sign(
    {userId:this._id,name:this.name},
    process.env.JWT_SECRET,
    {
      expiresIn:process.env.JWT_EXPIRES_IN
    }
  )
}

UserSchema.methods.comparePassword = async function(candidatePassword){
  const isMatch = await bcrypt.compare(candidatePassword,this.password)
  return isMatch
}



const User = mongoose.model("User", UserSchema);
module.exports = User; // ✅ Use CommonJS export
