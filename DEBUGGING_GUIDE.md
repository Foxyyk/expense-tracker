# Quick Start: Using the New Authentication Error Handling

## For Users: How to Test

### 1. Login Fresh

```
1. Open browser dev console (F12)
2. Go to login page
3. Login with valid credentials
4. Run: window.debugToken()
   → Shows: ✅ Token is valid (59m remaining)
```

### 2. Test with Expired Token (Simulated)

```
1. After login, open console
2. Get current token:
   const token = localStorage.getItem('token')
3. Modify expiration to past:
   const payload = { ...JSON.parse(atob(token.split('.')[1])), exp: 0 }
   const newToken = "header." + btoa(JSON.stringify(payload)) + ".sig"
   localStorage.setItem('token', newToken)
4. Refresh page
5. Try to access protected page
   → Shows: ❌ Token validation failed before any request
   → Auto-redirects to login
```

### 3. Run Full Diagnostics

```
1. Open browser console (F12)
2. Run: window.diagnostics.runFullDiagnostic()
3. Results show:
   ✅ Token exists
   ✅ Token not expired
   ✅ API reachable
   ✅ Authentication works
```

### 4. Clear All Auth (Fresh Login Test)

```
1. Open console
2. Run: window.diagnostics.clearAllAuth()
3. Page refreshes
4. You're logged out, redirected to login
5. Login again to test fresh token flow
```

## For Developers: Debugging Commands

### Check Token Expiration

```javascript
window.debugToken();
```

**Output**:

```
🔍 JWT Token Debug Info
📋 Token Structure:
  Token length: 512
  Valid format (3 parts): true

⏰ Expiration Status:
  Expired: ✅ NO
  Time remaining: 58m 30s

👤 Token Claims:
  User ID: 1
  Email: user@example.com
  Issued at: 2025-03-23T22:00:00.000Z
  Expires at: 2025-03-23T23:00:00.000Z
  Issuer: ExpenseTrackerAPI
  Audience: ExpenseTrackerClient
```

### Full Authentication Diagnostic

```javascript
window.diagnostics.runFullDiagnostic();
```

**Output**:

```
╔════════════════════════════════════════╗
║    FULL AUTHENTICATION DIAGNOSTIC      ║
╚════════════════════════════════════════╝

=== AUTHENTICATION DIAGNOSTIC ===
Token exists: ✅
Token expired: ✅ NO
...

=== SUMMARY ===
Token exists: ✅
Token expired: ✅ NO
API reachable: ✅
Authentication works: ✅
```

### Check Token Expiration Countdown

```javascript
window.diagnostics.showTokenExpiration();
```

**Output**:

```
=== TOKEN EXPIRATION DETAILS ===
✅ Token is valid
Issued at:   2025-03-23T22:00:00.000Z
Expires at:  2025-03-23T23:00:00.000Z
⏱️ Time remaining: 0h 58m 30s
```

### Clear for Fresh Login Test

```javascript
window.diagnostics.clearAllAuth();
```

**Result**: All auth data cleared, redirects to login

## What Changed in Service Calls

### Before (Old Implementation)

```javascript
// summaryService.js - OLD
export const getMonthlySummary = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/summary/monthly`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json(); // ❌ Crashes on HTML response
    if (!response.ok) throw new Error(data?.error);
    return data;
  } catch (err) {
    console.error("Error:", err);
    throw err; // ❌ Each service throws, no auto-logout
  }
};
```

### After (New Implementation)

```javascript
// summaryService.js - NEW
export const getMonthlySummary = async () => {
  const timestamp = new Date().toISOString();
  try {
    console.log(`[${timestamp}] 📊 Fetching monthly summary...`);

    // ✅ Validate token BEFORE making request
    const tokenValidation = verifyTokenBeforeFetch("getMonthlySummary");
    if (!tokenValidation.isValid) {
      throw new Error(tokenValidation.reason);
    }

    const response = await fetch(endpoint, { headers: getAuthHeaders() });

    // ✅ Safe JSON parsing - handles HTML responses
    const data = await safeParseJson(response);

    if (!response.ok) {
      // ✅ Centralized error handling with 401 auto-logout
      const errorHandler = createApiErrorHandler();
      throw errorHandler.handleError(response.status, new Error(...), endpoint);
    }

    console.log(`[${timestamp}] ✅ Monthly summary fetched successfully`);
    return data;
  } catch (err) {
    console.error(`[${timestamp}] 💥 Error:`, err);
    throw err;
  }
};
```

## Error Handling Flow

### Scenario 1: Token Is Expired

```
GET /api/expenses
  ↓
