const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
const nodemailer = require("nodemailer");

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

// Signup Controller
const signup = async (req, res) => {
    try {
        console.log("✅ Received Data:", req.body);

        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        console.log("🔍 Checking if user exists...");
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("❌ User already exists:", existingUser);
            return res.status(400).json({ message: "User already exists" });
        }

        console.log("🔐 Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("📝 Creating new user...");
        const newUser = new User({ name, email, password: hashedPassword });

        console.log("💾 Saving user to database...");
        await newUser.save();
        console.log("✅ User saved successfully!");

        const token = jwt.sign(
            { id: newUser._id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
        );

        console.log("🔑 Token generated:", token);

        res.status(201).json({ message: "User registered successfully", token, user: newUser });
    } catch (error) {
        console.error("❌ Signup Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Login Controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Please enter a valid email and password" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful", user: { name: user.name, role: user.role }, token });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Forgot Password Controller
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryTime = Date.now() + 10 * 60 * 1000;

        user.resetPasswordCode = resetCode;
        user.resetPasswordExpires = expiryTime;
        await user.save();

        console.log(`🔹 Reset code generated for ${email}:`, resetCode);

        try {
            await transporter.sendMail({
                from: `"TravelerConnect" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: "Password Reset Code",
                text: `Your password reset code is: ${resetCode}. It expires in 10 minutes.`,
            });

            console.log(`✅ Reset code sent to ${email}`);
        } catch (emailError) {
            console.error("❌ Email sending failed:", emailError);
            return res.status(500).json({ message: "Failed to send reset email" });
        }

        res.status(200).json({ message: "Reset code sent to email", ...(process.env.NODE_ENV === "development" && { resetCode }) });
    } catch (error) {
        console.error("❌ Forgot Password Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Verify Reset Code Controller
const verifyResetCode = async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp) {
            return res.status(400).json({ message: "Reset code is required" });
        }

        const user = await User.findOne({ resetPasswordCode: otp });
        if (!user || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired reset code" });
        }

        res.status(200).json({ message: "Code verified successfully", email: user.email });
    } catch (error) {
        console.error("❌ Verify Code Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Reset Password Controller
const resetPassword = async (req, res) => {
    try {
        console.log("Received request:", req.body);
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ message: "New password is required" });
        }

        const user = await User.findOne({ resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            return res.status(404).json({ message: "User session expired or not found" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordCode = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("❌ Reset Password Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { signup, login, forgotPassword, verifyResetCode, resetPassword };
