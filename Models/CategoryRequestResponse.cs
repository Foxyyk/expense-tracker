namespace ExpenseTrackerAPI.Models
{
    /// <summary>
    /// DTO for creating a new category
    /// </summary>
    public class CreateCategoryRequest
    {
        /// <summary>
        /// Category name (required, max 100 characters)
        /// </summary>
        public string Name { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for updating a category
    /// </summary>
    public class UpdateCategoryRequest
    {
        /// <summary>
        /// Updated category name (optional)
        /// </summary>
        public string? Name { get; set; }
    }

    /// <summary>
    /// DTO for category response with metadata
    /// </summary>
    public class CategoryResponse
    {
        /// <summary>
        /// Category ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Category name
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Number of expenses in this category
        /// </summary>
        public int ExpenseCount { get; set; }
    }

    /// <summary>
    /// DTO for category with full details
    /// </summary>
    public class CategoryDetailResponse
    {
        /// <summary>
        /// Category ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Category name
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Expenses in this category
        /// </summary>
        public ICollection<Expense> Expenses { get; set; } = new List<Expense>();

        /// <summary>
        /// Total amount spent in this category
        /// </summary>
        public decimal TotalAmount { get; set; }
    }
}
