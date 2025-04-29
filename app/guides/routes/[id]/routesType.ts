export interface Route {
    from: string;
    to: string;
    guideId?: {
      name: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
    transports: {
      _id: string;
      mode: string;
      duration: string;
      details?: string;
    }[];
  }