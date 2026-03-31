using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ExpenseTrackerAPI.Models;
using ExpenseTrackerAPI.Services;
using ExpenseTrackerAPI.Data;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTrackerAPI.Controllers
{
    /// <summary>
    /// Categories API Controller
    /// Provides operations for managing expense categories
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly ILogger<CategoriesController> _logger;
        private readonly DataContext _context;

        public CategoriesController(ICategoryService categoryService, ILogger<CategoriesController> logger, DataContext context)
        {
            _categoryService = categoryService;
            _logger = logger;
            _context = context;
        }

        /// <summary>
        /// Get current authenticated user's ID from JWT claims
        /// </summary>
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("sub") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                _logger.LogError("No user ID claim found in token. Available claims: " + string.Join(", ", User.Claims.Select(c => c.Type)));
                throw new UnauthorizedAccessException("No user ID claim found in token");
            }

            if (int.TryParse(userIdClaim.Value, out var userId))
                return userId;

            _logger.LogError($"Could not parse user ID from claim value: {userIdClaim.Value}");
            throw new UnauthorizedAccessException("Invalid user ID in token");
        }

        /// <summary>
        /// Get all available expense categories with totals for current user
        /// Filters expenses by authenticated user to show accurate category totals
        /// </summary>
        /// <returns>List of all categories with user's expense counts and total amounts</returns>
        /// <response code="200">Returns list of categories with totals for current user</response>
        /// <response code="401">Unauthorized - requires authentication</response>
        /// <response code="500">Server error</response>
        [HttpGet]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<CategoryResponse>>> GetCategories()
        {
            try
            {
                var userId = GetCurrentUserId();
                var categories = await _categoryService.GetAllCategoriesAsync();
                
                // Map to response DTOs with expense counts and total amounts
                // Filter expenses to only include current user's expenses
                var response = categories.Select(c => new CategoryResponse
                {
                    Id = c.Id,
                    Name = c.Name ?? string.Empty,
                    ExpenseCount = c.Expenses.Count(e => e.UserId == userId),  // ✅ Filter by UserId
                    TotalAmount = c.Expenses.Where(e => e.UserId == userId).Sum(e => e.Amount)  // ✅ Filter by UserId
                }).ToList();

                _logger.LogInformation($"Retrieved {response.Count} categories with totals for user {userId}");
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access to categories");
                return Unauthorized(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories");
                return StatusCode(500, new { error = "An error occurred while retrieving categories" });
            }
        }

        /// <summary>
        /// Get a specific category by ID with all associated expenses for current user
        /// No authentication required - categories are shared, but expenses are filtered by user
        /// </summary>
        /// <param name="id">Category ID</param>
        /// <returns>Category details with current user's expenses and total amount</returns>
        /// <response code="200">Returns the category</response>
        /// <response code="401">Unauthorized - requires authentication</response>
        /// <response code="404">Category not found</response>
        /// <response code="500">Server error</response>
        [HttpGet("{id}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CategoryDetailResponse>> GetCategory(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var category = await _categoryService.GetCategoryByIdAsync(id);
                if (category == null)
                {
                    _logger.LogWarning($"Category {id} not found");
                    return NotFound(new { error = "Category not found" });
                }

                // Filter expenses to only include current user's expenses
                var userExpenses = category.Expenses.Where(e => e.UserId == userId).ToList();  // ✅ Filter by UserId
                
                var response = new CategoryDetailResponse
                {
                    Id = category.Id,
                    Name = category.Name ?? string.Empty,
                    Expenses = userExpenses,  // ✅ Only include current user's expenses
                    TotalAmount = userExpenses.Sum(e => e.Amount)  // ✅ Sum only current user's expenses
                };

                _logger.LogInformation($"Retrieved category {id} with {userExpenses.Count} expenses for user {userId}");
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access to category");
                return Unauthorized(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving category");
                return StatusCode(500, new { error = "An error occurred while retrieving the category" });
            }
        }

        /// <summary>
        /// Create a new expense category
        /// Requires authentication (admin or elevated permissions recommended)
        /// </summary>
        /// <param name="request">Category data</param>
        /// <returns>The created category</returns>
        /// <response code="201">Category created successfully</response>
        /// <response code="400">Invalid category data or duplicate name</response>
        /// <response code="401">Unauthorized - requires authentication</response>
        /// <response code="500">Server error</response>
        [HttpPost]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CategoryResponse>> CreateCategory([FromBody] CreateCategoryRequest request)
        {
            try
            {
                // Validate request
                if (request == null)
                    return BadRequest(new { error = "Request body is required" });

                if (string.IsNullOrWhiteSpace(request.Name))
                    return BadRequest(new { error = "Category name is required" });

                if (request.Name.Length > 100)
                    return BadRequest(new { error = "Category name cannot exceed 100 characters" });

                // Create category
                var category = new Category { Name = request.Name.Trim() };
                var created = await _categoryService.CreateCategoryAsync(category);

                var response = new CategoryResponse
                {
                    Id = created.Id,
                    Name = created.Name ?? string.Empty,
                    ExpenseCount = 0,
                    TotalAmount = 0m
                };

                _logger.LogInformation($"Category created: {created.Name}");
                return CreatedAtAction(nameof(GetCategory), new { id = created.Id }, response);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning($"Invalid category data: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"Category creation failed: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category");
                return StatusCode(500, new { error = "An error occurred while creating the category" });
            }
        }

        /// <summary>
        /// Update an existing category
        /// Requires authentication (admin or elevated permissions recommended)
        /// </summary>
        /// <param name="id">Category ID to update</param>
        /// <param name="request">Updated category data</param>
        /// <response code="204">Category updated successfully</response>
        /// <response code="400">Invalid category data or duplicate name</response>
        /// <response code="401">Unauthorized - requires authentication</response>
        /// <response code="404">Category not found</response>
        /// <response code="500">Server error</response>
        [HttpPut("{id}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryRequest request)
        {
            try
            {
                // Validate request
                if (request == null)
                    return BadRequest(new { error = "Request body is required" });

                if (string.IsNullOrWhiteSpace(request.Name))
                    return BadRequest(new { error = "Category name is required" });

                if (request.Name.Length > 100)
                    return BadRequest(new { error = "Category name cannot exceed 100 characters" });

                // Update category
                var category = new Category { Name = request.Name.Trim() };
                var success = await _categoryService.UpdateCategoryAsync(id, category);

                if (!success)
                {
                    _logger.LogWarning($"Category {id} not found for update");
                    return NotFound(new { error = "Category not found" });
                }

                _logger.LogInformation($"Category {id} updated");
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning($"Invalid update data: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"Category update failed: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating category");
                return StatusCode(500, new { error = "An error occurred while updating the category" });
            }
        }

        /// <summary>
        /// Delete an expense category
        /// Requires authentication
        /// If category has user expenses, returns 409 Conflict (use force=true to confirm deletion)
        /// </summary>
        /// <param name="id">Category ID to delete</param>
        /// <param name="force">Set to true to delete category even with user expenses</param>
        /// <response code="204">Category deleted successfully</response>
        /// <response code="400">Invalid request</response>
        /// <response code="401">Unauthorized - requires authentication</response>
        /// <response code="404">Category not found</response>
        /// <response code="409">Category has user expenses (confirm with force=true)</response>
        /// <response code="500">Server error</response>
        [HttpDelete("{id}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteCategory(int id, [FromQuery] bool force = false)
        {
            try
            {
                _logger.LogInformation($"Attempting to delete category {id} (force={force})");
                
                var userId = GetCurrentUserId();
                _logger.LogInformation($"User {userId} attempting to delete category {id}");
                
                // Check category exists
                var categoryExists = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Id == id);
                
                if (categoryExists == null)
                {
                    _logger.LogWarning($"Category {id} not found for deletion");
                    return NotFound(new { error = "Category not found" });
                }

                _logger.LogInformation($"Category {id} found: {categoryExists.Name}");
                
                // Check if user has expenses in this category
                var userExpenseCount = await _categoryService.GetUserExpenseCountInCategoryAsync(id, userId);
                
                _logger.LogInformation($"User {userId} has {userExpenseCount} expenses in category {id}");
                
                // If user has expenses and not forced, ask for confirmation
                if (userExpenseCount > 0 && !force)
                {
                    var message = $"Category '{categoryExists.Name}' contains {userExpenseCount} of your expense(s). Confirm deletion to remove category.";
                    _logger.LogWarning($"User {userId} attempted to delete category with expenses without confirmation: {message}");
                    return Conflict(new { 
                        error = message,
                        hasUserExpenses = true,
                        expenseCount = userExpenseCount,
                        categoryName = categoryExists.Name
                    });
                }

                // Delete the category
                _logger.LogInformation($"Deleting category {id}...");
                var success = await _categoryService.DeleteCategoryAsync(id);
                
                if (!success)
                {
                    _logger.LogWarning($"Category {id} not found for deletion (after check)");
                    return NotFound(new { error = "Category not found" });
                }

                _logger.LogInformation($"Category {id} deleted successfully by user {userId} (force={force})");
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempted");
                return Unauthorized(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting category {id}");
                return StatusCode(500, new { error = "An error occurred while deleting the category" });
            }
        }
    }
}
