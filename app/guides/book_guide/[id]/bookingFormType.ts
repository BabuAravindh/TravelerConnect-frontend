export interface BookingFormData {
    startDate: string;
    endDate: string;
    budget: string;
    pickupLocation: string;
    dropoffLocation: string;
    activities: string[];
  }
  
  export interface Activity {
    label: string;
    value: string;
  }
  
  export interface Location {
    label: string;
    value: string;
  }
  
  export interface BookingConflict {
    show: boolean;
    dates?: { start: string; end: string };
  }