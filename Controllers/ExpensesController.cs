using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ExpenseTrackerAPI.Models;
using ExpenseTrackerAPI.Services;
using System.Security.Claims;

namespace ExpenseTrackerAPI.Controllers
{
    /// <summary>
    /// Expenses API Controller
    /// Provides CRUD operations for user expenses with filtering capabilities
    /// All endpoints require JWT authentication
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExpensesController : ControllerBase
    {
        private readonly IExpenseService _expenseService;
        private readonly ILogger<ExpensesController> _logger;

        public ExpensesController(IExpenseService expenseService, ILogger<ExpensesController> logger)
        {
            _expenseService = expenseService;
            _logger = logger;
        }

        /// <summary>
        /// Get current authenticated user's ID from JWT claims
        /// </summary>
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("sub") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            if (int.TryParse(userIdClaim?.Value, out var userId))
                return userId;

            throw new UnauthorizedAccessException("Unable to determine user ID from token");
        }

        /// <summary>
        /// Get all expenses for the authenticated user
        /// Supports filtering by category and date range via query parameters
        /// </summary>
        /// <param name="categoryId">Optional: Filter by category ID</param>
        /// <param name="startDate">Optional: Filter expenses from this date (YYYY-MM-DD)</param>
        /// <param name="endDate">Optional: Filter expenses until this date (YYYY-MM-DD)</param>
        /// <returns>List of expenses for the current user</returns>
        /// <response code="200">Returns list of expenses</response>
        /// <response code="400">Invalid query parameters</response>
        /// <response code="401">Unauthorized - invalid or missing token</response>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<IEnumerable<Expense>>> GetExpenses(
            [FromQuery] int? categoryId = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var userId = GetCurrentUserId();

                // Validate date range
                if (startDate.HasValue && endDate.HasValue && startDate > endDate)
                {
                    return BadRequest(new { error = "startDate must be before or equal to endDate" });
                }

                IEnumerable<Expense> expenses;

                // Use filtered query if any filter is provided
                if (categoryId.HasValue || startDate.HasValue || endDate.HasValue)
                {
                    expenses = await _expenseService.GetUserExpensesFilteredAsync(
                        userId, categoryId, startDate, endDate);
                }
                else
                {
                    // Get all expenses if no filters
                    expenses = await _expenseService.GetUserExpensesAsync(userId);
                }

