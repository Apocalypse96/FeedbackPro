import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Hardcoded users for simplicity
const HARDCODED_USERS = {
  "manager1@company.com": {
    id: 1,
    name: "John Manager",
    email: "manager1@company.com",
    role: "manager",
    password: "password123",
  },
  "employee1@company.com": {
    id: 2,
    name: "Jane Employee",
    email: "employee1@company.com",
    role: "employee",
    manager_id: 1,
    password: "password123",
  },
  "employee2@company.com": {
    id: 3,
    name: "Bob Employee",
    email: "employee2@company.com",
    role: "employee",
    manager_id: 1,
    password: "password123",
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem("currentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    try {
      const foundUser = HARDCODED_USERS[email];

      if (foundUser && foundUser.password === password) {
        const userWithoutPassword = { ...foundUser };
        delete userWithoutPassword.password;

        setUser(userWithoutPassword);
        localStorage.setItem(
          "currentUser",
          JSON.stringify(userWithoutPassword)
        );

        return { success: true };
      } else {
        return {
          success: false,
          error: "Invalid credentials",
        };
      }
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        error: "Login failed",
      };
    }
  };

  const register = async (userData) => {
    // For now, registration is not implemented in hardcoded mode
    return {
      success: false,
      error: "Registration not available in demo mode",
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading: false, // No loading state needed for hardcoded auth
    isAuthenticated: !!user,
    isManager: user?.role === "manager",
    isEmployee: user?.role === "employee",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
