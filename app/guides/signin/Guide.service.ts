import { GuideLoginFormData, GuideLoginResponse } from "./GuideAuth";

export const loginGuide = async (formData: GuideLoginFormData): Promise<GuideLoginResponse> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/guide/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || data?.message || "Login failed");
    }

    return data;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Something went wrong");
  }
};