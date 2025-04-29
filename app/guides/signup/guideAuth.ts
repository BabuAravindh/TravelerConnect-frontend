export interface GuideSignupFormData {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }
  
  export interface GuideSignupResponse {
    token: string;
    message?: string;
  }
  
  export interface GuideSignupErrors {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }