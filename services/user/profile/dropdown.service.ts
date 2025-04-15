import { Country, State } from "../types/user/dropdown.types";
import toast from "react-hot-toast";

export const DropdownService = {
  async fetchCountries(): Promise<Country[]> {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predefine/countries`);
      if (!res.ok) throw new Error("Failed to fetch countries");
      return await res.json();
    } catch (error: any) {
      console.error("Error fetching countries:", error);
      toast.error("Failed to load country data");
      return [];
    }
  },

  async fetchStates(): Promise<State[]> {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predefine/states`);
      if (!res.ok) throw new Error("Failed to fetch states");
      return await res.json();
    } catch (error: any) {
      console.error("Error fetching states:", error);
      toast.error("Failed to load state data");
      return [];
    }
  },

  async fetchAllDropdownData(): Promise<{ countries: Country[]; states: State[] }> {
    try {
      const [countries, states] = await Promise.all([
        this.fetchCountries(),
        this.fetchStates()
      ]);
      return { countries, states };
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      return { countries: [], states: [] };
    }
  }
};