const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ No token found.");
      return Promise.reject("No token available");
    }
  
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
  
    return fetch(url, { ...options, headers });
  };
  
  export default fetchWithAuth;
  