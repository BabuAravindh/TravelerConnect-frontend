import { GuideVerificationResponse } from "./guideVerificationType";

export const uploadGuideId = async (file: File, userId: string): Promise<GuideVerificationResponse> => {
  try {
    const formData = new FormData();
    formData.append("governmentId", file);
    formData.append("userId", userId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verifyId`, {
      method: "POST",
      body: formData,
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Server responded with status ${response.status}`);
    }

    return data;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Failed to upload file. Please try again.");
  }
};