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
    let { userId } = req.params;
    const profileData = req.body;

    console.log("Received userId:", userId);
    console.log("Type of userId:", typeof userId);
    console.log("UserId Length:", userId.length);

    // ✅ Step 1: Ensure userId is 24 characters
    if (!userId || userId.length !== 24) {
      return res.status(400).json({ message: "Invalid user ID format (must be 24 characters)" });
    }

    // ✅ Step 2: Convert to ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid ObjectId format" });
    }
    userId = new mongoose.Types.ObjectId(userId);

    // ✅ Step 3: Validate role
    if (!profileData.role || !["user", "guide"].includes(profileData.role)) {
      return res.status(400).json({ message: "Role must be 'user' or 'guide'." });
    }

    let profile = await UserProfile.findOne({ userId });

    if (profile) {
      // ✅ Update existing profile
      profile = await UserProfile.findOneAndUpdate({ userId }, profileData, { new: true });
      return res.status(200).json({ message: "Profile updated successfully", profile });
    } else {
      // ✅ Create new profile
      profile = new UserProfile({ userId, ...profileData });
      await profile.save();
      return res.status(201).json({ message: "Profile created successfully", profile });
    }
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({ message: "Server error", error });
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
