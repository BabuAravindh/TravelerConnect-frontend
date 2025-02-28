require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();



//Routes imports
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require('./routes/profileRoutes')





















app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // 
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);



// AuthRoutes
app.use("/auth", authRoutes); 
//ProfileRoutes
app.use("/api/profile", profileRoutes);























// Connection to mongodb atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
