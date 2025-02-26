const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/User"); // Ensure you have the correct path

const router = express.Router();


// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );


// router.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: "/auth/failure" }),
//   (req, res) => {

//     res.redirect("http://localhost:3000");
//   }
// );


// router.get("/user", (req, res) => {
//   if (req.user) {
//     res.json({ user: req.user });
//   } else {
//     res.status(401).json({ message: "Not authenticated" });
//   }
// });


// router.get("/logout", (req, res) => {
//   req.logout(() => {
//     res.redirect(process.env.CLIENT_URL);
//   });
// });



router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;

