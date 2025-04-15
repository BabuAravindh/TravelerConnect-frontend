export interface Profile {
    _id?: string;
    userId?: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
    phoneNumber: string;
    dateOfBirth: string;
    address?: {
      countryId?: string;
      stateId?: string;
      countryName?: string;
      stateName?: string;
    };
    gender: string;
  }