namespace ExpenseTrackerAPI.DTOs
{
    /// <summary>
    /// User Data Transfer Object
    /// Contains user profile information (excluding sensitive data like password hash)
    /// </summary>
    public class UserDto
    {
        public int Id { get; set; }
        public string? Email { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
    }
}
