require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(express.json()); // ✅ Parses JSON body
app.use(express.urlencoded({ extended: true })); // 
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// ✅ Apply Clerk authentication middleware (optional for protected routes)
// app.use(ClerkExpressRequireAuth()); // ❌ Remove this if you don't want all routes to require auth

// Routes
app.use("/auth", authRoutes); // 🔹 Protect specific routes inside `authRoutes`

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
