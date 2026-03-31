/**
 * Token Utilities
 * Helper functions for JWT token inspection, validation, and debugging
 *
 * These utilities enable client-side token validation before API requests
 * to detect expired tokens early and provide better user feedback.
 */

/**
 * Decode JWT token payload (without verification)
 * WARNING: This decodes but does NOT verify the signature
 * Token verification happens on the server
 *
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token || typeof token !== "string") {
    return null;
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.warn("Invalid JWT: wrong number of parts");
      return null;
    }

    const payload = parts[1];
    // Decode base64url to base64 (add padding if needed)
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded));

    return decoded;
  } catch (error) {
    console.error("Failed to decode token:", error.message);
    return null;
  }
};

/**
 * Get human-readable token claims for debugging
 * @param {string} token - JWT token
 * @returns {Object|null} Token claims with formatted dates
 */
export const getTokenClaims = (token) => {
  const payload = decodeToken(token);
  if (!payload) return null;

  return {
    userId: payload.nameid || payload.sub || payload.UserId || "unknown",
    email: payload.email || payload.Email || "unknown",
    issuedAt: payload.iat
      ? new Date(payload.iat * 1000).toISOString()
      : "unknown",
    expiresAt: payload.exp
      ? new Date(payload.exp * 1000).toISOString()
      : "unknown",
    issuer: payload.iss || "unknown",
    audience: payload.aud || "unknown",
    // Raw timestamps for debugging
    rawIat: payload.iat,
    rawExp: payload.exp,
  };
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
  const payload = decodeToken(token);

  if (!payload || !payload.exp) {
    console.warn(
      "Cannot determine expiration: invalid token or missing exp claim",
    );
    return true; // Assume expired if we can't verify
  }

  const expiryDate = new Date(payload.exp * 1000);
  const now = new Date();
  const isExpired = now >= expiryDate;

  if (isExpired) {
    console.warn(
      `[Token Expiration] Token expired at ${expiryDate.toISOString()}`,
    );
  }

  return isExpired;
};

/**
 * Get time remaining until token expires (in milliseconds)
 * @param {string} token - JWT token
 * @returns {number|null} Milliseconds until expiration, or null if invalid
 */
export const getTokenTimeRemaining = (token) => {
  const payload = decodeToken(token);

  if (!payload || !payload.exp) {
    return null;
  }

  const expiryTime = payload.exp * 1000; // Convert to milliseconds
  const now = Date.now();
  const remaining = expiryTime - now;

  return remaining > 0 ? remaining : 0;
};

/**
 * Format time remaining as human-readable string
 * @param {number} milliseconds - Time in milliseconds
 * @returns {string} Formatted time string (e.g., "59m 30s")
 */
