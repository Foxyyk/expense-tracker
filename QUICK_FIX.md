# 401 Unauthorized Error - Solution Summary

## What's Wrong?

Your backend API is running but **rejecting JWT tokens** with 401 Unauthorized errors on every API call:

- `GET /api/expenses` → 401
- `GET /api/expenses/summary/monthly` → 401
- `GET /api/auth/profile` → 401

The frontend is correctly sending the token, but the backend's JWT validation is failing.

## What I Fixed

### Backend Changes ✅

1. **Added JWT Debug Logging** - Backend now logs why each token is rejected
2. **Added Health Check Endpoint** - `/api/health` to test API connectivity
3. **Enhanced CORS Configuration** - Better support for Authorization headers
4. **Added JWT Settings to Development Config** - Ensures correct configuration in development mode
5. **Added Token Validation Events** - Shows token validation timeline

### Frontend Changes ✅

1. **Fixed Response Parsing** - No more "body stream already read" errors
2. **Enhanced Error Logging** - Better error messages for debugging

## Quick Fix (Do This Now!)

### Option A - Use the Script (Easiest)

Run this in PowerShell from the project root:

```powershell
.\restart-api.ps1
```

This will:

1. Kill the old backend process
2. Clean build artifacts
3. Start the backend with debugging enabled

### Option B - Manual Restart

```powershell
# 1. Kill the process
$process = netstat -ano | Select-String ":5299"
$pid = ($process -split '\s+')[-1]
Stop-Process -ID $pid -Force

# 2. Clean and restart
cd ExpenseTrackerAPI
Remove-Item bin, obj -Recurse -Force
dotnet run
```

### Option C - Windows Task Manager

1. Press `Ctrl+Shift+Esc` to open Task Manager
2. Find `dotnet` or `ExpenseTrackerAPI` process
3. Right-click → End Task
4. Open PowerShell in `ExpenseTrackerAPI` folder
5. Run: `dotnet run`

## What to Look For in Console Output

### ✅ Success Indicators:

```
info: Program[0]
      ✓ Database initialized successfully

info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5299
```

### 🔍 Debug Messages When Making API Calls:

```
JWT Token Received from Authorization header: Bearer eyJhbGciOiJIUzI1Ni...
JWT Token Validated Successfully for user: 1
```

### ❌ Error Indicators:

```
JWT Authentication Failed: The token is expired
JWT Challenge: Invalid issuer
```

## After Restarting Backend

1. **Refresh the frontend** (F5 in browser)
2. **Log in again** (register new user or use existing)
3. **Navigate to Dashboard** - Should now load with data
4. **Check browser console** - Should show minimal errors
5. **Check backend console** - Should show token validation success

## Files Modified

### Backend

- `Program.cs` - Added JWT debug events, CORS headers, health endpoint
- `appsettings.Development.json` - Added JWT settings

### Frontend

- `expenseService.js` - Fixed response parsing
- `summaryService.js` - Fixed response parsing
- `categoryService.js` - Fixed response parsing (all 4 functions)
- `userService.js` - Fixed response parsing (all 4 functions)

## Troubleshooting

### Still Getting 401?

1. Check backend console output for "JWT Authentication Failed: ..."
2. Verify both config files have **identical** `SecretKey`:
   - `appsettings.json`
   - `appsettings.Development.json`
3. Verify Issuer and Audience match:
   - Issuer: `ExpenseTrackerAPI`
   - Audience: `ExpenseTrackerClient`

### "Address already in use" Error?

The old process is still running:

```powershell
# Force kill all dotnet processes
Get-Process dotnet | Stop-Process -Force
```

### Database Errors?

The database will auto-create. If you want fresh data:

```bash
cd ExpenseTrackerAPI
# Delete the database file
Remove-Item expensetracker.db -Force
# Restart API - it will recreate
dotnet run
```

## Success Criteria

After following these steps:

- [ ] Backend starts without errors
- [ ] Browser console shows minimal warnings
- [ ] Login works and token is stored
- [ ] Dashboard loads with monthly summary
- [ ] Expenses page shows expense list
- [ ] Profile page loads user information
- [ ] All API calls return data (no 401 errors)

## Need More Help?

I've created detailed documentation:

- `AUTHENTICATION_DEBUG_GUIDE.md` - Complete debugging guide with manual testing steps

The debug output in the backend console will tell us exactly what's wrong!

**Next Step:** Restart the backend using the script or manual process above. 👆
