namespace ExpenseTrackerAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }

        // Navigation property
        public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    }
}