verifyTokenBeforeFetch("getExpenses")
  ↓
isTokenExpired(token) → TRUE
  ↓
❌ "Token expired - Please login again"
  ↓
Error thrown BEFORE fetch (no wasted request)
  ↓
Console shows token expiration time
```

### Scenario 2: Server Returns 401

```
GET /api/expenses (with invalid token)
  ↓
Request made
  ↓
Server: 401 Unauthorized (HTML error page)
  ↓
safeParseJson() → sees content-type: text/html
  ↓
Returns null (doesn't crash on JSON parse)
  ↓
handleError(401, ...) called
  ↓
localStorage cleared
  ↓
Redirect: window.location = "/login"
  ↓
User sees: "Session expired. Please log in again."
```

### Scenario 3: Network Error

```
GET /api/expenses
  ↓
Network connection lost
  ↓
fetch() raises error
  ↓
catch block catches it
  ↓
❌ "Network error. Please check your connection."
  ↓
User sees friendly message (not a cryptic error)
```

## Console Output Examples

### Successful Request

```
[2025-03-23T22:45:30.000Z] 📊 Fetching monthly summary...
[2025-03-23T22:45:30.001Z] 🔐 Validating authentication token...
[2025-03-23T22:45:30.002Z] ✅ getMonthlySummary: Token valid (58m 42s remaining)
[2025-03-23T22:45:30.003Z] 📋 Headers prepared: ✓ Bearer token present
[2025-03-23T22:45:30.004Z] 🚀 Sending GET request to: http://localhost:5300/api/expenses/summary/monthly
[2025-03-23T22:45:30.250Z] 📦 Response received - Status: 200 OK
[2025-03-23T22:45:30.251Z] ✓ Response parsed successfully
[2025-03-23T22:45:30.252Z] ✅ Monthly summary fetched successfully
```

### Expired Token Request

```
[2025-03-23T22:50:00.000Z] 📊 Fetching monthly summary...
[2025-03-23T22:50:00.001Z] 🔐 Validating authentication token...
[2025-03-23T22:50:00.002Z] ❌ getMonthlySummary: Token validation failed - Token expired - Please login again
[2025-03-23T22:50:00.003Z] 💥 Error in getMonthlySummary: Token expired - Please login again

🔍 Authentication Debug Info
Token exists: ✓
Token expired: ✓ YES - LOGIN REQUIRED
📍 Redirect to login...
```

## Testing Checklist

- [ ] Run `window.debugToken()` after login → shows token valid with countdown
- [ ] Run `window.diagnostics.runFullDiagnostic()` → all checks pass
- [ ] Create expense → console shows [timestamp] markers through entire flow
- [ ] Check categories → uses same logging pattern
- [ ] Update profile → profile endpoint works correctly
- [ ] Clear token manually:
  - `localStorage.removeItem('token')`
  - Try to access protected page
  - Auto-redirects to login
- [ ] Check network tab → all 401 responses now properly handled (no HTML parsing errors)

## Most Important Console Commands to Remember

```javascript
// When user reports error - run this:
window.debugToken();

// When checking system health:
window.diagnostics.runFullDiagnostic();

// When clearing auth for fresh login test:
window.diagnostics.clearAllAuth();

// To see remaining time before token expires:
window.diagnostics.showTokenExpiration();
```

## Troubleshooting

| Problem                              | Solution                                                                |
| ------------------------------------ | ----------------------------------------------------------------------- |
| "Token validation failed" in console | Token expired. Run `window.diagnostics.clearAllAuth()` then login again |
| "Failed to parse response as JSON"   | Now handled gracefully - requests don't crash                           |
| 401 errors on protected pages        | Auto-detected and redirects to login automatically                      |
| Console spam with timestamps         | This is intentional for debugging - turn off in production              |
| Diagnostic says "API not reachable"  | Start backend: `dotnet run` in ExpenseTrackerAPI folder                 |

## Next Steps (If Needed)

1. **Token Refresh** (future enhancement)
   - Automatically refresh token when <5 min remaining
   - No user interruption

2. **Error Boundaries** (future enhancement)
   - Catch component errors gracefully
   - Show retry buttons

3. **Offline Detection** (future enhancement)
   - Detect network connectivity
   - Queue requests for retry

---

**Created**: 2025-03-23  
**Environment**: React 18 + Vite + .NET Core 8.0  
**Status**: Production Ready ✅
