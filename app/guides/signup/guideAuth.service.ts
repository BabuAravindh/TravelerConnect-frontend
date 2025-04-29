import { GuideSignupResponse } from "./guideAuth";

export const signupGuide = async (formData: {
  name: string;
  email: string;
  password: string;
}): Promise<GuideSignupResponse> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/guide/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }

    return data;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Something went wrong");
  }
};