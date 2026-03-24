using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ExpenseTrackerAPI.Models;
using ExpenseTrackerAPI.Services;

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

        public CategoriesController(ICategoryService categoryService, ILogger<CategoriesController> logger)
        {
            _categoryService = categoryService;
            _logger = logger;
        }

        /// <summary>
        /// Get all available expense categories
        /// No authentication required - categories are shared resources
        /// </summary>
        /// <returns>List of all categories</returns>
        /// <response code="200">Returns list of categories</response>
        /// <response code="500">Server error</response>
        [HttpGet]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<CategoryResponse>>> GetCategories()
        {
            try
            {
                var categories = await _categoryService.GetAllCategoriesAsync();
                
                // Map to response DTOs with expense counts
                var response = categories.Select(c => new CategoryResponse
                {
                    Id = c.Id,
                    Name = c.Name ?? string.Empty,
                    ExpenseCount = c.Expenses.Count
                }).ToList();

                _logger.LogInformation($"Retrieved {response.Count} categories");
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories");
                return StatusCode(500, new { error = "An error occurred while retrieving categories" });
            }
        }

        /// <summary>
        /// Get a specific category by ID with all associated expenses
        /// No authentication required - categories are shared resources
        /// </summary>
        /// <param name="id">Category ID</param>
        /// <returns>Category details with expenses and total amount</returns>
        /// <response code="200">Returns the category</response>
        /// <response code="404">Category not found</response>
        /// <response code="500">Server error</response>
        [HttpGet("{id}")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CategoryDetailResponse>> GetCategory(int id)
        {
            try
            {
                var category = await _categoryService.GetCategoryByIdAsync(id);
                if (category == null)
                {
                    _logger.LogWarning($"Category {id} not found");
                    return NotFound(new { error = "Category not found" });
                }

                var response = new CategoryDetailResponse
                {
                    Id = category.Id,
                    Name = category.Name ?? string.Empty,
                    Expenses = category.Expenses,
                    TotalAmount = category.Expenses.Sum(e => e.Amount)
                };

                _logger.LogInformation($"Retrieved category {id}");
                return Ok(response);
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
                    ExpenseCount = 0
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
        /// Requires authentication (admin or elevated permissions recommended)
        /// Cannot delete categories that have associated expenses
        /// </summary>
        /// <param name="id">Category ID to delete</param>
        /// <response code="204">Category deleted successfully</response>
        /// <response code="400">Category has associated expenses</response>
        /// <response code="401">Unauthorized - requires authentication</response>
        /// <response code="404">Category not found</response>
        /// <response code="500">Server error</response>
        [HttpDelete("{id}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                var success = await _categoryService.DeleteCategoryAsync(id);

                if (!success)
                {
                    _logger.LogWarning($"Category {id} not found for deletion");
                    return NotFound(new { error = "Category not found" });
                }

                _logger.LogInformation($"Category {id} deleted");
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"Cannot delete category: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting category");
                return StatusCode(500, new { error = "An error occurred while deleting the category" });
            }
        }
    }
}
