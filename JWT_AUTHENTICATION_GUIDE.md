# JWT Authentication Implementation Guide

## Overview

This guide explains how JWT (JSON Web Tokens) authentication has been integrated into your ASP.NET Core Web API. JWT authentication provides secure, token-based access to protected endpoints.

## 1. What is JWT Authentication?

JWT is a stateless authentication mechanism where:

- **User logs in** with credentials (email + password)
- **Server validates** credentials and generates a unique token
- **Client stores** the token and includes it in request headers
- **Server validates** token signature on each request
- **No session storage** needed on server (stateless)

### JWT Token Structure

```
Header.Payload.Signature
```

- **Header**: Token type and hashing algorithm
- **Payload**: User claims (userId, email, expiration)
- **Signature**: Cryptographic signature to verify token hasn't been tampered with

## 2. Authentication Flow

### Registration Flow

```
1. Client POST /api/auth/register with email + password
2. Server checks if user exists
3. Server hashes password using PBKDF2
4. Server creates user record in database
5. Server generates JWT token
6. Server returns token + user info to client
7. Client stores token locally (localStorage, sessionStorage, cookie)
```

### Login Flow

```
1. Client POST /api/auth/login with email + password
2. Server finds user by email
3. Server verifies password against stored hash
4. If valid: Server generates new JWT token
5. If invalid: Server returns 401 Unauthorized
6. Client stores returned token
```

### Protected Request Flow

```
1. Client makes request to protected endpoint (e.g., GET /api/expenses)
2. Client includes token in Authorization header: "Bearer <token>"
3. Server extracts token from header
4. Server validates token signature (is it signed by us?)
5. Server validates token expiration (is it still valid?)
6. Server validates issuer and audience claims
7. If all valid: Request proceeds, else returns 401 Unauthorized
```

## 3. Implementation Details

### Packages Installed

```
Microsoft.AspNetCore.Authentication.JwtBearer (8.0.0)
System.IdentityModel.Tokens.Jwt (7.0.3)
```

### Key Files Created/Modified

#### Models

- **RegisterRequest.cs**: Email and password for registration
- **LoginRequest.cs**: Email and password for login
- **AuthResponse.cs**: Success flag, message, JWT token, user info
- **User.cs** (modified): Now stores PasswordHash instead of plain password

#### Services

- **AuthService.cs**:
  - `HashPassword()`: Hashes password using PBKDF2 (10,000 iterations)
  - `VerifyPassword()`: Compares entered password against stored hash
  - `GenerateJwtToken()`: Creates JWT token with claims

#### Controllers

- **AuthController.cs**:
  - `POST /api/auth/register`: Create new user account
  - `POST /api/auth/login`: Authenticate user and return token
- **ExpensesController.cs** (modified): Added `[Authorize]` attribute to require authentication

#### Configuration

- **Program.cs** (modified):
  - Added JWT authentication scheme configuration
  - Added JWT validation parameters
  - Registered AuthService in DI container
  - Added `app.UseAuthentication()` middleware

- **appsettings.json** (modified):
  - Added JwtSettings section with SecretKey, Issuer, Audience, ExpirationMinutes

## 4. Password Security

### Hashing Algorithm: PBKDF2

```
PBKDF2 (Password-Based Key Derivation Function 2)
- Iterations: 10,000
- Algorithm: SHA256
- Salt: 16 random bytes per password
```

**Why PBKDF2?**

- Slow by design (slows down brute-force attacks)
- Industry standard with proven security
- Simple and reliable

**Password Flow:**

```
Plain Password → PBKDF2 with random salt → Hashed Password + Salt
```

When verifying:

```
Entered Password + Stored Salt → PBKDF2 → Compare with stored hash
```

## 5. JWT Token Structure in Your App

### Token Claims

```json
{
  "sub": "1", // User ID
  "email": "user@example.com", // User email
  "nameid": "1", // Another user ID claim
  "iss": "ExpenseTrackerAPI", // Issuer
  "aud": "ExpenseTrackerClient", // Audience
  "exp": 1711270800, // Expiration timestamp
  "iat": 1711267200 // Issued at timestamp
}
```

### Token Expiration

- **Default**: 60 minutes (configurable in appsettings.json)
- **After expiration**: Token rejected, user must login again
- **Advantage**: Even if token stolen, attacker has limited time access

## 6. Usage Examples

### Register New User

```bash
POST http://localhost:5297/api/auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com"
  }
}
```

### Login

```bash
POST http://localhost:5297/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com"
  }
}
```

