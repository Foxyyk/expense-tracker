# JWT Authentication - Quick Reference

## Files Created/Modified

### New Files

```
Controllers/AuthController.cs          ← Register & Login endpoints
Services/AuthService.cs                ← Password hashing & JWT generation
Models/RegisterRequest.cs              ← DTO for registration
Models/LoginRequest.cs                 ← DTO for login
Models/AuthResponse.cs                 ← Response with token
```

### Modified Files

```
Program.cs                             ← Added JWT configuration
appsettings.json                       ← Added JWT settings
Controllers/ExpensesController.cs      ← Added [Authorize] attribute
```

## API Endpoints

### Authentication Endpoints (Public)

```
POST /api/auth/register
  Request: { email, password }
  Response: { success, message, token, user }
  Status: 201 Created (success) or 400 Bad Request (error)

POST /api/auth/login
  Request: { email, password }
  Response: { success, message, token, user }
  Status: 200 OK (success) or 401 Unauthorized (failed)
```

### Protected Endpoints (Require Authentication)

```
GET /api/expenses                      [Authorize]
  Header: Authorization: Bearer <token>

GET /api/expenses/{id}                 [Authorize]
  Header: Authorization: Bearer <token>

POST /api/expenses                     [Authorize]
  Header: Authorization: Bearer <token>

PUT /api/expenses/{id}                 [Authorize]
  Header: Authorization: Bearer <token>

DELETE /api/expenses/{id}              [Authorize]
  Header: Authorization: Bearer <token>
```

## Quick Start

### 1. Start the Application

```bash
dotnet run
```

### 2. Register a New User

```bash
curl -X POST "http://localhost:5297/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}'

# Returns:
# {
#   "success": true,
#   "message": "User registered successfully",
#   "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
#   "user": { "id": 1, "email": "user@example.com" }
# }
```

### 3. Use Token to Access Protected Endpoint

```bash
TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

curl -X GET "http://localhost:5297/api/expenses" \
  -H "Authorization: Bearer $TOKEN"
```

## Password Hashing

### Algorithm

- **PBKDF2** with SHA256
- **Iterations**: 10,000
- **Salt**: 16 random bytes per password
- **Output**: Base64-encoded salt + hash

### Security Features

- ✅ Slow algorithm (resistant to brute force)
- ✅ Unique salt per password (rainbow table resistant)
- ✅ Industry standard
- ✅ NIST approved

## JWT Token Claims

```json
{
  "sub": "1", // User ID (subject)
  "email": "user@example.com", // User email
  "nameid": "1", // Alternative user ID
  "iss": "ExpenseTrackerAPI", // Token issuer
  "aud": "ExpenseTrackerClient", // Token audience
  "exp": 1711270800, // Expiration (Unix timestamp)
  "iat": 1711267200 // Issued at (Unix timestamp)
}
```

## Token Validation

The server validates:

1. **Signature**: Is token signed with our secret key?
2. **Issuer**: Is this token from "ExpenseTrackerAPI"?
3. **Audience**: Is this token for "ExpenseTrackerClient"?
4. **Expiration**: Is token still valid? (Default: 60 minutes)
5. **Not Before**: Has the token's start time passed?

## Configuration (appsettings.json)

```json
{
  "JwtSettings": {
    "SecretKey": "your-super-secret-key-change-this-in-production...",
    "Issuer": "ExpenseTrackerAPI",
    "Audience": "ExpenseTrackerClient",
    "ExpirationMinutes": 60
  }
}
```

⚠️ **IMPORTANT**: Change `SecretKey` in production!

## Testing with Swagger

1. Open http://localhost:5297/swagger/index.html
2. Scroll to "Auth" section
3. POST /api/auth/register → Try it out → Execute
4. Copy the returned token
5. Click lock icon 🔒 → Paste token in format `Bearer <token>`
6. Now try protected endpoints

## Common Errors

| Error            | Cause                 | Solution                                    |
| ---------------- | --------------------- | ------------------------------------------- |
| 401 Unauthorized | Missing/invalid token | Include valid token in Authorization header |
| 400 Bad Request  | Email already exists  | Use different email on register             |
| 400 Bad Request  | Invalid credentials   | Check email/password on login               |
| 400 Bad Request  | Empty email/password  | Provide both email and password             |
| 500 Server Error | Database issue        | Check database connection                   |

## Code Examples

### Extract User ID from Token

```csharp
[Authorize]
public async Task<IActionResult> GetMyExpenses()
{
    var userIdClaim = User.FindFirst("sub");
    int userId = int.Parse(userIdClaim?.Value ?? "0");

    var expenses = await _context.Expenses
        .Where(e => e.UserId == userId)
        .ToListAsync();

    return Ok(expenses);
}
```

### Add Custom Claims

```csharp
var claims = new[]
{
    new Claim("sub", userId.ToString()),
    new Claim("email", email),
    new Claim("role", "user")  // Add role
};

var token = new JwtSecurityToken(
    issuer: issuer,
    audience: audience,
    claims: claims,
    expires: DateTime.UtcNow.AddMinutes(60),
    signingCredentials: creds
);
```

### Verify Token Manually

```csharp
var tokenHandler = new JwtSecurityTokenHandler();
var principal = tokenHandler.ValidateToken(token, parameters, out _);
var userEmail = principal.FindFirst("email")?.Value;
```

## Production Checklist

- [ ] Change SecretKey to long random string (32+ chars)
- [ ] Move SecretKey to environment variable
- [ ] Set ExpirationMinutes to appropriate value (15-60 min)
- [ ] Enable HTTPS only
- [ ] Implement token refresh mechanism
- [ ] Add rate limiting on auth endpoints
- [ ] Add email verification on register
- [ ] Add password complexity requirements
- [ ] Log all authentication attempts
- [ ] Monitor for suspicious login patterns
- [ ] Implement account lockout after failed attempts
- [ ] Consider 2FA implementation

---

**Created**: March 23, 2026  
**Framework**: ASP.NET Core 8.0  
**Authentication**: JWT Bearer Tokens
