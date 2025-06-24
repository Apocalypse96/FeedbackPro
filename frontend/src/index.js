import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import axios from "axios";

// Configure axios to use Flask backend
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common["Content-Type"] = "application/json";

// Add request interceptor to include user ID in headers for hardcoded auth
axios.interceptors.request.use(
  (config) => {
    // Get current user from localStorage
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      config.headers["X-User-ID"] = user.id;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
