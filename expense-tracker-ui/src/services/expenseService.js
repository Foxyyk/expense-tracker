/**
 * Expense API Service - REFACTORED with Error Handling & Token Validation
 * Handles all communication with backend expense endpoints (CRUD operations)
 *
 * Enhancements:
 * - Client-side token validation before each request
 * - Safe JSON parsing with content-type checking
 * - Centralized 401 error handling with auto-logout
 * - Comprehensive request/response logging for debugging
 * - Proper error messages for user feedback
 */

import { getAuthHeaders } from "./authService";
import { verifyTokenBeforeFetch, debugToken } from "../utils/tokenUtils";
import { safeParseJson, createApiErrorHandler } from "../utils/apiErrorHandler";

const API_BASE_URL = "http://localhost:5300/api/expenses";

/**
 * Get all expenses for the current user
 * @returns {Promise<Array>} Array of expense objects
 * @throws {Error} If token invalid, network error, or API error occurs
 */
export const getExpenses = async () => {
  const endpoint = `${API_BASE_URL}`;
  const timestamp = new Date().toISOString();

  try {
    console.log(`[${timestamp}] 📋 Fetching all expenses...`);

    // Validate token before request
    const tokenValidation = verifyTokenBeforeFetch("getExpenses");
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
        data?.error ||
        data?.message ||
        `HTTP ${response.status}: ${response.statusText}`;
      console.error(`[${timestamp}] ❌ Failed to fetch expenses:`, {
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
      `[${timestamp}] ✅ Fetched ${Array.isArray(data) ? data.length : 0} expenses`,
    );
    return data;
  } catch (err) {
    console.error(`[${timestamp}] 💥 Error fetching expenses:`, err.message);
    throw err;
  }
};

/**
 * Get a single expense by ID
 * @param {number} id - Expense ID
 * @returns {Promise<Object>} Expense object
 * @throws {Error} If token invalid or API error occurs
 */
export const getExpenseById = async (id) => {
  const endpoint = `${API_BASE_URL}/${id}`;
  const timestamp = new Date().toISOString();

  try {
    console.log(`[${timestamp}] 📄 Fetching expense ID: ${id}`);

    const tokenValidation = verifyTokenBeforeFetch("getExpenseById");
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
        data?.error || data?.message || `Failed to fetch expense ${id}`;
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

    console.log(`[${timestamp}] ✅ Fetched expense successfully`);
    return data;
  } catch (err) {
    console.error(
      `[${timestamp}] 💥 Error fetching expense ${id}:`,
      err.message,
    );
    throw err;
  }
};

/**
 * Create a new expense
 * @param {Object} expenseData - { categoryId, amount, description, date }
 * @returns {Promise<Object>} Created expense object
 * @throws {Error} If token invalid or validation error occurs
 */
export const createExpense = async (expenseData) => {
  const endpoint = `${API_BASE_URL}`;
  const timestamp = new Date().toISOString();

  try {
    console.log(`[${timestamp}] 🆕 Creating expense:`, expenseData);

    const tokenValidation = verifyTokenBeforeFetch("createExpense");
    if (!tokenValidation.isValid) {
      throw new Error(tokenValidation.reason);
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(expenseData),
    });

    console.log(`[${timestamp}] 📦 Response - Status: ${response.status}`);
    const data = await safeParseJson(response);

    if (!response.ok) {
      const errorMessage =
        data?.error || data?.message || "Failed to create expense";
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

    console.log(`[${timestamp}] ✅ Expense created successfully`);
    return data;
  } catch (err) {
    console.error(`[${timestamp}] 💥 Error creating expense:`, err.message);
    throw err;
  }
};

/**
 * Update an existing expense
 * @param {number} id - Expense ID
 * @param {Object} expenseData - { categoryId, amount, description, date }
 * @returns {Promise<Object>} Updated expense object
 * @throws {Error} If token invalid or update fails
 */
export const updateExpense = async (id, expenseData) => {
  const endpoint = `${API_BASE_URL}/${id}`;
  const timestamp = new Date().toISOString();

  try {
    console.log(`[${timestamp}] ✏️ Updating expense ID: ${id}`, expenseData);

    const tokenValidation = verifyTokenBeforeFetch("updateExpense");
    if (!tokenValidation.isValid) {
      throw new Error(tokenValidation.reason);
    }

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(expenseData),
    });

    console.log(`[${timestamp}] 📦 Response - Status: ${response.status}`);

    // Handle 204 No Content (successful but no response body)
    if (response.status === 204) {
      console.log(
        `[${timestamp}] ✅ Expense updated successfully (204 No Content)`,
      );
      return { id, ...expenseData };
    }

    const data = await safeParseJson(response);

    if (!response.ok) {
      const errorMessage =
        data?.error || data?.message || "Failed to update expense";
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

    console.log(`[${timestamp}] ✅ Expense updated successfully`);
    return data;
  } catch (err) {
    console.error(
      `[${timestamp}] 💥 Error updating expense ${id}:`,
      err.message,
    );
    throw err;
  }
};

/**
 * Delete an expense
 * @param {number} id - Expense ID
 * @returns {Promise<void>}
 * @throws {Error} If token invalid or deletion fails
 */
export const deleteExpense = async (id) => {
  const endpoint = `${API_BASE_URL}/${id}`;
  const timestamp = new Date().toISOString();

  try {
    console.log(`[${timestamp}] 🗑️ Deleting expense ID: ${id}`);

    const tokenValidation = verifyTokenBeforeFetch("deleteExpense");
    if (!tokenValidation.isValid) {
      throw new Error(tokenValidation.reason);
    }

    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    console.log(`[${timestamp}] 📦 Response - Status: ${response.status}`);

    if (!response.ok) {
      const data = await safeParseJson(response);
      const errorMessage =
        data?.error || data?.message || "Failed to delete expense";
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

    console.log(`[${timestamp}] ✅ Expense deleted successfully`);
  } catch (err) {
    console.error(
      `[${timestamp}] 💥 Error deleting expense ${id}:`,
      err.message,
    );
    throw err;
  }
};

/**
 * Export expenses as CSV
 * @returns {Promise<Blob>} CSV file blob
 * @throws {Error} If token invalid or export fails
 */
export const exportExpensesCsv = async () => {
  const endpoint = `${API_BASE_URL}/export/csv`;
  const timestamp = new Date().toISOString();

  try {
    console.log(`[${timestamp}] 📤 Exporting expenses as CSV...`);

    const tokenValidation = verifyTokenBeforeFetch("exportExpensesCsv");
    if (!tokenValidation.isValid) {
      throw new Error(tokenValidation.reason);
    }

    const response = await fetch(endpoint, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    console.log(`[${timestamp}] 📦 Response - Status: ${response.status}`);

    if (!response.ok) {
      const data = await safeParseJson(response);
      const errorMessage =
        data?.error || data?.message || "Failed to export expenses";
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

    console.log(`[${timestamp}] ✅ Expenses exported successfully`);
    return await response.blob();
  } catch (err) {
    console.error(`[${timestamp}] 💥 Error exporting expenses:`, err.message);
    throw err;
  }
};
