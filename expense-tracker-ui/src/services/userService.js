/**
 * User Service - REFACTORED with Error Handling & Token Validation
 * Handles all user profile and settings related API calls
 *
 * Enhancements:
 * - Client-side token validation before each request
 * - Safe JSON parsing with content-type checking
 * - Centralized error handling with auto-logout on 401
 * - Comprehensive logging for debugging
 * - Fallback handling for missing backend endpoints
 */

import {
  getAuthHeaders,
  getUser,
  getToken,
  saveAuthData,
  clearAuthData,
} from "./authService";
import { verifyTokenBeforeFetch, debugToken } from "../utils/tokenUtils";
import { safeParseJson, createApiErrorHandler } from "../utils/apiErrorHandler";

const API_BASE = "http://localhost:5300/api";

export const userService = {
  /**
   * Get current user profile
   */
  async getProfile() {
    const endpoint = `${API_BASE}/auth/profile`;
    const timestamp = new Date().toISOString();

    try {
      console.log(`[${timestamp}] 👤 Fetching user profile...`);

      // Validate token before request
      const tokenValidation = verifyTokenBeforeFetch("getProfile");
      if (!tokenValidation.isValid) {
        console.warn(
          `[${timestamp}] ⚠️ Token validation failed, returning cached user`,
        );
        const user = getUser();
        return user || { id: null, email: null };
      }

      const response = await fetch(endpoint, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      console.log(`[${timestamp}] 📦 Response - Status: ${response.status}`);
      const data = await safeParseJson(response);

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(
            `[${timestamp}] ⚠️ Profile endpoint not found (404), using cached user`,
          );
          const user = getUser();
          return user || { id: null, email: null };
        }

        const errorMessage =
          data?.error || `Failed to fetch profile: ${response.statusText}`;
        console.error(`[${timestamp}] ❌ Error:`, {
          status: response.status,
          data,
        });

        const errorHandler = createApiErrorHandler();
        throw errorHandler.handleError(
          response.status,
          new Error(errorMessage),
          endpoint,
        );
      }

      console.log(`[${timestamp}] ✅ Profile fetched successfully`);
      return data;
    } catch (error) {
      console.error(`[${timestamp}] 💥 Error fetching profile:`, error.message);
      // Fallback to cached user data
      const user = getUser();
      return user || { id: null, email: null };
    }
  },

  /**
   * Update current user profile
   */
  async updateProfile(profileData) {
    const endpoint = `${API_BASE}/auth/profile`;
    const timestamp = new Date().toISOString();

    try {
      console.log(`[${timestamp}] ✏️ Updating user profile:`, profileData);

      const tokenValidation = verifyTokenBeforeFetch("updateProfile");
      if (!tokenValidation.isValid) {
        throw new Error(tokenValidation.reason);
      }

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      console.log(`[${timestamp}] 📦 Response - Status: ${response.status}`);
      const updated = await safeParseJson(response);

      if (!response.ok) {
        const errorMessage =
          updated?.error || `Failed to update profile: ${response.statusText}`;
        console.error(`[${timestamp}] ❌ Error:`, {
          status: response.status,
          data: updated,
        });

        const errorHandler = createApiErrorHandler();
        throw errorHandler.handleError(
          response.status,
          new Error(errorMessage),
          endpoint,
        );
      }

      // Update localStorage with new user data
      const token = getToken();
      saveAuthData(token, updated);

      console.log(`[${timestamp}] ✅ Profile updated successfully`);
      return updated;
    } catch (error) {
      console.error(`[${timestamp}] 💥 Error updating profile:`, error.message);
      throw error;
    }
  },

  /**
   * Change user password
   */
  async changePassword(currentPassword, newPassword) {
    const endpoint = `${API_BASE}/auth/change-password`;
    const timestamp = new Date().toISOString();

    try {
      console.log(`[${timestamp}] 🔐 Changing password...`);

      const tokenValidation = verifyTokenBeforeFetch("changePassword");
      if (!tokenValidation.isValid) {
        throw new Error(tokenValidation.reason);
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      console.log(`[${timestamp}] 📦 Response - Status: ${response.status}`);
      const data = await safeParseJson(response);

      if (!response.ok) {
        const errorMessage =
          data?.error || `Failed to change password: ${response.statusText}`;
        console.error(`[${timestamp}] ❌ Error:`, {
          status: response.status,
          data,
        });

        const errorHandler = createApiErrorHandler();
        throw errorHandler.handleError(
          response.status,
          new Error(errorMessage),
          endpoint,
        );
      }

      console.log(`[${timestamp}] ✅ Password changed successfully`);
      return data;
    } catch (error) {
      console.error(
        `[${timestamp}] 💥 Error changing password:`,
        error.message,
      );
      throw error;
    }
  },

  /**
   * Delete user account
   */
  async deleteAccount(password) {
    const endpoint = `${API_BASE}/auth/account`;
    const timestamp = new Date().toISOString();

    try {
      console.log(`[${timestamp}] ⚠️ Deleting user account...`);

      const tokenValidation = verifyTokenBeforeFetch("deleteAccount");
      if (!tokenValidation.isValid) {
        throw new Error(tokenValidation.reason);
      }

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      console.log(`[${timestamp}] 📦 Response - Status: ${response.status}`);
      const data = await safeParseJson(response);

      if (!response.ok) {
        const errorMessage =
          data?.error || `Failed to delete account: ${response.statusText}`;
        console.error(`[${timestamp}] ❌ Error:`, {
          status: response.status,
          data,
        });

        const errorHandler = createApiErrorHandler();
        throw errorHandler.handleError(
          response.status,
          new Error(errorMessage),
          endpoint,
        );
      }

      // Clear auth data from localStorage
      clearAuthData();

      console.log(`[${timestamp}] ✅ Account deleted successfully`);
      return { success: true };
    } catch (error) {
      console.error(`[${timestamp}] 💥 Error deleting account:`, error.message);
      throw error;
    }
  },

  /**
   * Get user settings/preferences (if stored on backend)
   */
  async getUserSettings() {
    const endpoint = `${API_BASE}/auth/settings`;
    const timestamp = new Date().toISOString();

    try {
      console.log(`[${timestamp}] ⚙️ Fetching user settings...`);

      const tokenValidation = verifyTokenBeforeFetch("getUserSettings");
      if (!tokenValidation.isValid) {
        console.warn(
          `[${timestamp}] ⚠️ Token validation failed, returning null`,
        );
        return null;
      }

      const response = await fetch(endpoint, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      console.log(`[${timestamp}] 📦 Response - Status: ${response.status}`);
      const data = await safeParseJson(response);

      if (!response.ok) {
        console.warn(
          `[${timestamp}] ⚠️ Failed to fetch settings: ${response.status}`,
          { data },
        );
        return null;
      }

      console.log(`[${timestamp}] ✅ Settings fetched successfully`);
      return data;
    } catch (error) {
      console.error(
        `[${timestamp}] 💥 Error fetching settings:`,
        error.message,
      );
      return null;
    }
  },

  /**
   * Save user settings/preferences
   */
  async saveUserSettings(settings) {
    const endpoint = `${API_BASE}/auth/settings`;
    const timestamp = new Date().toISOString();

    try {
      console.log(`[${timestamp}] 💾 Saving user settings:`, settings);

      const tokenValidation = verifyTokenBeforeFetch("saveUserSettings");
      if (!tokenValidation.isValid) {
        throw new Error(tokenValidation.reason);
      }

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      console.log(`[${timestamp}] 📦 Response - Status: ${response.status}`);
      const data = await safeParseJson(response);

      if (!response.ok) {
        const errorMessage =
          data?.error || `Failed to save settings: ${response.statusText}`;
        console.error(`[${timestamp}] ❌ Error:`, {
          status: response.status,
          data,
        });

        const errorHandler = createApiErrorHandler();
        throw errorHandler.handleError(
          response.status,
          new Error(errorMessage),
          endpoint,
        );
      }

      console.log(`[${timestamp}] ✅ Settings saved successfully`);
      return data;
    } catch (error) {
      console.error(`[${timestamp}] 💥 Error saving settings:`, error.message);
      throw error;
    }
  },
};