export const formatTimeRemaining = (milliseconds) => {
  if (!milliseconds) return "expired";

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Log complete token information to console for debugging
 * @param {string} token - JWT token (if omitted, retrieves from localStorage)
 */
export const debugToken = (token) => {
  const actualToken = token || localStorage.getItem("token");

  if (!actualToken) {
    console.log("❌ No token found in storage");
    return;
  }

  const payload = decodeToken(actualToken);
  const isExpired = isTokenExpired(actualToken);
  const remaining = getTokenTimeRemaining(actualToken);
  const claims = getTokenClaims(actualToken);

  console.group("🔍 JWT Token Debug Info");

  console.log("📋 Token Structure:");
  console.log("  Token length:", actualToken.length);
  console.log("  Valid format (3 parts):", actualToken.split(".").length === 3);

  console.log("\n⏰ Expiration Status:");
  console.log("  Expired:", isExpired ? "🔴 YES - LOGIN REQUIRED" : "✅ NO");
  if (remaining) {
    console.log("  Time remaining:", formatTimeRemaining(remaining));
  }

  if (claims) {
    console.log("\n👤 Token Claims:");
    console.log("  User ID:", claims.userId);
    console.log("  Email:", claims.email);
    console.log("  Issued at:", claims.issuedAt);
    console.log("  Expires at:", claims.expiresAt);
    console.log("  Issuer:", claims.issuer);
    console.log("  Audience:", claims.audience);
  }

  if (payload) {
    console.log("\n📄 Full Payload:");
    console.log(payload);
  }

  console.log("\n🔐 Token Preview:");
  console.log("  First 50 chars:", actualToken.substring(0, 50) + "...");
  console.log(
    "  Last 50 chars: ..." + actualToken.substring(actualToken.length - 50),
  );

  console.groupEnd();
};

/**
 * Verify token before fetch - check expiration and validity
 * This should be called before making authenticated API requests
 *
 * @param {string} functionName - Name of function calling this (for logging)
 * @returns {Object} Validation result with isValid, reason, and expiresIn
 */
export const verifyTokenBeforeFetch = (functionName = "API Request") => {
  const token = localStorage.getItem("token");
  const timestamp = new Date().toISOString();

  // Check if token exists
  if (!token) {
    const reason = "No authentication token found in localStorage";
    console.error(
      `[${timestamp}] ❌ ${functionName}: Token validation failed - ${reason}`,
    );
    return {
      isValid: false,
      reason,
      expiresIn: 0,
    };
  }

  // Check if token format is valid
  if (token.split(".").length !== 3) {
    const reason = "Token format invalid (not a valid JWT)";
    console.error(
      `[${timestamp}] ❌ ${functionName}: Token validation failed - ${reason}`,
    );
    return {
      isValid: false,
      reason,
      expiresIn: 0,
    };
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    const reason = "Token expired - Please login again";
    console.error(
      `[${timestamp}] ❌ ${functionName}: Token validation failed - ${reason}`,
    );
    return {
      isValid: false,
      reason,
      expiresIn: 0,
    };
  }

  // Token is valid
  const remaining = getTokenTimeRemaining(token);
  console.log(
    `[${timestamp}] ✅ ${functionName}: Token valid (${formatTimeRemaining(
      remaining,
    )} remaining)`,
  );

  return {
    isValid: true,
    reason: "Token is valid",
    expiresIn: remaining,
  };
};

/**
 * Create proper Authorization header from token
 * @param {string} token - JWT token
 * @returns {string} Formatted Authorization header value
 */
export const createAuthHeader = (token) => {
  if (!token) return null;
  return `Bearer ${token}`;
};

/**
 * Safely extract user ID from token
 * @param {string} token - JWT token
 * @returns {string|null} User ID from token claims
 */
export const getUserIdFromToken = (token) => {
  const claims = getTokenClaims(token);
  return claims ? claims.userId : null;
};

/**
 * Safely extract email from token
 * @param {string} token - JWT token
 * @returns {string|null} Email from token claims
 */
export const getEmailFromToken = (token) => {
  const claims = getTokenClaims(token);
  return claims ? claims.email : null;
};

/**
 * Watch token for expiration and execute callback when expired
 * Useful for auto-logout or refresh token triggers
 *
 * @param {Function} onExpire - Callback function to execute when token expires
 * @returns {Function} Cleanup function to stop watching
 */
export const watchTokenExpiration = (onExpire) => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("No token to watch");
    return () => {};
  }

  const remaining = getTokenTimeRemaining(token);
  if (remaining <= 0) {
    onExpire();
    return () => {};
  }

  // Set timeout to trigger slightly before actual expiration
  const timeoutId = setTimeout(() => {
    console.warn("🔔 Token expiration warning: Token will expire soon");
    onExpire();
  }, remaining - 60000); // Alert 1 minute before expiration

  // Return cleanup function
  return () => {
    clearTimeout(timeoutId);
  };
};

export default {
  decodeToken,
  getTokenClaims,
  isTokenExpired,
  getTokenTimeRemaining,
  formatTimeRemaining,
  debugToken,
  verifyTokenBeforeFetch,
  createAuthHeader,
  getUserIdFromToken,
  getEmailFromToken,
  watchTokenExpiration,
};
