const express = require("express");
const router = express.Router();
const { getProfile, createOrUpdateProfile, deleteProfile } = require("../controllers/profileController");

// ✅ Get a user/guide profile
router.get("/:userId", getProfile);

// ✅ Create or Update profile (User/Guide)
router.post("/:userId", createOrUpdateProfile);

// ✅ Delete profile
router.delete("/:userId", deleteProfile);

module.exports = router;
