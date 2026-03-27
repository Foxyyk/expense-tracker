using ExpenseTrackerAPI.Models;
using ExpenseTrackerAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTrackerAPI.Services
{
    /// <summary>
    /// Service for managing categories
    /// </summary>
    public interface ICategoryService
    {
        Task<IEnumerable<Category>> GetAllCategoriesAsync();
        Task<Category?> GetCategoryByIdAsync(int id);
        Task<Category> CreateCategoryAsync(Category category);
        Task<bool> UpdateCategoryAsync(int id, Category category);
        Task<bool> DeleteCategoryAsync(int id);
        Task<int> GetCategoryExpenseCountAsync(int categoryId);
        Task<int> GetUserExpenseCountInCategoryAsync(int categoryId, int userId);
    }

    /// <summary>
    /// Implementation of category service with database operations
    /// </summary>
    public class CategoryService : ICategoryService
    {
        private readonly DataContext _context;
        private readonly ILogger<CategoryService> _logger;

        public CategoryService(DataContext context, ILogger<CategoryService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get all categories from the database with expenses included
        /// </summary>
        public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
        {
            return await _context.Categories
                .Include(c => c.Expenses)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        /// <summary>
        /// Get a specific category by ID
        /// </summary>
        public async Task<Category?> GetCategoryByIdAsync(int id)
        {
            return await _context.Categories
                .Include(c => c.Expenses)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        /// <summary>
        /// Create a new category
        /// </summary>
        public async Task<Category> CreateCategoryAsync(Category category)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(category.Name))
                throw new ArgumentException("Category name is required");

            if (category.Name.Length > 100)
                throw new ArgumentException("Category name cannot exceed 100 characters");

            // Check for duplicate
            var exists = await _context.Categories
                .AnyAsync(c => c.Name.ToLower() == category.Name.ToLower());

            if (exists)
                throw new InvalidOperationException($"Category '{category.Name}' already exists");

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Category created: {category.Name} (ID: {category.Id})");
            return category;
        }

        /// <summary>
        /// Update an existing category
        /// </summary>
        public async Task<bool> UpdateCategoryAsync(int id, Category category)
        {
            var existingCategory = await _context.Categories.FindAsync(id);
            if (existingCategory == null)
                return false;

            // Validate input
            if (string.IsNullOrWhiteSpace(category.Name))
                throw new ArgumentException("Category name is required");

            if (category.Name.Length > 100)
                throw new ArgumentException("Category name cannot exceed 100 characters");

            // Check for duplicate (excluding current category)
            var exists = await _context.Categories
                .AnyAsync(c => c.Name.ToLower() == category.Name.ToLower() && c.Id != id);

            if (exists)
                throw new InvalidOperationException($"Category '{category.Name}' already exists");

            existingCategory.Name = category.Name;

            _context.Categories.Update(existingCategory);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Category updated: {existingCategory.Name} (ID: {id})");
            return true;
        }

        /// <summary>
        /// Delete a category (validation should be done by caller)
        /// Automatically deletes all expenses in the category first
        /// </summary>
        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                return false;

            // Delete all expenses associated with this category first (from all users)
            var expensesInCategory = await _context.Expenses
                .Where(e => e.CategoryId == id)
                .ToListAsync();
            
            if (expensesInCategory.Any())
            {
                _context.Expenses.RemoveRange(expensesInCategory);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Deleted {expensesInCategory.Count} expenses before deleting category {id}");
            }

            // Now delete the category
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Category deleted: {category.Name} (ID: {id})");
            return true;
        }

        /// <summary>
        /// Get the count of expenses in a category
        /// </summary>
        public async Task<int> GetCategoryExpenseCountAsync(int categoryId)
        {
            return await _context.Expenses
                .CountAsync(e => e.CategoryId == categoryId);
        }

        /// <summary>
        /// Get the count of expenses for a specific user in a category
        /// </summary>
        public async Task<int> GetUserExpenseCountInCategoryAsync(int categoryId, int userId)
        {
            return await _context.Expenses
                .CountAsync(e => e.CategoryId == categoryId && e.UserId == userId);
        }
    }
}
