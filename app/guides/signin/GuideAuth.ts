export interface GuideLoginFormData {
    email: string;
    password: string;
  }
  
  export interface GuideLoginResponse {
    token: string;
  }
  
  export interface FormErrors {
    email: string;
    password: string;
  }