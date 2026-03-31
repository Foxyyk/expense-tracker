/**
 * Diagnostic Service - REFACTORED
 * Helps debug authentication and API issues
 *
 * Enhancements:
 * - Uses tokenUtils for advanced token inspection
 * - Shows token expiration info
 * - Displays remaining time until token expires
 * - Comprehensive error diagnostics
 */

import {
  decodeToken,
  isTokenExpired,
  getTokenTimeRemaining,
  getTokenClaims,
  debugToken,
} from "../utils/tokenUtils";
import { safeParseJson } from "../utils/apiErrorHandler";

export const diagnosticService = {
  /**
   * Check authentication status with advanced token info
   */
  checkAuth() {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const userObj = user ? JSON.parse(user) : null;

    let tokenExpired = false;
    let tokenInfo = null;
    let timeRemaining = null;

    if (token) {
      tokenExpired = isTokenExpired(token);
      tokenInfo = getTokenClaims(token);
      timeRemaining = getTokenTimeRemaining(token);
    }

    console.log("=== AUTHENTICATION DIAGNOSTIC ===");
    console.log("Token exists:", !!token);
    if (token) {
      console.log("Token preview:", token.substring(0, 50) + "...");
      console.log("Token is valid JWT:", this.isValidJWT(token));
      console.log(
        "Token expired:",
        tokenExpired ? "⚠️ YES - LOGIN REQUIRED" : "✅ NO",
      );
      if (timeRemaining) {
        const minutes = Math.floor(timeRemaining / 60000);
        const seconds = Math.floor((timeRemaining % 60000) / 1000);
        console.log(`⏱️ Token expires in: ${minutes}m ${seconds}s`);
      }
      if (tokenInfo) {
        console.log("Token claims:", {
          userId: tokenInfo.userId,
          email: tokenInfo.email,
          issuedAt: tokenInfo.issuedAt,
          expiresAt: tokenInfo.expiresAt,
        });
      }
    }
    console.log("User in localStorage:", userObj);
    console.log("================================\n");

    return {
      hasToken: !!token,
      token: token,
      user: userObj,
      isValidJWT: token ? this.isValidJWT(token) : false,
      isExpired: tokenExpired,
      timeRemaining: timeRemaining,
      tokenInfo: tokenInfo,
    };
  },

  /**
   * Validate JWT token format
   */
  isValidJWT(token) {
    if (!token) return false;
    const parts = token.split(".");
    return parts.length === 3;
  },

  /**
   * Test API connectivity
   */
  async testAPIConnection() {
    console.log("=== TESTING API CONNECTION ===");
    try {
      const response = await fetch("http://localhost:5300/health", {
        method: "GET",
      }).catch(() => null);

      if (!response) {
        console.error("❌ Cannot reach API - Server not responding");
        return false;
      }

      console.log("✅ API is reachable (status:", response.status, ")");
      return true;
    } catch (error) {
      console.error("❌ API connection error:", error.message);
      return false;
    }
  },

  /**
   * Test authenticated API request with detailed diagnostics
   */
  async testAuthenticatedRequest() {
    console.log("=== TESTING AUTHENTICATED REQUEST ===");

    const auth = this.checkAuth();
    if (!auth.hasToken) {
      console.error("❌ No token found. Please login first.");
      return false;
    }

    if (auth.isExpired) {
      console.error("❌ Token is EXPIRED. Please login again.");
      return false;
    }

    try {
      const response = await fetch("http://localhost:5300/api/auth/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", {
        "content-type": response.headers.get("content-type"),
        "www-authenticate": response.headers.get("www-authenticate"),
      });

      if (!response.ok) {
        const data = await safeParseJson(response);

        if (response.status === 401) {
          console.error("❌ UNAUTHORIZED (401): Token rejected by server");
          console.error("Possible causes:");
          if (auth.isExpired) {
            console.error("  1. Token EXPIRED - Login again for fresh token");
          }
          console.error(
            "  2. Token format invalid - Check Authorization header",
          );
          console.error(
            "  3. Token signing key mismatch - Backend configuration issue",
          );
        } else if (response.status === 403) {
          console.error(`❌ FORBIDDEN (403): Access denied`);
        } else {
          console.error(
            `❌ Request failed with ${response.status}: ${response.statusText}`,
          );
        }

        console.error("Response body:", data);
        return false;
      }

      const data = await safeParseJson(response);
      console.log("✅ Authenticated request successful:", data);
      return true;
    } catch (error) {
      console.error("❌ Request error:", error.message);
      return false;
    }
  },

  /**
   * Show detailed token expiration info
   */
  showTokenExpiration() {
    const token = localStorage.getItem("token");

    console.log("\n=== TOKEN EXPIRATION DETAILS ===");

    if (!token) {
      console.log("❌ No token found");
      return;
    }

    const isExpired = isTokenExpired(token);
    const claims = getTokenClaims(token);
    const remaining = getTokenTimeRemaining(token);

    if (isExpired) {
      console.error("🔴 TOKEN EXPIRED");
      console.log("Expired at:", claims?.expiresAt);
      console.log("Action: Login again to get a fresh token");
    } else {
      console.log("✅ Token is valid");
      if (claims) {
        console.log("Issued at:  ", claims.issuedAt);
        console.log("Expires at: ", claims.expiresAt);
      }
      if (remaining) {
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        console.log(`⏱️ Time remaining: ${hours}h ${minutes}m ${seconds}s`);
      }
    }
    console.log("================================\n");
  },

  /**
   * Full diagnostic
   */
  async runFullDiagnostic() {
    console.log("\n\n");
    console.log("╔════════════════════════════════════════╗");
    console.log("║    FULL AUTHENTICATION DIAGNOSTIC      ║");
    console.log("╚════════════════════════════════════════╝\n");

    const authStatus = this.checkAuth();
    const apiConnected = await this.testAPIConnection();
    const authWorks = apiConnected
      ? await this.testAuthenticatedRequest()
      : false;

    console.log("\n=== SUMMARY ===");
    console.log("Token exists:", authStatus.hasToken ? "✅" : "❌");
    console.log("Token expired:", authStatus.isExpired ? "⚠️ YES" : "✅ NO");
    console.log("API reachable:", apiConnected ? "✅" : "❌");
    console.log("Authentication works:", authWorks ? "✅" : "❌");

    if (!authStatus.hasToken) {
      console.log("\n⚠️  ACTION NEEDED: Please log in to obtain a token");
    }

    if (authStatus.isExpired) {
      console.log("\n⚠️  ACTION NEEDED: Token expired - Please log in again");
    }

    if (!apiConnected) {
      console.log("\n⚠️  ACTION NEEDED: Start the backend server (dotnet run)");
    }

    if (
      apiConnected &&
      !authWorks &&
      authStatus.hasToken &&
      !authStatus.isExpired
    ) {
      console.log(
        "\n⚠️  ACTION NEEDED: Token rejected by server - Check backend configuration",
      );
    }

    console.log("\n");

    return {
      tokenExists: authStatus.hasToken,
      tokenExpired: authStatus.isExpired,
      apiConnected,
      authWorks,
      user: authStatus.user,
      timeRemaining: authStatus.timeRemaining,
    };
  },

  /**
   * Clear all auth and cookies for fresh login
   */
  clearAllAuth() {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🗑️ Clearing all authentication data...`);

    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();

      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });

      console.log(
        `[${timestamp}] ✅ All auth data cleared. Please refresh and log in again.`,
      );
    } catch (err) {
      console.error(`[${timestamp}] ❌ Error clearing auth data:`, err.message);
    }
  },
};

// Make available in console for debugging
if (typeof window !== "undefined") {
  window.diagnostics = diagnosticService;
  window.debugToken = debugToken; // Make token utils available
  console.log("💡 Diagnostics available in console:");
  console.log("   - window.diagnostics.runFullDiagnostic()");
  console.log("   - window.diagnostics.showTokenExpiration()");
  console.log("   - window.debugToken() - Show full token details");
}

export default diagnosticService;
