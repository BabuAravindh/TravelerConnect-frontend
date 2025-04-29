export interface GuideFormData {
    languages: string[];
    activities: string[];
    bio: string;
    countryId: string;
    stateId: string;
    cities: string[];
    aadharCardPhoto: File | null;
    bankAccountNumber: string;
  }
  
  export interface SelectOption {
    value: string;
    label: string;
  }