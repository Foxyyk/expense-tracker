# JWT Authentication - Code Reference

## 1. AuthService.cs (Password Hashing & JWT Generation)

```csharp
public interface IAuthService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
    string GenerateJwtToken(int userId, string email);
}

public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;

    // Hash password using PBKDF2
    public string HashPassword(string password)
    {
        using (var sha256 = SHA256.Create())
        {
            // Generate random salt (16 bytes)
            var saltBytes = new byte[16];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(saltBytes);
            }

            // PBKDF2: 10,000 iterations with SHA256
            var pbkdf2 = new Rfc2898DeriveBytes(
                password, saltBytes, 10000, HashAlgorithmName.SHA256);
            var hash = pbkdf2.GetBytes(20);

            // Combine salt + hash for storage
            var hashBytes = new byte[36];
            Array.Copy(saltBytes, 0, hashBytes, 0, 16);
            Array.Copy(hash, 0, hashBytes, 16, 20);

            return Convert.ToBase64String(hashBytes);
        }
    }

    // Verify password against stored hash
    public bool VerifyPassword(string password, string hash)
    {
        try
        {
            var hashBytes = Convert.FromBase64String(hash);
            var saltBytes = new byte[16];
            Array.Copy(hashBytes, 0, saltBytes, 0, 16);

            var pbkdf2 = new Rfc2898DeriveBytes(
                password, saltBytes, 10000, HashAlgorithmName.SHA256);
            var hash2 = pbkdf2.GetBytes(20);

            // Compare computed hash with stored hash
            for (int i = 0; i < 20; i++)
                if (hashBytes[i + 16] != hash2[i])
                    return false;

            return true;
        }
        catch { return false; }
    }

    // Generate JWT token with user claims
    public string GenerateJwtToken(int userId, string email)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"];
        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];
        var expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"] ?? "60");

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(secretKey!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("sub", userId.ToString()),
            new Claim("email", email),
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: creds
        );

        var tokenHandler = new JwtSecurityTokenHandler();
        return tokenHandler.WriteToken(token);
    }
}
```

## 2. AuthController.cs (Register & Login Endpoints)

```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly DataContext _context;
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    // POST /api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new AuthResponse
            {
                Success = false,
                Message = "Email and password are required"
            });
        }

        // Check if user already exists
        var existingUser = _context.Users
            .FirstOrDefault(u => u.Email == request.Email);
        if (existingUser != null)
        {
            return BadRequest(new AuthResponse
            {
                Success = false,
                Message = "User with this email already exists"
            });
        }

        // Create new user with hashed password
        var user = new User
        {
            Email = request.Email,
            PasswordHash = _authService.HashPassword(request.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Generate JWT token
        var token = _authService.GenerateJwtToken(user.Id, user.Email);

        return Ok(new AuthResponse
        {
            Success = true,
            Message = "User registered successfully",
            Token = token,
            User = new UserDto { Id = user.Id, Email = user.Email }
        });
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new AuthResponse
            {
                Success = false,
                Message = "Email and password are required"
            });
        }

        // Find user by email
        var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
        if (user == null ||
            !_authService.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized(new AuthResponse
            {
                Success = false,
                Message = "Invalid email or password"
            });
        }

        // Generate JWT token
        var token = _authService.GenerateJwtToken(user.Id, user.Email);

        return Ok(new AuthResponse
        {
            Success = true,
            Message = "Login successful",
            Token = token,
            User = new UserDto { Id = user.Id, Email = user.Email }
        });
    }
}
```

## 3. Model Classes

### RegisterRequest.cs

```csharp
public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
```

### LoginRequest.cs

```csharp
public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
```

### AuthResponse.cs

```csharp
public class AuthResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Token { get; set; }
    public UserDto? User { get; set; }
}

public class UserDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
}
```

## 4. Program.cs Configuration

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
var connectionString = builder.Configuration
    .GetConnectionString("DefaultConnection") ?? "Data Source=expensetracker.db";
builder.Services.AddDbContext<DataContext>(options =>
    options.UseSqlite(connectionString));

// JWT Configuration
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];
var issuer = jwtSettings["Issuer"];
var audience = jwtSettings["Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
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
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(secretKey!))
    };
});

// Services
builder.Services.AddScoped<IExpenseService, ExpenseService>();
builder.Services.AddScoped<IAuthService, AuthService>();

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();  // ← Important: Must be before Authorization
app.UseAuthorization();

app.MapControllers();
app.Run();
```

## 5. Protected Controller Example

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]  // ← This makes ALL endpoints require authentication
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    // All endpoints below are now protected

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Expense>>> GetExpenses()
    {
        return Ok(await _expenseService.GetAllExpensesAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Expense>> GetExpense(int id)
    {
        var expense = await _expenseService.GetExpenseByIdAsync(id);
        if (expense == null)
            return NotFound();
        return Ok(expense);
    }

    [HttpPost]
    public async Task<ActionResult<Expense>> CreateExpense(
        [FromBody] Expense expense)
    {
        var created = await _expenseService.CreateExpenseAsync(expense);
        return CreatedAtAction(nameof(GetExpense),
            new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateExpense(int id,
        [FromBody] Expense expense)
    {
        await _expenseService.UpdateExpenseAsync(id, expense);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpense(int id)
    {
        await _expenseService.DeleteExpenseAsync(id);
        return NoContent();
    }
}
```

## 6. appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=expensetracker.db"
  },
  "JwtSettings": {
    "SecretKey": "your-super-secret-key-change-this-in-production-minimum-32-characters-long!",
    "Issuer": "ExpenseTrackerAPI",
    "Audience": "ExpenseTrackerClient",
    "ExpirationMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

## 7. Using Authentication in Controllers

### Get Current User ID

```csharp
[Authorize]
public async Task<IActionResult> GetMyProfile()
{
    var userIdClaim = User.FindFirst("sub");
    int userId = int.Parse(userIdClaim?.Value ?? "0");

    var user = await _context.Users.FindAsync(userId);
    return Ok(user);
}
```

### Get Current User Email

```csharp
[Authorize]
public IActionResult GetMyEmail()
{
    var emailClaim = User.FindFirst("email");
    string email = emailClaim?.Value ?? "unknown";
    return Ok(new { email });
}
```

### Check Claims

```csharp
[Authorize]
public IActionResult CheckClaims()
{
    var claims = User.Claims.Select(c => new
    {
        c.Type,
        c.Value
    });
    return Ok(claims);
}
```

## 8. Custom Authorization with Roles

### Add Role Claim (in GenerateJwtToken)

```csharp
var claims = new[]
{
    new Claim("sub", userId.ToString()),
    new Claim("email", email),
    new Claim(ClaimTypes.Role, "admin")  // Add role
};
```

### Protect Endpoint by Role

```csharp
[Authorize(Roles = "admin")]
public async Task<IActionResult> DeleteUser(int userId)
{
    // Only users with "admin" role can delete
    return Ok();
}
```

---

**Reference**: ASP.NET Core 8.0 | JWT RFC 7519 | PBKDF2 Hashing