**Response (Invalid Password):**

```json
{
  "success": false,
  "message": "Invalid email or password",
  "token": null,
  "user": null
}
```

### Access Protected Endpoint

```bash
GET http://localhost:5297/api/expenses
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Response: List of expenses (if token valid)
```

**Without token (401 Unauthorized):**

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.3.5",
  "title": "Unauthorized",
  "status": 401,
  "traceId": "..."
}
```

## 7. How to Test in Swagger UI

1. **Register a user:**
   - Click "Try it out" on POST /api/auth/register
   - Enter email and password
   - Execute
   - Copy the returned JWT token

2. **Login:**
   - Click "Try it out" on POST /api/auth/login
   - Enter same email and password
   - Execute
   - Copy the JWT token

3. **Access protected endpoint:**
   - Click the lock icon (🔒) on any protected endpoint
   - Paste the JWT token from login
   - Click "Try it out" and execute
   - Now you can access the endpoint

**Alternative - Manual Authorization:**

- Click "Authorize" button at top of Swagger UI
- In the "Value" field, paste: `Bearer YOUR_JWT_TOKEN_HERE`
- Click "Authorize"
- Now all authenticated endpoints will use this token

## 8. Configuration Settings

### appsettings.json JWT Settings

```json
{
  "JwtSettings": {
    "SecretKey": "your-super-secret-key-change-this-in-production-minimum-32-characters-long!",
    "Issuer": "ExpenseTrackerAPI",
    "Audience": "ExpenseTrackerClient",
    "ExpirationMinutes": 60
  }
}
```

**IMPORTANT: Production Considerations**

- **SecretKey**: Change this! Use a long, random string (32+ characters)
- **ExpirationMinutes**: Adjust based on your security needs
- **Use environment variables**: Store secret in env variables, not config file
- **HTTPS only**: Always use HTTPS in production

### Program.cs Configuration

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };
    });
```

## 9. Security Best Practices

### Do's ✅

- ✅ Use HTTPS always (especially in production)
- ✅ Store tokens securely on client (httpOnly cookies recommended)
- ✅ Use strong secret keys (32+ random characters)
- ✅ Implement token refresh mechanism for long-lived sessions
- ✅ Validate token expiration
- ✅ Use reasonable token expiration times (30-60 minutes)
- ✅ Log authentication attempts
- ✅ Implement rate limiting on login endpoint

### Don'ts ❌

- ❌ Store tokens in localStorage (vulnerable to XSS)
- ❌ Hardcode secrets in code
- ❌ Use weak passwords
- ❌ Disable token expiration
- ❌ Store plain passwords in database
- ❌ Trust tokens without validation

## 10. Extending Authentication

### Adding Claims

```csharp
var claims = new[]
{
    new Claim("sub", userId.ToString()),
    new Claim("email", email),
    new Claim("role", "admin"),           // Add role
    new Claim("department", "finance")    // Add custom claim
};
```

### Role-Based Authorization

```csharp
[Authorize(Roles = "Admin")]
public async Task<IActionResult> DeleteExpense(int id)
{
    // Only admin users can delete
}
```

### Custom Authorization Policies

```csharp
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("PremiumUser", policy =>
        policy.RequireClaim("membership", "premium"));

[Authorize(Policy = "PremiumUser")]
public async Task<IActionResult> GetPremiumAnalytics()
{
    // Only premium users
}
```

## 11. Troubleshooting

### "Unauthorized" error on protected endpoints

- ✅ Ensure token is included in Authorization header
- ✅ Token format should be: `Bearer eyJ...`
- ✅ Check if token has expired
- ✅ Verify SecretKey matches between registration and validation

### "Invalid token" error

- ✅ Check token wasn't modified
- ✅ Verify Issuer and Audience match configuration
- ✅ Ensure token wasn't corrupted during transmission

### "User already exists" on register

- ✅ Use different email address
- ✅ Or delete user from database and retry

## 12. Next Steps

1. **Refresh Tokens**: Implement refresh token mechanism for better UX
2. **Email Verification**: Add email confirmation on registration
3. **Password Reset**: Implement forgot password flow
4. **Two-Factor Authentication**: Add 2FA for enhanced security
5. **OAuth Integration**: Add Google/GitHub login
6. **Audit Logging**: Log all authentication events
7. **Rate Limiting**: Prevent brute force attacks on login

---

**Last Updated**: March 23, 2026
**ASP.NET Core Version**: 8.0
**JWT Standard**: RFC 7519
