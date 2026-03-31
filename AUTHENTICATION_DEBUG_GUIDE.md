# Authentication 401 Error - Debugging Guide

## Problem

All API requests are returning `401 Unauthorized` even though tokens are being sent:

```
GET http://localhost:5299/api/expenses 401 (Unauthorized)
Authorization: 'Bearer token present'
```

## Root Cause

The backend is running but **rejecting JWT tokens during validation**. This can happen due to:

1. Token validation configuration mismatch
2. Token expiration
3. JWT secret key mismatch
4. Issuer/Audience mismatch

## Solution Steps

### Step 1: Kill the Existing Backend Process

The backend must be restarted with new debugging code to see what's wrong.

**Option A - PowerShell (Recommended):**

```powershell
# Find the dotnet process running on port 5299
Get-NetTCPConnection -LocalPort 5299 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Get-Process -ID $_ | Stop-Process -Force }
```

**Option B - Task Manager:**

1. Open Task Manager
2. Find `dotnet.exe` or `ExpenseTrackerAPI.exe`
3. Right-click → End Task

**Option C - Command Line:**

```cmd
netstat -ano | findstr :5299
taskkill /PID {PID} /F
```

### Step 2: Restart the Backend

In the `ExpenseTrackerAPI` folder, run:

```bash
dotnet run
```

### Step 3: Check the Console Output

Watch the console for debug messages when making API calls:

```
JWT Token Received from Authorization header: Bearer eyJhbGciOiJIUzI1NiIs...
JWT Token Validated Successfully for user: 1
```

If you see `JWT Authentication Failed`, note the error message - it will tell you exactly what's wrong.

### Step 4: Test the Health Endpoint

Open your browser or use curl to verify the API is responding:

```bash
curl http://localhost:5299/api/health
```

Expected response:

```json
{ "status": "ok", "message": "API is running" }
```

### Step 5: Check Token Generation

1. Go to the Login page in the frontend
2. Register a NEW user (or use an existing one)
3. Watch the **browser console** for the token being stored
4. Check the backend console for token validation output

## Common Error Messages & Solutions

### Error: "Invalid issuer"

**Cause:** Backend issuer doesn't match token issuer
**Solution:** Ensure `appsettings.Development.json` has correct issuer:

```json
"JwtSettings": {
  "Issuer": "ExpenseTrackerAPI",
  "Audience": "ExpenseTrackerClient"
}
```

### Error: "Token lifetime validation failed"

**Cause:** Token has expired
**Solution:** This shouldn't happen for new tokens. If it does, the server time might be out of sync.

### Error: "Invalid signature"

**Cause:** Secret key mismatch between token generation and validation
**Solution:** Both files must have identical `SecretKey` value:

- `appsettings.json` (production)
- `appsettings.Development.json` (development)

Both should have:

```json
"SecretKey": "your-super-secret-key-change-this-in-production-minimum-32-characters-long!"
```

## What Was Fixed

### Backend Changes:

1. ✅ Added JWT Bearer Event logging to show exactly why tokens fail
2. ✅ Added `/api/health` endpoint for connectivity testing
3. ✅ Added CORS `WithExposedHeaders("Authorization")`
4. ✅ Added `ClockSkew = TimeSpan.Zero` for strict time validation
5. ✅ Updated `appsettings.Development.json` with JWT settings

### Frontend Changes:

1. ✅ Fixed response body double-read issue in all services
2. ✅ Enhanced error logging to show response status

## Verification Checklist

- [ ] Backend is running (check console for startup messages)
- [ ] Health endpoint responds: `curl http://localhost:5299/api/health`
- [ ] New user can register with email/password
- [ ] Token appears in Frontend localStorage after login
- [ ] Backend console shows "JWT Token Validated Successfully"
- [ ] Dashboard page loads with data
- [ ] Expenses page loads with data
- [ ] Profile page loads with user information

## Manual Testing

### Test Token Validation

1. Get a token by logging in
2. Copy the token from browser DevTools → Application → localStorage → token
3. Use curl to test:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:5299/api/expenses
```

Should return expense data (or empty array []), NOT 401 error.

### Debug with console.log

The frontend diagnostic tool is available:

```javascript
// In browser console:
window.diagnostics.runFullDiagnostic();
```

This will show:

- Whether token exists
- Whether API is reachable
- Whether authentication works

## Still Having Issues?

1. **Clear all localStorage:**

   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

   Then refresh the page and try logging in again

2. **Check backend logs for exceptions** - any error message in console might give clues

3. **Verify database exists** - check if `expensetracker.db` file exists in backend folder

4. **Check JWT settings match exactly** - any typo in SecretKey, Issuer, or Audience causes failure

5. **Verify frontend is using correct API URL** - should be `http://localhost:5299`

## Next Steps

1. Kill the old backend process
2. Restart with `dotnet run`
3. Watch the console output
4. Try making an API call from frontend
5. Share the error message from backend console with me

The console output will tell us exactly why the JWT validation is failing!
