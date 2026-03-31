namespace ExpenseTrackerAPI.Models
{
    /// <summary>
    /// Request body for updating user profile
    /// </summary>
    public class UpdateProfileRequest
    {
        public string? Email { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? ProfileImageUrl { get; set; }
    }

    /// <summary>
    /// Request body for changing password
    /// </summary>
    public class ChangePasswordRequest
    {
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; }
    }

    /// <summary>
    /// Request body for deleting account
    /// </summary>
    public class DeleteAccountRequest
    {
        public string? Password { get; set; }
    }

    /// <summary>
    /// Generic API response wrapper
    /// </summary>
    public class ApiResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public object? Data { get; set; }
    }
}
