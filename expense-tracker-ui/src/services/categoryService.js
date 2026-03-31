/**
 * Category API Service - REFACTORED with Error Handling & Token Validation
 * Handles all communication with backend category endpoints
 *
 * Enhancements:
 * - Client-side token validation before each request
 * - Safe JSON parsing with content-type checking
 * - Centralized error handling with auto-logout on 401
 * - Detailed request/response logging for debugging
 */

import { getAuthHeaders } from "./authService";
import { verifyTokenBeforeFetch, debugToken } from "../utils/tokenUtils";
import { safeParseJson, createApiErrorHandler } from "../utils/apiErrorHandler";

const API_BASE_URL = "http://localhost:5300/api/categories";

/**
 * Get all categories for the current user
 * @returns {Promise<Array>} Array of category objects
 * @throws {Error} If token invalid, network error, or API error occurs
 */
export const getCategories = async () => {
  const endpoint = API_BASE_URL;
  const timestamp = new Date().toISOString();

  try {
    console.log(`[${timestamp}] 📂 Fetching categories...`);

    // Validate token before request
    const tokenValidation = verifyTokenBeforeFetch("getCategories");
    if (!tokenValidation.isValid) {
      throw new Error(tokenValidation.reason);
    }

    const response = await fetch(endpoint, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    console.log(`[${timestamp}] 📦 Response - Status: ${response.status}`);
    const data = await safeParseJson(response);

    if (!response.ok) {
      const errorMessage =
        data?.error || `Failed to fetch categories: ${response.statusText}`;
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

    console.log(
      `[${timestamp}] ✅ Fetched ${Array.isArray(data) ? data.length : 0} categories`,
    );

    // DEBUG: Log the structure of returned data
    if (Array.isArray(data) && data.length > 0) {
      console.log(
        "[DEBUG] Sample category structure:",
        JSON.stringify(data[0], null, 2),
      );
      console.log("[DEBUG] All categories:", JSON.stringify(data, null, 2));
    }

    return data;
  } catch (err) {
    console.error(`[${timestamp}] 💥 Error fetching categories:`, err.message);
    throw err;
  }
};

/**
 * Create a new category
 * @param {Object} categoryData - { name, color }
 * @returns {Promise<Object>} Created category object
 * @throws {Error} If token invalid or creation fails
 */
export const createCategory = async (categoryData) => {
  const endpoint = API_BASE_URL;
  const timestamp = new Date().toISOString();

  try {
    console.log(`[${timestamp}] 🆕 Creating category:`, categoryData);

    const tokenValidation = verifyTokenBeforeFetch("createCategory");
    if (!tokenValidation.isValid) {
      throw new Error(tokenValidation.reason);
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(categoryData),
    });

    console.log(`[${timestamp}] 📦 Response - Status: ${response.status}`);
    const data = await safeParseJson(response);

    if (!response.ok) {
      const errorMessage =
        data?.error || `Failed to create category: ${response.statusText}`;
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

    console.log(`[${timestamp}] ✅ Category created successfully`);
    console.log(
      "[DEBUG] Created category response:",
      JSON.stringify(data, null, 2),
    );
    return data;
  } catch (err) {
    console.error(`[${timestamp}] 💥 Error creating category:`, err.message);
    throw err;
  }
};

/**
 * Update a category
 * @param {number} id - Category ID
 * @param {Object} categoryData - { name, color }
 * @returns {Promise<Object>} Updated category object
 * @throws {Error} If token invalid or update fails
 */
export const updateCategory = async (id, categoryData) => {
  const endpoint = `${API_BASE_URL}/${id}`;
  const timestamp = new Date().toISOString();

  try {
    console.log(`[${timestamp}] ✏️ Updating category ID: ${id}`, categoryData);

    const tokenValidation = verifyTokenBeforeFetch("updateCategory");
    if (!tokenValidation.isValid) {
      throw new Error(tokenValidation.reason);
    }

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(categoryData),
    });

    console.log(`[${timestamp}] 📦 Response - Status: ${response.status}`);
    const data = await safeParseJson(response);

    if (!response.ok) {
      const errorMessage =
        data?.error || `Failed to update category: ${response.statusText}`;
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

    console.log(`[${timestamp}] ✅ Category updated successfully`);
    console.log(
      "[DEBUG] Update response:",
      data ? JSON.stringify(data, null, 2) : "(empty response)",
    );
    return data;
  } catch (err) {
    console.error(
      `[${timestamp}] 💥 Error updating category ${id}:`,
      err.message,
    );
    throw err;
  }
};

/**
 * Delete a category
 * @param {number} id - Category ID
 * @param {boolean} force - Set to true to confirm deletion of category with expenses
 * @returns {Promise<void>}
 * @throws {Error} If token invalid or deletion fails
 */
export const deleteCategory = async (id, force = false) => {
  const endpoint = `${API_BASE_URL}/${id}?force=${force}`;
  const timestamp = new Date().toISOString();

  try {
    console.log(
      `[${timestamp}] 🗑️ Deleting category ID: ${id} (force=${force})`,
    );

    const tokenValidation = verifyTokenBeforeFetch("deleteCategory");
    if (!tokenValidation.isValid) {
      throw new Error(tokenValidation.reason);
    }

    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    console.log(`[${timestamp}] 📦 Response - Status: ${response.status}`);

    // Handle 409 Conflict - category has user expenses
    if (response.status === 409) {
      const data = await safeParseJson(response);
      const error = new Error(data?.error || "Category has expenses");
      error.status = 409;
      error.hasUserExpenses = data?.hasUserExpenses || false;
      error.expenseCount = data?.expenseCount || 0;
      error.categoryName = data?.categoryName || "Unknown";
      console.warn(
        `[${timestamp}] ⚠️ Conflict - Category has ${error.expenseCount} user expenses`,
        data,
      );
      throw error;
    }

    if (!response.ok) {
      const data = await safeParseJson(response);
      const errorMessage =
        data?.error || `Failed to delete category: ${response.statusText}`;
      console.error(`[${timestamp}] ❌ Error:`, {
        status: response.status,
        data,
      });
      throw new Error(errorMessage);
    }

    console.log(`[${timestamp}] ✅ Category deleted successfully`);
  } catch (err) {
    console.error(
      `[${timestamp}] 💥 Error deleting category ${id}:`,
      err.message,
    );
    throw err;
  }
};
