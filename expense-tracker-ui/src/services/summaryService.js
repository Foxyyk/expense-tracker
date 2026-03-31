/**
 * Summary API Service - REFACTORED with Error Handling & Token Validation
 * Handles all communication with backend summary endpoints
 *
 * Enhancements:
 * - Client-side token expiration validation before requests
 * - Safe JSON parsing with content-type checking
 * - Centralized error handling with auto-logout on 401
 * - Improved logging for debugging authentication issues
 */

import { getAuthHeaders } from "./authService";
import {
  isTokenExpired,
  verifyTokenBeforeFetch,
  debugToken,
} from "../utils/tokenUtils";
import { safeParseJson, createApiErrorHandler } from "../utils/apiErrorHandler";

const API_BASE_URL = "http://localhost:5300/api/expenses";

/**
 * Get monthly expense summary
 * @returns {Promise<Object>} Monthly summary with aggregated data
 * @throws {Error} If token expired, network error, or API error occurs
 */
export const getMonthlySummary = async () => {
  const endpoint = `${API_BASE_URL}/summary/monthly`;
  const timestamp = new Date().toISOString();

  try {
    console.log(`[${timestamp}] 📊 Fetching monthly summary...`);

    // STEP 1: Validate token before making request
    console.log(`[${timestamp}] 🔐 Validating authentication token...`);
    const tokenValidation = verifyTokenBeforeFetch("getMonthlySummary");

    if (!tokenValidation.isValid) {
      console.error(
        `[${timestamp}] ❌ Token validation failed:`,
        tokenValidation.reason,
      );
      throw new Error(tokenValidation.reason);
    }

    if (tokenValidation.expiresIn < 300000) {
      // Less than 5 minutes
      console.warn(
        `[${timestamp}] ⚠️ Token expiring soon (${Math.round(tokenValidation.expiresIn / 1000)}s remaining)`,
      );
    }

    // STEP 2: Get authorization headers
    const headers = getAuthHeaders();
    console.log(`[${timestamp}] 📋 Headers prepared:`, {
      Authorization: headers.Authorization
        ? "✓ Bearer token present"
        : "✗ No token",
      "Content-Type": headers["Content-Type"],
    });

    // STEP 3: Make API request
    console.log(`[${timestamp}] 🚀 Sending GET request to: ${endpoint}`);
    const response = await fetch(endpoint, {
      method: "GET",
      headers: headers,
    });

    console.log(
      `[${timestamp}] 📦 Response received - Status: ${response.status} ${response.statusText}`,
    );

    // STEP 4: Safely parse response
    const data = await safeParseJson(response);
    console.log(`[${timestamp}] ✓ Response parsed successfully`, {
      status: response.status,
      dataKeys: data ? Object.keys(data) : null,
    });

    // STEP 5: Handle error responses
    if (!response.ok) {
      const errorMessage =
        data?.error ||
        data?.message ||
        `API Error ${response.status}: ${response.statusText}`;

      console.error(`[${timestamp}] ❌ API returned error:`, {
        status: response.status,
        message: errorMessage,
        data,
      });

      // Use centralized error handler (handles 401 logout, redirects, etc.)
      const errorHandler = createApiErrorHandler();
      throw errorHandler.handleError(
        response.status,
        new Error(errorMessage),
        endpoint,
      );
    }

    console.log(`[${timestamp}] ✅ Monthly summary fetched successfully`);
    return data;
  } catch (err) {
    console.error(`[${timestamp}] 💥 Error in getMonthlySummary:`, {
      message: err.message,
      stack: err.stack,
      endpoint,
    });

    // Log token debug info for troubleshooting
    console.group("🔍 Authentication Debug Info");
    try {
      const token = localStorage.getItem("token");
      if (token) {
        console.log("Token exists: ✓");
        console.log("Token expired:", isTokenExpired(token) ? "✓ YES" : "✗ NO");
        console.log("Full token details:");
        debugToken(token);
      } else {
        console.log("⚠️ No token in localStorage");
      }
    } catch (debugErr) {
      console.error("Unable to debug token:", debugErr.message);
    }
    console.groupEnd();

    throw err;
  }
};

/**
 * Get category expense summary
 * @returns {Promise<Object>} Category summary with aggregated data
 * @throws {Error} If token expired, network error, or API error occurs
 */
export const getCategorySummary = async () => {
  const endpoint = `${API_BASE_URL}/summary/category`;
  const timestamp = new Date().toISOString();

  try {
    console.log(`[${timestamp}] 📊 Fetching category summary...`);

    // STEP 1: Validate token before making request
    console.log(`[${timestamp}] 🔐 Validating authentication token...`);
    const tokenValidation = verifyTokenBeforeFetch("getCategorySummary");

    if (!tokenValidation.isValid) {
      console.error(
        `[${timestamp}] ❌ Token validation failed:`,
        tokenValidation.reason,
      );
      throw new Error(tokenValidation.reason);
    }

    if (tokenValidation.expiresIn < 300000) {
      // Less than 5 minutes
      console.warn(
        `[${timestamp}] ⚠️ Token expiring soon (${Math.round(tokenValidation.expiresIn / 1000)}s remaining)`,
      );
    }

    // STEP 2: Get authorization headers
    const headers = getAuthHeaders();
    console.log(`[${timestamp}] 📋 Headers prepared:`, {
      Authorization: headers.Authorization
        ? "✓ Bearer token present"
        : "✗ No token",
      "Content-Type": headers["Content-Type"],
    });

    // STEP 3: Make API request
    console.log(`[${timestamp}] 🚀 Sending GET request to: ${endpoint}`);
    const response = await fetch(endpoint, {
      method: "GET",
      headers: headers,
    });

    console.log(
      `[${timestamp}] 📦 Response received - Status: ${response.status} ${response.statusText}`,
    );

    // STEP 4: Safely parse response
    const data = await safeParseJson(response);
    console.log(`[${timestamp}] ✓ Response parsed successfully`, {
      status: response.status,
      dataKeys: data ? Object.keys(data) : null,
    });

    // STEP 5: Handle error responses
    if (!response.ok) {
      const errorMessage =
        data?.error ||
        data?.message ||
        `API Error ${response.status}: ${response.statusText}`;

      console.error(`[${timestamp}] ❌ API returned error:`, {
        status: response.status,
        message: errorMessage,
        data,
      });

      // Use centralized error handler (handles 401 logout, redirects, etc.)
      const errorHandler = createApiErrorHandler();
      throw errorHandler.handleError(
        response.status,
        new Error(errorMessage),
        endpoint,
      );
    }

    console.log(`[${timestamp}] ✅ Category summary fetched successfully`);
    return data;
  } catch (err) {
    console.error(`[${timestamp}] 💥 Error in getCategorySummary:`, {
      message: err.message,
      stack: err.stack,
      endpoint,
    });

    // Log token debug info for troubleshooting
    console.group("🔍 Authentication Debug Info");
    try {
      const token = localStorage.getItem("token");
      if (token) {
        console.log("Token exists: ✓");
        console.log("Token expired:", isTokenExpired(token) ? "✓ YES" : "✗ NO");
        console.log("Full token details:");
        debugToken(token);
      } else {
        console.log("⚠️ No token in localStorage");
      }
    } catch (debugErr) {
      console.error("Unable to debug token:", debugErr.message);
    }
    console.groupEnd();

    throw err;
  }
};
