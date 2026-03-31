/**
 * Authentication API Service - REFACTORED with Error Handling
 * Handles all communication with backend auth endpoints and token management
 *
 * Enhancements:
 * - Safe JSON parsing for login/register responses
 * - Improved error messages
 * - Comprehensive logging
 * - Secure token storage in localStorage
 */

import { safeParseJson } from "../utils/apiErrorHandler";

const API_BASE_URL = "http://localhost:5300/api/auth";

/**
 * Register a new user
 * @param {string|Object} emailOrData - User email or registration data object
 * @param {string} password - User password (if first param is email string)
 * @returns {Promise} Response with token and user data
 * @throws {Error} If registration fails
 */
export const register = async (emailOrData, password = null) => {
  const endpoint = `${API_BASE_URL}/register`;
  const timestamp = new Date().toISOString();

  try {
    // Handle both old API (email, password) and new API (data object)
    let requestData;
    if (typeof emailOrData === "string") {
      // Old API: register(email, password)
      requestData = { email: emailOrData, password };
      console.log(`[${timestamp}] 📝 Registering new user: ${emailOrData}`);
    } else {
      // New API: register({email, password, firstName, lastName, phone})
      requestData = emailOrData;
      console.log(
        `[${timestamp}] 📝 Registering new user: ${requestData.email}`,
      );
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    console.log(`[${timestamp}] 📦 Response - Status: ${response.status}`);
    const data = await safeParseJson(response);

    if (!response.ok) {
      const errorMessage =
        data?.error ||
        data?.message ||
        `Registration failed: ${response.statusText}`;
      console.error(`[${timestamp}] ❌ Registration error:`, {
        status: response.status,
        message: errorMessage,
        data,
      });
      throw new Error(errorMessage);
    }

    console.log(`[${timestamp}] ✅ Registration successful`);
    console.log(`[${timestamp}] 🔐 Token received and ready for storage`);
    return data;
  } catch (err) {
    console.error(`[${timestamp}] 💥 Registration error:`, err.message);
    throw err;
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Response with token and user data
 * @throws {Error} If login fails
 */
export const login = async (email, password) => {
  const endpoint = `${API_BASE_URL}/login`;
  const timestamp = new Date().toISOString();

  try {
    console.log(`[${timestamp}] 🔓 Logging in user: ${email}`);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    console.log(`[${timestamp}] 📦 Response - Status: ${response.status}`);
    const data = await safeParseJson(response);

    if (!response.ok) {
      const errorMessage =
        data?.error || data?.message || `Login failed: ${response.statusText}`;
      console.error(`[${timestamp}] ❌ Login error:`, {
        status: response.status,
        message: errorMessage,
        data,
      });
      throw new Error(errorMessage);
    }

    console.log(`[${timestamp}] ✅ Login successful`);
    console.log(`[${timestamp}] 🔐 Token received - expires in 60 minutes`);
    return data;
  } catch (err) {
    console.error(`[${timestamp}] 💥 Login error:`, err.message);
    throw err;
  }
};

/**
 * Get authorization header with JWT token
 * @returns {Object} Headers object with Authorization header
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

/**
 * Get stored token
 * @returns {string|null} JWT token or null
 */
export const getToken = () => {
  return localStorage.getItem("token");
};

/**
 * Get stored user info
 * @returns {Object|null} User object or null
 */
export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

/**
 * Save authentication data to localStorage
 * @param {string} token - JWT token
 * @param {Object} user - User data
 */
export const saveAuthData = (token, user) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 💾 Saving authentication data to localStorage`);

  try {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    console.log(`[${timestamp}] ✅ Auth data saved successfully`);
    console.log(`[${timestamp}] 👤 User: ${user?.email || "unknown"}`);
  } catch (err) {
    console.error(`[${timestamp}] ❌ Failed to save auth data:`, err.message);
    throw err;
  }
};

/**
 * Clear authentication data from localStorage
 */
export const clearAuthData = () => {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] 🗑️ Clearing authentication data from localStorage`,
  );

  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    console.log(`[${timestamp}] ✅ Auth data cleared successfully`);
  } catch (err) {
    console.error(`[${timestamp}] ❌ Failed to clear auth data:`, err.message);
    throw err;
  }
};
