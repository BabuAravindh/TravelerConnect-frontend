import axios from "axios";
import { Profile, SelectOption } from "./profileTypes";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchCities = async (): Promise<SelectOption[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/predefine/cities`);
    return response.data.data.map((city: { cityName: string }) => ({
      label: city.cityName,
      value: city.cityName,
    }));
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
};

export const fetchProfile = async (userId: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/guide/profile/${userId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const fetchInitialData = async () => {
  try {
    const [countriesRes, statesRes, activitiesRes, languagesRes] = await Promise.all([
      axios.get(`${API_URL}/api/predefine/countries`),
      axios.get(`${API_URL}/api/predefine/states`),
      axios.get(`${API_URL}/api/activities`),
      axios.get(`${API_URL}/api/predefine/languages`),
    ]);

    return {
      countries: countriesRes.data?.map((c: { countryName: string }) => ({
        label: c.countryName,
        value: c.countryName,
      })) || [],
      states: statesRes.data?.map((s: { stateName: string }) => ({
        label: s.stateName,
        value: s.stateName,
      })) || [],
      activitiesList: activitiesRes.data?.map((activity: { activityName: string }) => ({
        label: activity.activityName,
        value: activity.activityName,
      })) || [],
      languagesList: languagesRes.data?.map((lang: { languageName: string }) => ({
        label: lang.languageName,
        value: lang.languageName,
      })) || [],
    };
  } catch (error) {
    console.error("Error fetching initial data:", error);
    return {
      countries: [],
      states: [],
      activitiesList: [],
      languagesList: [],
    };
  }
};

export const updateProfile = async (
  userId: string,
  profile: Partial<Profile>,
  profilePicFile?: File
) => {
  const formData = new FormData();
  
  // Append all profile fields
  Object.entries(profile).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => formData.append(key, item));
    } else if (value !== undefined) {
      formData.append(key, String(value));
    }
  });

  if (profilePicFile) {
    formData.append("profilePic", profilePicFile);
  }

  const response = await axios.put(
    `${API_URL}/api/guide/profile/${userId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};