                _logger.LogInformation($"User {userId} retrieved {expenses.Count()} expenses");
                return Ok(expenses);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt");
                return Unauthorized(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving expenses");
                return StatusCode(500, new { error = "An error occurred while retrieving expenses" });
            }
        }

        /// <summary>
        /// Get a specific expense by ID (must belong to authenticated user)
        /// </summary>
        /// <param name="id">Expense ID</param>
        /// <returns>The expense with matching ID</returns>
        /// <response code="200">Returns the expense</response>
        /// <response code="403">Expense belongs to another user</response>
        /// <response code="404">Expense not found</response>
        /// <response code="401">Unauthorized</response>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Expense>> GetExpense(int id)
        {
            try
            {
                var userId = GetCurrentUserId();

                // Ensure user can only access their own expenses
                var expense = await _expenseService.GetUserExpenseByIdAsync(userId, id);
                if (expense == null)
                {
                    _logger.LogWarning($"User {userId} attempted to access expense {id}");
                    return NotFound(new { error = "Expense not found" });
                }

                _logger.LogInformation($"User {userId} retrieved expense {id}");
                return Ok(expense);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving expense");
                return StatusCode(500, new { error = "An error occurred while retrieving the expense" });
            }
        }

        /// <summary>
        /// Create a new expense for the authenticated user
        /// </summary>
        /// <param name="request">Expense data (Description, Amount, CategoryId, optional Date)</param>
        /// <returns>The created expense with ID</returns>
        /// <response code="201">Expense created successfully</response>
        /// <response code="400">Invalid expense data</response>
        /// <response code="401">Unauthorized</response>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Expense>> CreateExpense([FromBody] CreateExpenseRequest request)
        {
            try
            {
                // Validate request
                if (request == null)
                    return BadRequest(new { error = "Request body is required" });

                if (string.IsNullOrWhiteSpace(request.Description))
                    return BadRequest(new { error = "Description is required" });

                if (request.Amount <= 0)
                    return BadRequest(new { error = "Amount must be greater than 0" });

                if (request.CategoryId <= 0)
                    return BadRequest(new { error = "Valid CategoryId is required" });

                var userId = GetCurrentUserId();

                // Create expense with user ID from JWT
                var expense = new Expense
                {
                    Description = request.Description,
                    Amount = request.Amount,
                    CategoryId = request.CategoryId,
                    UserId = userId,
                    Date = request.Date ?? DateTime.Now
                };

                var createdExpense = await _expenseService.CreateExpenseAsync(expense);
                _logger.LogInformation($"User {userId} created expense {createdExpense.Id}");

                return CreatedAtAction(nameof(GetExpense), 
                    new { id = createdExpense.Id }, 
                    createdExpense);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning($"Invalid expense data: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating expense");
                return StatusCode(500, new { error = "An error occurred while creating the expense" });
            }
        }

        /// <summary>
        /// Update an existing expense (must belong to authenticated user)
        /// </summary>
        /// <param name="id">Expense ID to update</param>
        /// <param name="request">Updated expense data</param>
        /// <response code="204">Expense updated successfully</response>
        /// <response code="400">Invalid expense data</response>
        /// <response code="403">Expense belongs to another user</response>
        /// <response code="404">Expense not found</response>
        /// <response code="401">Unauthorized</response>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UpdateExpense(int id, [FromBody] UpdateExpenseRequest request)
        {
            try
            {
                // Validate request
                if (request == null)
                    return BadRequest(new { error = "Request body is required" });

                if (!string.IsNullOrWhiteSpace(request.Description) && request.Description.Length == 0)
                    return BadRequest(new { error = "Description cannot be empty" });

                if (request.Amount.HasValue && request.Amount <= 0)
                    return BadRequest(new { error = "Amount must be greater than 0" });

                if (request.CategoryId.HasValue && request.CategoryId <= 0)
                    return BadRequest(new { error = "Valid CategoryId is required" });

                var userId = GetCurrentUserId();

                // Verify ownership
                var existingExpense = await _expenseService.GetUserExpenseByIdAsync(userId, id);
                if (existingExpense == null)
                {
                    _logger.LogWarning($"User {userId} attempted to update expense {id}");
                    return NotFound(new { error = "Expense not found" });
                }

                // Update only provided fields
                var expense = new Expense
                {
                    Description = request.Description ?? existingExpense.Description,
                    Amount = request.Amount ?? existingExpense.Amount,
                    CategoryId = request.CategoryId ?? existingExpense.CategoryId,
                    Date = request.Date ?? existingExpense.Date
                };

                var success = await _expenseService.UpdateExpenseAsync(id, expense);
                if (!success)
                    return NotFound(new { error = "Expense not found" });

                _logger.LogInformation($"User {userId} updated expense {id}");
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning($"Invalid update data: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating expense");
                return StatusCode(500, new { error = "An error occurred while updating the expense" });
            }
        }

        /// <summary>
        /// Delete an existing expense (must belong to authenticated user)
        /// </summary>
        /// <param name="id">Expense ID to delete</param>
        /// <response code="204">Expense deleted successfully</response>
        /// <response code="403">Expense belongs to another user</response>
        /// <response code="404">Expense not found</response>
        /// <response code="401">Unauthorized</response>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            try
            {
                var userId = GetCurrentUserId();

                // Verify ownership
                var expense = await _expenseService.GetUserExpenseByIdAsync(userId, id);
                if (expense == null)
                {
                    _logger.LogWarning($"User {userId} attempted to delete expense {id}");
                    return NotFound(new { error = "Expense not found" });
                }

                var success = await _expenseService.DeleteExpenseAsync(id);
                if (!success)
                    return NotFound(new { error = "Expense not found" });

                _logger.LogInformation($"User {userId} deleted expense {id}");
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting expense");
                return StatusCode(500, new { error = "An error occurred while deleting the expense" });
            }
        }

        /// <summary>
        /// Get monthly expense summary for authenticated user
        /// Groups all expenses by month and returns total per month
        /// Useful for generating charts and visualizations
        /// </summary>
        /// <returns>Monthly summary with totals and aggregates</returns>
        /// <response code="200">Returns monthly expense summary</response>
        /// <response code="401">Unauthorized - invalid or missing token</response>
        [HttpGet("summary/monthly")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<MonthlySummaryResponse>> GetMonthlySummary()
        {
            try
            {
                var userId = GetCurrentUserId();

                var summary = await _expenseService.GetMonthlySummaryAsync(userId);

                _logger.LogInformation($"User {userId} retrieved monthly summary with {summary.Months.Count} months");
                return Ok(summary);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt");
                return Unauthorized(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving monthly summary");
                return StatusCode(500, new { error = "An error occurred while retrieving monthly summary" });
            }
        }

        /// <summary>
        /// Export all expenses to CSV file format
        /// Returns a file download with columns: Date, Category, Amount, Description
        /// </summary>
        /// <returns>CSV file for download</returns>
        /// <response code="200">Returns CSV file</response>
        /// <response code="401">Unauthorized - invalid or missing token</response>
        [HttpGet("export/csv")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ExportToCsv()
        {
            try
            {
                var userId = GetCurrentUserId();

                // Generate CSV content
                var csv = await _expenseService.ExportToCsvAsync(userId);

                // Convert to bytes
                var bytes = System.Text.Encoding.UTF8.GetBytes(csv);

                // Generate filename with current date
                var fileName = $"expenses_{DateTime.Now:yyyy-MM-dd_HHmmss}.csv";

                _logger.LogInformation($"User {userId} exported {csv.Split('\n').Length - 1} expenses to CSV");

                // Return file for download
                return File(
                    bytes,
                    "text/csv",
                    fileName
                );
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt");
                return Unauthorized(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting expenses to CSV");
                return StatusCode(500, new { error = "An error occurred while exporting expenses" });
            }
        }
    }
}
