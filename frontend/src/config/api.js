// API Configuration
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",

  // Feedback endpoints
  FEEDBACK: "/api/feedback",
  FEEDBACK_REQUESTS: "/api/feedback/requests",
  FEEDBACK_DASHBOARD: "/api/feedback/dashboard",

  // User endpoints
  USERS: "/api/users",
};

// Helper function to build full URLs
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// For backward compatibility and direct usage
export const getApiUrl = (path = "") => {
  return `${API_BASE_URL}${path}`;
};
