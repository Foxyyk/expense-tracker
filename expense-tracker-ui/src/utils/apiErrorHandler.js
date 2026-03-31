// Centralized API Error Handler
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Handle common API errors with appropriate user actions
 */
export const createApiErrorHandler = (navigate, logout) => {
  return async (response, context = {}) => {
    const { serviceName = "API", endpoint = "unknown" } = context;

    console.error(`❌ ${serviceName} Error:`, {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      timestamp: new Date().toISOString(),
    });

    // Try to parse error message from response
    let errorData = null;
    try {
      if (response.headers.get("content-type")?.includes("application/json")) {
        errorData = await response.json();
      } else if (response.ok === false) {
        const text = await response.text();
        console.log("Response body (non-JSON):", text);
      }
    } catch (parseError) {
      console.warn("Could not parse error response body:", parseError);
    }

    const errorMessage =
      errorData?.error || errorData?.message || response.statusText;

    // Handle specific HTTP status codes
    if (response.status === 401) {
      console.error("🔐 UNAUTHORIZED - Token invalid or expired");
      console.log("Clearing auth and redirecting to login...");

      // Clear auth state
      logout();

      // Redirect to login
      navigate("/login", {
        state: { message: "Session expired. Please log in again." },
      });

      throw new Error("Unauthorized: Session expired. Please log in again.");
    }

    if (response.status === 403) {
      console.error("🚫 FORBIDDEN - User lacks required permissions");
      throw new Error(
        "Forbidden: You do not have permission to access this resource.",
      );
    }

    if (response.status === 404) {
      console.error("🔍 NOT FOUND - Endpoint or resource not found");
      throw new Error(`Not found: ${errorMessage || endpoint}`);
    }

    if (response.status === 500) {
      console.error("💥 SERVER ERROR");
      throw new Error(
        `Server error: ${errorMessage || "Please try again later"}`,
      );
    }

    // Generic error
    throw new Error(
      errorMessage || `HTTP ${response.status}: ${response.statusText}`,
    );
  };
};

/**
 * Safe response parsing - checks if response is JSON before parsing
 */
export const safeParseJson = async (response) => {
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch (error) {
      console.error("Failed to parse JSON response:", error);
      throw new Error("Invalid JSON response from server");
    }
  }

  console.warn("Response is not JSON:", contentType);
  return null;
};

/**
 * Wrapper for fetch with automatic error handling
 */
export const fetchWithErrorHandling = async (
  url,
  options = {},
  errorHandler = null,
) => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      if (errorHandler) {
        await errorHandler(response, {
          endpoint: url,
          serviceName: options.serviceName || "API",
        });
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

/**
 * Hook for API error handling in components
 */
export const useApiErrorHandler = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return createApiErrorHandler(navigate, logout);
};
