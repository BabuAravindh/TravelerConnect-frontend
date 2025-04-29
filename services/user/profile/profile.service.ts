import { Profile } from "@/services/types/user/profile.type";

export const ProfileService = {
  async fetchProfile(userId: string): Promise<Profile | null> {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/${userId}`);
      if (!res.ok) throw new Error("Profile not found");
      
      const data = await res.json();
      return this.formatProfileData(data, userId);
    } catch (error: any) {
      console.warn("No profile found:", error.message);
      return null;
    }
  },

  formatProfileData(data: any, userId: string): Profile {
    let formattedDateOfBirth = "";
    if (data.dateOfBirth) {
      const date = new Date(data.dateOfBirth);
      if (!isNaN(date.getTime())) {
        formattedDateOfBirth = date.toISOString().split("T")[0];
      }
    }

    return {
      userId: userId,
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      profilePicture: data.profilePicture || "",
      phoneNumber: data.phoneNumber || "",
      dateOfBirth: formattedDateOfBirth,
      address: data.address || { countryId: "", stateId: "", countryName: "", stateName: "" },
      gender: data.gender || "male",
      _id: data._id
    };
  },

  async saveProfile(
    profile: Profile,
    profilePicFile: File | null,
    isUpdate: boolean
  ): Promise<Profile> {
    const formData = new FormData();
    
    formData.append("userId", profile.userId || "");
    formData.append("firstName", profile.firstName);
    formData.append("lastName", profile.lastName);
    formData.append("gender", profile.gender);
    formData.append("phoneNumber", profile.phoneNumber);
    formData.append("dateOfBirth", profile.dateOfBirth);
    formData.append("countryId", profile.address?.countryId || "");
    formData.append("stateId", profile.address?.stateId || "");
    formData.append("countryName", profile.address?.countryName || "");
    formData.append("stateName", profile.address?.stateName || "");

    if (profilePicFile) {
      formData.append("profilePic", profilePicFile);
    }

    const url = isUpdate
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/profile/${profile.userId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/profile`;

    const res = await fetch(url, {
      method: isUpdate ? "PUT" : "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to save profile");
    }

    return await res.json();
  },

  validateProfile(profile: Profile, countries: any[], states: any[]): Record<string, string> {
    const validationErrors: Record<string, string> = {};
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const nameRegex = /^[A-Za-z\s]{2,50}$/;

    if (!profile.firstName.trim()) validationErrors.firstName = "First name is required.";
    else if (!nameRegex.test(profile.firstName))
      validationErrors.firstName = "First name must be 2-50 letters only.";

    if (!profile.lastName.trim()) validationErrors.lastName = "Last name is required.";
    else if (!nameRegex.test(profile.lastName))
      validationErrors.lastName = "Last name must be 2-50 letters only.";

    if (!profile.phoneNumber.trim()) validationErrors.phoneNumber = "Phone number is required.";
    else if (!phoneRegex.test(profile.phoneNumber))
      validationErrors.phoneNumber = "Invalid phone number format (e.g., +1234567890).";

    if (!profile.dateOfBirth) validationErrors.dateOfBirth = "Date of birth is required.";
    else {
      const dob = new Date(profile.dateOfBirth);
      const today = new Date();
      const minDate = new Date("1900-01-01");
      if (isNaN(dob.getTime())) {
        validationErrors.dateOfBirth = "Invalid date format.";
      } else if (dob >= today) {
        validationErrors.dateOfBirth = "Date of birth must be in the past.";
      } else if (dob < minDate) {
        validationErrors.dateOfBirth = "Date of birth is too far in the past.";
      }
    }

    if (!profile.address?.countryId) validationErrors["address.countryId"] = "Country is required.";
    else if (!countries.some((c) => c._id === profile.address?.countryId))
      validationErrors["address.countryId"] = "Invalid country selection.";

    if (!profile.address?.stateId) validationErrors["address.stateId"] = "State is required.";
    else if (!states.some((s) => s._id === profile.address?.stateId))
      validationErrors["address.stateId"] = "Invalid state selection.";

    if (!profile.gender) validationErrors.gender = "Gender is required.";
    else if (!["male", "female", "others"].includes(profile.gender.toLowerCase()))
      validationErrors.gender = "Invalid gender selection.";

    return validationErrors;
  }
};