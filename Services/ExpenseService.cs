using ExpenseTrackerAPI.Models;
using ExpenseTrackerAPI.Data;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace ExpenseTrackerAPI.Services
{
    public interface IExpenseService
    {
        Task<IEnumerable<Expense>> GetUserExpensesAsync(int userId);
        Task<IEnumerable<Expense>> GetUserExpensesByCategoryAsync(int userId, int categoryId);
        Task<IEnumerable<Expense>> GetUserExpensesByDateRangeAsync(int userId, DateTime startDate, DateTime endDate);
        Task<IEnumerable<Expense>> GetUserExpensesFilteredAsync(int userId, int? categoryId = null, DateTime? startDate = null, DateTime? endDate = null);
        Task<Expense?> GetExpenseByIdAsync(int id);
        Task<Expense?> GetUserExpenseByIdAsync(int userId, int expenseId);
        Task<Expense> CreateExpenseAsync(Expense expense);
        Task<bool> UpdateExpenseAsync(int id, Expense expense);
        Task<bool> DeleteExpenseAsync(int id);
        Task<MonthlySummaryResponse> GetMonthlySummaryAsync(int userId);
        Task<CategorySummaryResponse> GetCategorySummaryAsync(int userId);
        Task<string> ExportToCsvAsync(int userId);
        // Legacy methods (deprecated - use filtered versions instead)
        Task<IEnumerable<Expense>> GetAllExpensesAsync();
    }

    public class ExpenseService : IExpenseService
    {
        private readonly DataContext _context;

        public ExpenseService(DataContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all expenses for a specific user
        /// </summary>
        public async Task<IEnumerable<Expense>> GetUserExpensesAsync(int userId)
        {
            return await _context.Expenses
                .AsNoTracking()
                .Where(e => e.UserId == userId)
                .Include(e => e.Category)
                .OrderByDescending(e => e.Date)
                .ToListAsync();
        }

        /// <summary>
        /// Get expenses for a user filtered by category
        /// </summary>
        public async Task<IEnumerable<Expense>> GetUserExpensesByCategoryAsync(int userId, int categoryId)
        {
            return await _context.Expenses
                .AsNoTracking()
                .Where(e => e.UserId == userId && e.CategoryId == categoryId)
                .Include(e => e.Category)
                .OrderByDescending(e => e.Date)
                .ToListAsync();
        }

        /// <summary>
        /// Get expenses for a user within a date range
        /// </summary>
        public async Task<IEnumerable<Expense>> GetUserExpensesByDateRangeAsync(int userId, DateTime startDate, DateTime endDate)
        {
            // Ensure endDate includes the entire day
            var adjustedEndDate = endDate.AddDays(1).AddTicks(-1);

            return await _context.Expenses
                .AsNoTracking()
                .Where(e => e.UserId == userId && 
                           e.Date >= startDate && 
                           e.Date <= adjustedEndDate)
                .Include(e => e.Category)
                .OrderByDescending(e => e.Date)
                .ToListAsync();
        }

        /// <summary>
        /// Get expenses with flexible filtering (category and/or date range)
        /// </summary>
        public async Task<IEnumerable<Expense>> GetUserExpensesFilteredAsync(
            int userId, 
            int? categoryId = null, 
            DateTime? startDate = null, 
            DateTime? endDate = null)
        {
            var query = _context.Expenses
                .AsNoTracking()
                .Where(e => e.UserId == userId)
                .Include(e => e.Category)
                .AsQueryable();

            // Filter by category if provided
            if (categoryId.HasValue && categoryId.Value > 0)
            {
                query = query.Where(e => e.CategoryId == categoryId.Value);
            }

            // Filter by date range if provided
            if (startDate.HasValue)
            {
                query = query.Where(e => e.Date >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                // Include entire end date
                var adjustedEndDate = endDate.Value.AddDays(1).AddTicks(-1);
                query = query.Where(e => e.Date <= adjustedEndDate);
            }

            return await query
                .OrderByDescending(e => e.Date)
                .ToListAsync();
        }

        /// <summary>
        /// Get all expenses (no filtering - legacy method, avoid in new code)
        /// </summary>
        public async Task<IEnumerable<Expense>> GetAllExpensesAsync()
        {
            return await _context.Expenses
                .AsNoTracking()
                .Include(e => e.Category)
                .ToListAsync();
        }

        /// <summary>
        /// Get expense by ID (any user can access)
        /// </summary>
        public async Task<Expense?> GetExpenseByIdAsync(int id)
        {
            return await _context.Expenses
                .AsNoTracking()
                .Include(e => e.Category)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        /// <summary>
        /// Get expense by ID for specific user (security check)
        /// </summary>
        public async Task<Expense?> GetUserExpenseByIdAsync(int userId, int expenseId)
        {
            return await _context.Expenses
                .AsNoTracking()
                .Include(e => e.Category)
                .FirstOrDefaultAsync(e => e.Id == expenseId && e.UserId == userId);
        }

        /// <summary>
        /// Create new expense with automatic date and user ID
        /// </summary>
        public async Task<Expense> CreateExpenseAsync(Expense expense)
        {
            // Validate required fields
            if (expense.UserId <= 0)
                throw new ArgumentException("UserId is required");
            if (expense.CategoryId <= 0)
                throw new ArgumentException("CategoryId is required");
            if (expense.Amount <= 0)
                throw new ArgumentException("Amount must be greater than 0");

            // Set date to now if not provided
            if (expense.Date == default)
                expense.Date = DateTime.Now;

            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();
            return expense;
        }

        /// <summary>
        /// Update existing expense
        /// </summary>
        public async Task<bool> UpdateExpenseAsync(int id, Expense expense)
        {
            var existingExpense = await _context.Expenses.FindAsync(id);
            if (existingExpense == null)
                return false;

            // Validate update data
            if (expense.CategoryId <= 0)
                throw new ArgumentException("CategoryId is required");
            if (expense.Amount <= 0)
                throw new ArgumentException("Amount must be greater than 0");

            // Update only modifiable fields
            existingExpense.Description = expense.Description ?? existingExpense.Description;
            existingExpense.Amount = expense.Amount;
            existingExpense.CategoryId = expense.CategoryId;
            existingExpense.Date = expense.Date != default ? expense.Date : existingExpense.Date;

            _context.Expenses.Update(existingExpense);
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Delete expense by ID
        /// </summary>
        public async Task<bool> DeleteExpenseAsync(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
                return false;

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Get monthly expense summary for a user (groups expenses by year-month)
        /// </summary>
        public async Task<MonthlySummaryResponse> GetMonthlySummaryAsync(int userId)
        {
            // Get all user expenses
            var expenses = await _context.Expenses
                .Where(e => e.UserId == userId)
                .OrderBy(e => e.Date)
                .ToListAsync();

            // Group by year and month
            var monthlyGroups = expenses
                .GroupBy(e => new { e.Date.Year, e.Date.Month })
                .OrderByDescending(g => g.Key.Year)
                .ThenByDescending(g => g.Key.Month)
                .Select(g => new MonthlySummary
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    MonthName = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMMM"),
                    Total = g.Sum(e => e.Amount),
                    ExpenseCount = g.Count()
                })
                .ToList();

            // Calculate aggregates
            decimal grandTotal = monthlyGroups.Sum(m => m.Total);
            decimal averageMonthly = monthlyGroups.Any() ? grandTotal / monthlyGroups.Count : 0;

            return new MonthlySummaryResponse
            {
                Months = monthlyGroups,
                GrandTotal = grandTotal,
                AverageMonthly = averageMonthly
            };
        }

        /// <summary>
        /// Get category expense summary for a user (groups expenses by category)
        /// </summary>
        public async Task<CategorySummaryResponse> GetCategorySummaryAsync(int userId)
        {
            // Get all user expenses
            var expenses = await _context.Expenses
                .AsNoTracking()
                .Where(e => e.UserId == userId)
                .Include(e => e.Category)
                .ToListAsync();

            // Group by category
            var categoryGroups = expenses
                .GroupBy(e => new { e.CategoryId, e.Category.Name })
                .Select(g => new { g.Key.CategoryId, g.Key.Name, Total = g.Sum(e => e.Amount), Count = g.Count() })
                .ToList();

            // Calculate grand total
            decimal grandTotal = categoryGroups.Sum(c => c.Total);

            // Build category summaries with percentages
            var categorySummaries = categoryGroups
                .OrderByDescending(c => c.Total)
                .Select(c => new CategorySummary
                {
                    CategoryId = c.CategoryId,
                    CategoryName = c.Name ?? "Uncategorized",
                    Total = c.Total,
                    ExpenseCount = c.Count,
                    Percentage = grandTotal > 0 ? Math.Round((c.Total / grandTotal) * 100, 2) : 0
                })
                .ToList();

            return new CategorySummaryResponse
            {
                Categories = categorySummaries,
                GrandTotal = grandTotal
            };
        }

        /// <summary>
        /// Export user expenses to CSV format
        /// Row format: Date,Category,Amount,Description
        /// </summary>
        public async Task<string> ExportToCsvAsync(int userId)
        {
            // Get all user expenses with category info
            var expenses = await _context.Expenses
                .AsNoTracking()
                .Where(e => e.UserId == userId)
                .Include(e => e.Category)
                .OrderByDescending(e => e.Date)
                .ToListAsync();

            // Build CSV with header
            var csv = new StringBuilder();
            csv.AppendLine("Date,Category,Amount,Description");

            // Add each expense as a row
            foreach (var expense in expenses)
            {
                // CSV format: escape quotes and handle commas in fields
                var date = expense.Date.ToString("yyyy-MM-dd");
                var category = EscapeCsvField(expense.Category?.Name ?? "Uncategorized");
                var amount = expense.Amount.ToString("F2");
                var description = EscapeCsvField(expense.Description ?? "");

                csv.AppendLine($"{date},{category},{amount},{description}");
            }

            return csv.ToString();
        }

        /// <summary>
        /// Escape CSV field: wrap in quotes if contains comma, quote, or newline
        /// </summary>
        private static string EscapeCsvField(string? field)
        {
            if (string.IsNullOrEmpty(field))
                return "\"\"";

            // If field contains comma, quote, or newline, wrap in quotes and escape inner quotes
            if (field.Contains(',') || field.Contains('"') || field.Contains('\n'))
            {
                return $"\"{field.Replace("\"", "\"\"")}\"";
            }

            return field;
        }
    }
}
