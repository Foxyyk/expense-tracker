// JWT Token Utilities - Debugging & Validation

/**
 * Decode JWT token to inspect payload
 * WARNING: This only decodes - it does NOT validate the signature!
 * Use only for debugging, not for security decisions
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;

    // Remove "Bearer " prefix if present
    const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;

    // Split token into parts
    const parts = cleanToken.split(".");
    if (parts.length !== 3) {
      console.error(
        "Invalid token format: expected 3 parts (header.payload.signature)",
      );
      return null;
    }

    // Decode payload (second part)
    const payload = parts[1];

    // Add padding if necessary (base64url must be multiple of 4)
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);

    // Decode base64
    const decoded = atob(padded);
    const parsed = JSON.parse(decoded);

    return parsed;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

/**
 * Check if token is expired (client-side check only)
 * Use this for UX decisions (e.g., show refresh prompt)
 * Backend will always validate server-side
 */
export const isTokenExpired = (token) => {
  try {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) {
      console.warn("Token payload missing or no exp claim");
      return true;
    }

    // exp is in seconds, Date.now() is in milliseconds
    const expiryDate = new Date(payload.exp * 1000);
    const now = new Date();

    const isExpired = now >= expiryDate;

    if (isExpired) {
      console.warn(
        `Token expired at ${expiryDate.toISOString()}, current time: ${now.toISOString()}`,
      );
    }

    return isExpired;
  } catch (error) {
    console.error("Failed to check token expiration:", error);
    return true; // Assume expired on error
  }
};

/**
 * Get time remaining until token expires
 */
export const getTokenTimeRemaining = (token) => {
  try {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return null;

    const expiryDate = new Date(payload.exp * 1000);
    const now = new Date();
    const remaining = expiryDate - now;

    return {
      remaining,
      expiryDate,
      remainingMinutes: Math.floor(remaining / 1000 / 60),
      remainingSeconds: Math.floor((remaining / 1000) % 60),
      formatted: `${Math.floor(remaining / 1000 / 60)}m ${Math.floor((remaining / 1000) % 60)}s`,
    };
  } catch (error) {
    console.error("Failed to get token time remaining:", error);
    return null;
  }
};

/**
 * Get token claims for debugging
 */
export const getTokenClaims = (token) => {
  const payload = decodeToken(token);
  if (!payload) return null;

  const timeInfo = getTokenTimeRemaining(token);

  return {
    userId: payload.sub || payload.nameid || "unknown",
    email: payload.email || "unknown",
    issuedAt: payload.iat
      ? new Date(payload.iat * 1000).toISOString()
      : "not set",
    expiresAt: payload.exp
      ? new Date(payload.exp * 1000).toISOString()
      : "unknown",
    timeRemaining: timeInfo?.formatted || "expired",
    issuer: payload.iss || "unknown",
    audience: payload.aud || "unknown",
    allClaims: payload,
  };
};

/**
 * Log token info to console (useful for debugging)
 */
export const debugToken = (label = "Token Debug") => {
  const token = localStorage.getItem("token");

  console.group(`🔐 ${label}`);

  if (!token) {
    console.error("❌ No token found in localStorage");
    console.groupEnd();
    return;
  }

  console.info("Token present:", "✅");
  console.info(
    "Token length:",
    token.length,
    "characters (typical JWT: 500-1500 chars)",
  );

  const isExpired = isTokenExpired(token);
  console.info("Token expired:", isExpired ? "❌ YES" : "✅ NO");

  const claims = getTokenClaims(token);
  if (claims) {
    console.table({
      "User ID": claims.userId,
      Email: claims.email,
      "Issued At": claims.issuedAt,
      "Expires At": claims.expiresAt,
      "Time Remaining": claims.timeRemaining,
    });
  }

  console.info("First 50 chars:", token.substring(0, 50) + "...");
  console.groupEnd();
};

/**
 * Verify token before making requests
 * Returns: {isValid: boolean, reason?: string, expiresIn?: number, token?: string}
 */
export const verifyTokenBeforeFetch = (functionName = "") => {
  const token = localStorage.getItem("token");

  if (!token) {
    return {
      isValid: false,
      reason: "No authentication token found. Please log in.",
    };
  }

  if (isTokenExpired(token)) {
    return {
      isValid: false,
      reason: "Your authentication token has expired. Please log in again.",
    };
  }

  const claims = getTokenClaims(token);
  const expiresIn = new Date(claims["Expires At"]).getTime() - Date.now();

  return {
    isValid: true,
    token,
    expiresIn,
    reason: null,
  };
};

/**
 * Create a properly formatted Authorization header
 */
export const createAuthHeader = (token) => {
  if (!token) return null;

  if (token.startsWith("Bearer ")) {
    return token;
  }

  return `Bearer ${token}`;
};
