import { createContext, useState, useEffect } from "react";
import { getUser, getToken, clearAuthData } from "../services/authService";

/**
 * Authentication Context
 * Provides authentication state across the app
 */
export const AuthContext = createContext();

/**
 * AuthProvider Component
 * Wraps app and provides auth state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = getUser();
    const storedToken = getToken();

    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }

    setLoading(false);
  }, []);

  /**
   * Login user
   */
  const login = (token, user) => {
    setToken(token);
    setUser(user);
    // Ensure token and user are in localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  /**
   * Logout user
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    clearAuthData();
  };

  /**
   * Update user data (used when profile is updated)
   */
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    // Persist updated user data to localStorage
    localStorage.setItem("user", JSON.stringify(updatedUserData));
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        updateUser,
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
