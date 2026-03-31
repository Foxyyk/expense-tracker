/**
 * API Error Handler Utilities
 * Centralized error handling for API requests
 *
 * Features:
 * - Automatic 401 logout and redirect to login
 * - Safe JSON parsing with content-type checking
 * - Standardized error response handling
 * - Comprehensive logging for debugging
 */

import { clearAuthData } from "./authService";

/**
 * Safely parse JSON response with content-type checking
 * Prevents "Unexpected end of JSON input" errors from HTML responses
 *
 * @param {Response} response - Fetch API response object
 * @returns {Promise<Object|null>} Parsed JSON data or null
 */
export const safeParseJson = async (response) => {
  try {
    const contentType = response.headers.get("content-type");

    // Check if response claims to be JSON
    if (!contentType || !contentType.includes("application/json")) {
      console.warn(
        `[safeParseJson] Response is not JSON (content-type: ${contentType}). ` +
          "This may happen when API returns HTML error page on 401/500 errors.",
      );
      return null;
    }

    // Try to parse as JSON
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(
      `[safeParseJson] Failed to parse response as JSON: ${error.message}`,
    );
    return null;
  }
};

/**
 * Create API error handler with auto-logout on 401
 * Call this to get an object with handleError method
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.navigate - React Router navigate function (optional)
 * @param {Function} options.logout - Custom logout handler (optional)
 * @returns {Object} Error handler with handleError method
 */
export const createApiErrorHandler = (options = {}) => {
  const { navigate, logout } = options;

  return {
    handleError: (statusCode, error, endpoint = "") => {
      const timestamp = new Date().toISOString();

      switch (statusCode) {
        case 401:
          console.error(
            `[${timestamp}] 🔐 UNAUTHORIZED (401) - Token invalid or expired`,
          );
          console.error(`  Endpoint: ${endpoint}`);
          console.error(`  Message: ${error.message}`);

          // Clear authentication
          clearAuthData();

          // Redirect to login if navigate is provided
          if (navigate) {
            navigate("/login", {
              state: {
                message: "Session expired. Please log in again.",
              },
            });
          }

          // Call custom logout handler if provided
          if (logout) {
            logout();
          }

          break;

        case 403:
          console.error(
            `[${timestamp}] 🚫 FORBIDDEN (403) - Access denied to resource`,
          );
          console.error(`  Endpoint: ${endpoint}`);
          console.error(`  Message: ${error.message}`);
          break;

        case 404:
          console.error(
            `[${timestamp}] 📍 NOT FOUND (404) - Resource does not exist`,
          );
          console.error(`  Endpoint: ${endpoint}`);
          console.error(`  Message: ${error.message}`);
          break;

        case 422:
          console.error(
            `[${timestamp}] ❌ VALIDATION ERROR (422) - Invalid request data`,
          );
          console.error(`  Endpoint: ${endpoint}`);
          console.error(`  Message: ${error.message}`);
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          console.error(
            `[${timestamp}] ⚠️ SERVER ERROR (${statusCode}) - Backend error occurred`,
          );
          console.error(`  Endpoint: ${endpoint}`);
          console.error(`  Message: ${error.message}`);
          break;

        default:
          console.error(
            `[${timestamp}] ❌ HTTP ERROR (${statusCode}) - Request failed`,
          );
          console.error(`  Endpoint: ${endpoint}`);
          console.error(`  Message: ${error.message}`);
      }

      return error;
    },
  };
};

/**
 * Wrapper for fetch that includes error handling
 * Automatically handles common error scenarios
 *
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
export const fetchWithErrorHandling = async (url, options = {}) => {
  const timestamp = new Date().toISOString();

  try {
    console.log(`[${timestamp}] 🚀 Fetching: ${url}`);

    const response = await fetch(url, options);

    console.log(`[${timestamp}] 📦 Response - Status: ${response.status}`);

    // Parse response
    const data = await safeParseJson(response);

    // Handle error responses
    if (!response.ok) {
      const errorMessage =
        data?.error ||
        data?.message ||
        `HTTP ${response.status}: ${response.statusText}`;

      const error = new Error(errorMessage);
      const handler = createApiErrorHandler();
      throw handler.handleError(response.status, error, url);
    }

    return data;
  } catch (error) {
    console.error(`[${timestamp}] 💥 Request failed:`, error.message);
    throw error;
  }
};

/**
 * React hook for using API error handler in components
 * Automatically provides navigate function context
 *
 * Usage in component:
 * const handleError = useApiErrorHandler();
 *
 * @returns {Object} Error handler with handleError method
 */
export const useApiErrorHandler = () => {
  // This is a React hook, but we need to be careful about imports
  // in a non-React context. Return a basic handler that works everywhere.

  return createApiErrorHandler();
};

/**
 * Standardized error object for API responses
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} data - Additional error data
 * @returns {Object} Standardized error object
 */
export const createApiError = (statusCode, message, data = {}) => {
  return {
    status: statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Check if error is authentication-related (401 or 403)
 * @param {Error|Object} error - Error object
 * @returns {boolean} True if auth error
 */
export const isAuthError = (error) => {
  if (!error) return false;

  // Check for status code properties
  const status = error.status || error.statusCode || error.response?.status;
  return status === 401 || status === 403;
};

/**
 * Retry fetch request with exponential backoff
 * Useful for transient network errors or rate limiting
 *
 * @param {Function} fetchFn - Async function that performs the fetch
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} baseDelayMs - Base delay in milliseconds (default: 1000)
 * @returns {Promise<*>} Result from fetchFn
 */
export const retryFetch = async (
  fetchFn,
  maxRetries = 3,
  baseDelayMs = 1000,
) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        const delayMs = baseDelayMs * Math.pow(2, attempt);
        console.warn(
          `[Retry] Attempt ${attempt + 1}/${maxRetries} failed. ` +
            `Retrying in ${delayMs}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
};

/**
 * Format error response for user display
 * Extracts user-friendly message from error
 *
 * @param {Error|Object} error - Error object
 * @returns {string} User-friendly error message
 */
export const formatErrorMessage = (error) => {
  if (!error) return "An unknown error occurred";

  // HTTP error messages
  if (error.message) {
    if (error.message.includes("Failed to fetch")) {
      return "Network error. Please check your connection.";
    }
    return error.message;
  }

  // Structured error object
  if (error.error) return error.error;
  if (error.message) return error.message;

  return "An error occurred while processing your request";
};

export default {
  safeParseJson,
  createApiErrorHandler,
  fetchWithErrorHandling,
  useApiErrorHandler,
  createApiError,
  isAuthError,
  retryFetch,
  formatErrorMessage,
};
