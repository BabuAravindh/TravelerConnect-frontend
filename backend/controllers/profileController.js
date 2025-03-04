const mongoose = require("mongoose");
const UserProfile = require("../models/UserProfile");

// ✅ Get user profile
const getProfile = async (req, res) => {
  try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
          return res.status(400).json({ message: "Invalid user ID format" });
      }

      const profile = await UserProfile.findOne({ userId })
          .populate("address.stateId", "stateName")
          .populate("address.countryId", "countryName");

      if (!profile) {
          return res.status(200).json({ message: "Profile not found", isNewUser: true });
      }

      res.status(200).json(profile);
  } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Server error", error });
  }
};


const createOrUpdateProfile = async (req, res) => {
  try {
    const { firstName, lastName, gender } = req.body;

    // Check for missing required fields
    if (!firstName || !lastName) {
      return res.status(400).json({ error: "First name and last name are required." });
    }

    // Validate gender (assuming gender is an enum with specific values)
    const validGenders = ["Male", "Female", "Other"]; // Adjust based on your schema
    if (!validGenders.includes(gender)) {
      return res.status(400).json({ error: "Invalid gender value." });
    }

    // Proceed with profile creation or update
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { firstName, lastName, gender },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(profile);
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};








// ✅ Delete user/guide profile
const deleteProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const profile = await UserProfile.findOneAndDelete({ userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { getProfile, createOrUpdateProfile, deleteProfile };
