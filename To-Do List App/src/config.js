// API Configuration
const config = {
  // Use environment variable in production, fallback to local development
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5000",

  // Helper function to get full API URL
  getApiUrl: (endpoint) => {
    const baseUrl = config.API_BASE_URL;
    return `${baseUrl}${endpoint}`;
  },
};

export default config;
