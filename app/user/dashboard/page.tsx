"use client";

import Image from "next/image";
import { Save, X, Camera } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { ProfileService } from "@/services/user/profile/profile.service";
import { DropdownService } from "@/services/user/profile/dropdown.service";
import type { Profile } from "@/services/types/user/profile.type";
import type { Country, State } from "@/services/types/user/dropdown.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({
    userId: user?.id || "",
    firstName: "",
    lastName: "",
    profilePicture: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: { countryId: "", stateId: "", countryName: "", stateName: "" },
    gender: "male",
  });
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userId = user?.id;

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [profileData, dropdownData] = await Promise.all([
          userId ? ProfileService.fetchProfile(userId) : Promise.resolve(null),
          DropdownService.fetchAllDropdownData(),
        ]);

        if (profileData) {
          setProfile(profileData);
        }
        setCountries(dropdownData.countries);
        setStates(dropdownData.states);
      } catch (error: unknown) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  const handleCancel = () => {
    setProfilePicFile(null);
    setErrors({});
  };

  const handleChange = (name: string, value: string) => {
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setProfile((prev) => ({
        ...prev,
        address: {
          ...prev.address!,
          [field]: value,
          ...(field === "countryId" && {
            countryName: countries.find((c) => c._id === value)?.countryName || "",
          }),
          ...(field === "stateId" && {
            stateName: states.find((s) => s._id === value)?.stateName || "",
          }),
        },
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      setProfile((prev) => ({
        ...prev,
        profilePicture: URL.createObjectURL(file),
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = ProfileService.validateProfile(profile, countries, states);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    setIsSubmitting(true);

    try {
      const savedProfile = await ProfileService.saveProfile(
        profile,
        profilePicFile ?? null,
        !!profile._id
      );

      setProfile(savedProfile);
      setProfilePicFile(null);
      toast.success("Profile saved successfully!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save profile";
      console.error("Error updating profile:", error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground text-2xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6">
        {/* Profile Picture Section */}
        <Card className="w-full md:w-1/3 flex flex-col items-center">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-32 h-32">
              <Image
                src={profile.profilePicture || "/default-profile.png"}
                alt="Profile"
                width={128}
                height={128}
                className="rounded-full object-cover border-4 border-primary"
                priority
              />
              <label className="absolute bottom-0 right-0 bg-primary p-2 rounded-full cursor-pointer text-primary-foreground">
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="hidden"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details Section */}
        <Card className="w-full md:w-2/3">
          <CardHeader>
            <CardTitle className="text-center">
              {profile._id ? "Edit Profile" : "Create Your Profile"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSave}>
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={profile.firstName}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                  placeholder="Enter first name"
                />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={profile.lastName}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                  placeholder="Enter last name"
                />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                  placeholder="e.g., +1234567890"
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-destructive">{errors.phoneNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  name="dateOfBirth"
                  value={profile.dateOfBirth || ""}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                />
                {errors.dateOfBirth && (
                  <p className="text-xs text-destructive">{errors.dateOfBirth}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  name="gender"
                  value={profile.gender || "male"}
                  onValueChange={(value) => handleChange("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="countryId">Country</Label>
                <Select
                  name="address.countryId"
                  value={profile.address?.countryId || ""}
                  onValueChange={(value) => handleChange("address.countryId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country._id} value={country._id}>
                        {country.countryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors["address.countryId"] && (
                  <p className="text-xs text-destructive">{errors["address.countryId"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stateId">State</Label>
                <Select
                  name="address.stateId"
                  value={profile.address?.stateId || ""}
                  onValueChange={(value) => handleChange("address.stateId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state._id} value={state._id}>
                        {state.stateName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors["address.stateId"] && (
                  <p className="text-xs text-destructive">{errors["address.stateId"]}</p>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> {profile._id ? "Save" : "Create Profile"}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}