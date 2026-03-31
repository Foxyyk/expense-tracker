namespace ExpenseTrackerAPI.Models
{
    /// <summary>
    /// DTO for creating a new expense
    /// </summary>
    public class CreateExpenseRequest
    {
        /// <summary>
        /// Expense description (optional)
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Expense amount in currency (required, must be > 0)
        /// </summary>
        public decimal Amount { get; set; }

        /// <summary>
        /// Category ID (required, must be valid)
        /// </summary>
        public int CategoryId { get; set; }

        /// <summary>
        /// Expense date (optional, defaults to current date/time)
        /// </summary>
        public DateTime? Date { get; set; }
    }

    /// <summary>
    /// DTO for updating an expense (all fields are optional)
    /// </summary>
    public class UpdateExpenseRequest
    {
        /// <summary>
        /// Updated description (optional)
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Updated amount (optional, must be > 0 if provided)
        /// </summary>
        public decimal? Amount { get; set; }

        /// <summary>
        /// Updated category ID (optional, must be valid if provided)
        /// </summary>
        public int? CategoryId { get; set; }

        /// <summary>
        /// Updated date (optional)
        /// </summary>
        public DateTime? Date { get; set; }
    }

    /// <summary>
    /// DTO for expense filter response metadata
    /// </summary>
    public class ExpenseFilterResponse
    {
        /// <summary>
        /// Total count of expenses matching filters
        /// </summary>
        public int TotalCount { get; set; }

        /// <summary>
        /// Sum of all amounts matching filters
        /// </summary>
        public decimal TotalAmount { get; set; }

        /// <summary>
        /// The expenses
        /// </summary>
        public IEnumerable<Expense> Expenses { get; set; } = new List<Expense>();
    }

    /// <summary>
    /// DTO for monthly expense summary (single month)
    /// </summary>
    public class MonthlySummary
    {
        /// <summary>
        /// Year of the month (e.g., 2024)
        /// </summary>
        public int Year { get; set; }

        /// <summary>
        /// Month number (1-12)
        /// </summary>
        public int Month { get; set; }

        /// <summary>
        /// Month name (e.g., "January")
        /// </summary>
        public string MonthName { get; set; } = string.Empty;

        /// <summary>
        /// Total amount spent in this month
        /// </summary>
        public decimal Total { get; set; }

        /// <summary>
        /// Number of expenses in this month
        /// </summary>
        public int ExpenseCount { get; set; }
    }

    /// <summary>
    /// DTO for monthly expense summary response (multiple months)
    /// </summary>
    public class MonthlySummaryResponse
    {
        /// <summary>
        /// List of monthly summaries
        /// </summary>
        public List<MonthlySummary> Months { get; set; } = new List<MonthlySummary>();

        /// <summary>
        /// Grand total across all months
        /// </summary>
        public decimal GrandTotal { get; set; }

        /// <summary>
        /// Average monthly spend
        /// </summary>
        public decimal AverageMonthly { get; set; }
    }

    /// <summary>
    /// DTO for category expense summary (single category)
    /// </summary>
    public class CategorySummary
    {
        /// <summary>
        /// Category ID
        /// </summary>
        public int CategoryId { get; set; }

        /// <summary>
        /// Category name
        /// </summary>
        public string CategoryName { get; set; } = string.Empty;

        /// <summary>
        /// Total amount spent in this category
        /// </summary>
        public decimal Total { get; set; }

        /// <summary>
        /// Number of expenses in this category
        /// </summary>
        public int ExpenseCount { get; set; }

        /// <summary>
        /// Percentage of total spending
        /// </summary>
        public decimal Percentage { get; set; }
    }

    /// <summary>
    /// DTO for category expense summary response (multiple categories)
    /// </summary>
    public class CategorySummaryResponse
    {
        /// <summary>
        /// List of category summaries
        /// </summary>
        public List<CategorySummary> Categories { get; set; } = new List<CategorySummary>();

        /// <summary>
        /// Grand total across all categories
        /// </summary>
        public decimal GrandTotal { get; set; }
    }
}
