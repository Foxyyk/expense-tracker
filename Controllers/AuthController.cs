using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ExpenseTrackerAPI.Data;
using ExpenseTrackerAPI.Models;
using ExpenseTrackerAPI.Services;
using System.Security.Claims;

namespace ExpenseTrackerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(DataContext context, IAuthService authService, ILogger<AuthController> logger)
        {
            _context = context;
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// Get current user's ID from JWT claims
        /// </summary>
        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim != null && int.TryParse(claim.Value, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("User ID not found in token");
        }

        /// <summary>
        /// Register a new user
        /// </summary>
        /// <param name="request">Email and Password</param>
        /// <returns>User info and JWT token on success</returns>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "Email and password are required"
                    });
                }

                // Check if user already exists
                var existingUser = _context.Users.FirstOrDefault(u => u.Email == request.Email);
                if (existingUser != null)
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "User with this email already exists"
                    });
                }

                // Create new user with hashed password and profile data
                var user = new User
                {
                    Email = request.Email,
                    PasswordHash = _authService.HashPassword(request.Password),
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Phone = request.Phone
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Generate JWT token
                var token = _authService.GenerateJwtToken(user.Id, user.Email);

                _logger.LogInformation($"User registered successfully: {request.Email}");

                return Ok(new AuthResponse
                {
                    Success = true,
                    Message = "User registered successfully",
                    Token = token,
                    User = new UserDto 
                    { 
                        Id = user.Id, 
                        Email = user.Email,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        Phone = user.Phone
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Registration error: {ex.Message}");
                return StatusCode(500, new AuthResponse
                {
                    Success = false,
                    Message = "An error occurred during registration"
                });
            }
        }

        /// <summary>
        /// Login with email and password
        /// </summary>
        /// <param name="request">Email and Password</param>
        /// <returns>JWT token on successful login</returns>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "Email and password are required"
                    });
                }

                // Find user by email
                var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
                if (user == null || !_authService.VerifyPassword(request.Password, user.PasswordHash))
                {
                    return Unauthorized(new AuthResponse
                    {
                        Success = false,
                        Message = "Invalid email or password"
                    });
                }

                // Generate JWT token
                var token = _authService.GenerateJwtToken(user.Id, user.Email);

                _logger.LogInformation($"User logged in successfully: {request.Email}");

                return Ok(new AuthResponse
                {
                    Success = true,
                    Message = "Login successful",
                    Token = token,
                    User = new UserDto 
                    { 
                        Id = user.Id, 
                        Email = user.Email,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        Phone = user.Phone
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Login error: {ex.Message}");
                return StatusCode(500, new AuthResponse
                {
                    Success = false,
                    Message = "An error occurred during login"
                });
            }
        }

        /// <summary>
        /// Get current user's profile
        /// </summary>
        /// <returns>User profile information</returns>
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                int userId = GetCurrentUserId();
                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                {
                    return NotFound(new AuthResponse
                    {
                        Success = false,
                        Message = "User not found"
                    });
                }

                var userDto = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email ?? string.Empty,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Phone = user.Phone
                };

                return Ok(userDto);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new AuthResponse
                {
                    Success = false,
                    Message = "Unauthorized"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Get profile error: {ex.Message}");
                return StatusCode(500, new AuthResponse
                {
                    Success = false,
                    Message = "An error occurred while fetching profile"
                });
            }
        }

        /// <summary>
        /// Update current user's profile
        /// </summary>
        /// <param name="request">Updated profile information</param>
        /// <returns>Updated user profile</returns>
        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            try
            {
                int userId = GetCurrentUserId();
                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                {
                    return NotFound(new AuthResponse
                    {
                        Success = false,
                        Message = "User not found"
                    });
                }

                // Check if new email is already taken by another user
                if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != user.Email)
                {
                    var existingUser = _context.Users.FirstOrDefault(u => u.Email == request.Email);
                    if (existingUser != null)
                    {
                        return BadRequest(new AuthResponse
                        {
                            Success = false,
                            Message = "Email is already in use"
                        });
                    }
                    user.Email = request.Email;
                }

                // Update profile fields
                if (!string.IsNullOrWhiteSpace(request.FirstName))
                    user.FirstName = request.FirstName;
                if (!string.IsNullOrWhiteSpace(request.LastName))
                    user.LastName = request.LastName;
                if (!string.IsNullOrWhiteSpace(request.Phone))
                    user.Phone = request.Phone;

                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                var userDto = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email ?? string.Empty,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Phone = user.Phone
                };

                _logger.LogInformation($"User profile updated: {user.Email}");

                return Ok(userDto);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new AuthResponse
                {
                    Success = false,
                    Message = "Unauthorized"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Update profile error: {ex.Message}");
                return StatusCode(500, new AuthResponse
                {
                    Success = false,
                    Message = "An error occurred while updating profile"
                });
            }
        }

        /// <summary>
        /// Change user password
        /// </summary>
        /// <param name="request">Current and new password</param>
        /// <returns>Success response</returns>
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "Current password and new password are required"
                    });
                }

                if (request.NewPassword.Length < 6)
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "New password must be at least 6 characters long"
                    });
                }

                int userId = GetCurrentUserId();
                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                {
                    return NotFound(new AuthResponse
                    {
                        Success = false,
                        Message = "User not found"
                    });
                }

                // Verify current password
                if (!_authService.VerifyPassword(request.CurrentPassword, user.PasswordHash))
                {
                    return Unauthorized(new AuthResponse
                    {
                        Success = false,
                        Message = "Current password is incorrect"
                    });
                }

                // Update password
                user.PasswordHash = _authService.HashPassword(request.NewPassword);
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"User password changed: {user.Email}");

                return Ok(new AuthResponse
                {
                    Success = true,
                    Message = "Password changed successfully"
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new AuthResponse
                {
                    Success = false,
                    Message = "Unauthorized"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Change password error: {ex.Message}");
                return StatusCode(500, new AuthResponse
                {
                    Success = false,
                    Message = "An error occurred while changing password"
                });
            }
        }

        /// <summary>
        /// Delete user account
        /// </summary>
        /// <param name="request">User password for confirmation</param>
        /// <returns>Success response</returns>
        [HttpDelete("account")]
        [Authorize]
        public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "Password is required to delete account"
                    });
                }

                int userId = GetCurrentUserId();
                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                {
                    return NotFound(new AuthResponse
                    {
                        Success = false,
                        Message = "User not found"
                    });
                }

                // Verify password
                if (!_authService.VerifyPassword(request.Password, user.PasswordHash))
                {
                    return Unauthorized(new AuthResponse
                    {
                        Success = false,
                        Message = "Password is incorrect"
                    });
                }

                // Delete user (cascade will delete associated expenses)
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"User account deleted: {user.Email}");

                return Ok(new AuthResponse
                {
                    Success = true,
                    Message = "Account deleted successfully"
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new AuthResponse
                {
                    Success = false,
                    Message = "Unauthorized"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Delete account error: {ex.Message}");
                return StatusCode(500, new AuthResponse
                {
                    Success = false,
                    Message = "An error occurred while deleting account"
                });
            }
        }
    }
}
