export interface Profile {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isVerified: boolean;
    phoneNumber: string;
    gender: string;
    dateJoined: string;
    state: string;
    country: string;
    bio: string;
    activities: string[];
    languages: string[];
    bankAccountNumber: string;
    ifscCode: string;
    bankName: string;
    profilePic: string;
    serviceLocations: string[];
  }
  
  export interface SelectOption {
    label: string;
    value: string;
  }
  
  export const genderOptions: SelectOption[] = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Others", value: "others" },
  ];