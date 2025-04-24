export interface City {
    _id: string;
    cityName: string;
  }
  
  export interface Transport {
    _id?: string;
    mode: string;
    duration: string;
    details?: string;
  }
  
  export interface Route {
    _id: string;
    from: string;
    to: string;
    transports: Transport[];
    createdAt: string;
  }
  
  export interface Feedback {
    _id: string;
    routeId?: {
      _id: string;
      from: string;
      to: string;
    };
    rating: number;
    submittedAt: string;
  }
  
  export interface RouteFormData {
    from: string;
    to: string;
    transports: Transport[];
  }

