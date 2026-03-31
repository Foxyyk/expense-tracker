# Expense CRUD Operations - Complete Guide

## Overview

The Expense Controller provides comprehensive CRUD (Create, Read, Update, Delete) operations for managing user expenses. All endpoints require JWT authentication and are scoped to the authenticated user's data.

## Architecture

### Security
- ✅ All endpoints require `[Authorize]` attribute
- ✅ User isolation: Each user can only access their own expenses
- ✅ User ID extracted from JWT token claims ("sub")
- ✅ Ownership verification on read, update, delete operations

### Best Practices Implemented
- ✅ Async/await throughout
- ✅ Proper HTTP status codes
- ✅ Comprehensive input validation
- ✅ Error handling with meaningful messages
- ✅ Logging for all operations
- ✅ DTOs for request/response separation
- ✅ XML documentation for Swagger
- ✅ Parameterized queries (SQL injection safe)
- ✅ Immutable Date handling (DateTime.Now is consistent)

## API Endpoints

### 1. GET All Expenses (with Filtering)

**Endpoint:** `GET /api/expenses`

**Authentication:** Required (Bearer token)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| categoryId | int | No | Filter by category ID |
| startDate | DateTime | No | Filter expenses from this date (YYYY-MM-DD format) |
| endDate | DateTime | No | Filter expenses until this date (YYYY-MM-DD format) |

**Success Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": 1,
    "description": "Grocery shopping",
    "amount": 45.50,
    "date": "2026-03-24T10:30:00",
    "categoryId": 1,
    "userId": 1,
    "category": {
      "id": 1,
      "name": "Food"
    },
    "user": {
      "id": 1,
      "email": "user@example.com"
    }
  }
]
```

**Error Responses:**
| Status | Error | Description |
|--------|-------|-------------|
| 400 | Invalid query parameters | startDate > endDate |
| 401 | Unauthorized | Missing or invalid token |
| 500 | Server error | Database connection issue |

**Examples:**

Get all expenses:
```bash
curl -X GET "http://localhost:5297/api/expenses" \
  -H "Authorization: Bearer <token>"
```

Filter by category:
```bash
curl -X GET "http://localhost:5297/api/expenses?categoryId=1" \
  -H "Authorization: Bearer <token>"
```

Filter by date range:
```bash
curl -X GET "http://localhost:5297/api/expenses?startDate=2026-03-01&endDate=2026-03-31" \
  -H "Authorization: Bearer <token>"
```

Filter by category AND date range:
```bash
curl -X GET "http://localhost:5297/api/expenses?categoryId=1&startDate=2026-03-01&endDate=2026-03-31" \
  -H "Authorization: Bearer <token>"
```

---

### 2. GET Single Expense by ID

**Endpoint:** `GET /api/expenses/{id}`

**Authentication:** Required (Bearer token)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | int | Yes | Expense ID |

**Success Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 1,
  "description": "Grocery shopping",
  "amount": 45.50,
  "date": "2026-03-24T10:30:00",
  "categoryId": 1,
  "userId": 1,
  "category": { "id": 1, "name": "Food" },
  "user": { "id": 1, "email": "user@example.com" }
}
```

**Error Responses:**
| Status | Error | Reason |
|--------|-------|--------|
| 404 | Not Found | Expense doesn't exist or belongs to another user |
| 401 | Unauthorized | Missing or invalid token |

**Example:**
```bash
curl -X GET "http://localhost:5297/api/expenses/1" \
  -H "Authorization: Bearer <token>"
```

---

### 3. POST Create New Expense

**Endpoint:** `POST /api/expenses`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "description": "Grocery shopping",
  "amount": 45.50,
  "categoryId": 1,
  "date": "2026-03-24T10:30:00"  // Optional, defaults to current time
}
```

**Request Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| description | string | Yes | Non-empty |
| amount | decimal | Yes | > 0 |
| categoryId | int | Yes | Valid category must exist, > 0 |
| date | DateTime | No | Defaults to DateTime.Now |

**Success Response:**
```http
HTTP/1.1 201 Created
Location: /api/expenses/1
Content-Type: application/json

{
  "id": 1,
  "description": "Grocery shopping",
  "amount": 45.50,
  "date": "2026-03-24T10:30:00",
  "categoryId": 1,
  "userId": 1,
  "category": { "id": 1, "name": "Food" },
  "user": { "id": 1, "email": "user@example.com" }
}
```

**Error Responses:**
| Status | Error | Reason |
|--------|-------|--------|
| 400 | Bad Request | Missing/invalid fields |
| 401 | Unauthorized | Missing or invalid token |
| 500 | Server Error | Database error |

**Example:**
```bash
curl -X POST "http://localhost:5297/api/expenses" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Grocery shopping",
    "amount": 45.50,
    "categoryId": 1
  }'
```

---

### 4. PUT Update Expense

**Endpoint:** `PUT /api/expenses/{id}`

**Authentication:** Required (Bearer token)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | int | Yes | Expense ID to update |

**Request Body (all fields optional):**
```json
{
  "description": "Updated grocery shopping",
  "amount": 50.75,
  "categoryId": 2,
  "date": "2026-03-25T14:00:00"
}
```

**Request Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| description | string | No | If provided, non-empty |
| amount | decimal | No | If provided, > 0 |
| categoryId | int | No | If provided, valid category, > 0 |
| date | DateTime | No | Any valid date |

**Update Logic:**
- Only provided fields are updated
- Null/missing fields keep existing values
- Partial updates supported

**Success Response:**
```http
HTTP/1.1 204 No Content
```

**Error Responses:**
| Status | Error | Reason |
|--------|-------|--------|
| 400 | Bad Request | Invalid field values |
| 404 | Not Found | Expense not found or belongs to another user |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Expense belongs to another user |
| 500 | Server Error | Database error |

**Examples:**

Update single field:
```bash
curl -X PUT "http://localhost:5297/api/expenses/1" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.75
  }'
```

Update multiple fields:
```bash
curl -X PUT "http://localhost:5297/api/expenses/1" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated grocery shopping",
    "amount": 50.75,
    "categoryId": 2
  }'
```

---

### 5. DELETE Expense

**Endpoint:** `DELETE /api/expenses/{id}`

**Authentication:** Required (Bearer token)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | int | Yes | Expense ID to delete |

**Success Response:**
```http
HTTP/1.1 204 No Content
```

**Error Responses:**
| Status | Error | Reason |
|--------|-------|--------|
| 404 | Not Found | Expense not found or belongs to another user |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Expense belongs to another user |
| 500 | Server Error | Database error |

**Example:**
```bash
curl -X DELETE "http://localhost:5297/api/expenses/1" \
  -H "Authorization: Bearer <token>"
```

---

## Models & DTOs

### CreateExpenseRequest
```csharp
public class CreateExpenseRequest
{
    public string Description { get; set; }        // Required
    public decimal Amount { get; set; }            // Required, > 0
    public int CategoryId { get; set; }            // Required
    public DateTime? Date { get; set; }            // Optional
}
```

### UpdateExpenseRequest
```csharp
public class UpdateExpenseRequest
{
    public string? Description { get; set; }       // Optional
    public decimal? Amount { get; set; }           // Optional, > 0 if provided
    public int? CategoryId { get; set; }           // Optional
    public DateTime? Date { get; set; }            // Optional
}
```

### Expense Model
```csharp
public class Expense
{
    public int Id { get; set; }
    public string Description { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public int CategoryId { get; set; }
    public int UserId { get; set; }
    
    // Navigation properties
    public Category Category { get; set; }
    public User User { get; set; }
}
```

---

## Filtering & Query Logic

### Category Filtering
```
GET /api/expenses?categoryId=1
```
- Filters expenses by category ID
- Combines with date range if both provided

### Date Range Filtering
```
GET /api/expenses?startDate=2026-03-01&endDate=2026-03-31
```
- Includes entire end date (up to 23:59:59)
- Validation: startDate must be ≤ endDate

### Combined Filtering
```
GET /api/expenses?categoryId=1&startDate=2026-03-01&endDate=2026-03-31
```
- Combines all filters with AND logic
- All filters are optional

### Sorting
- Results automatically sorted by Date (descending - most recent first)

---

## Service Layer

### IExpenseService Methods

#### GetUserExpensesAsync(int userId)
```csharp
// Get all expenses for a user
var expenses = await _expenseService.GetUserExpensesAsync(userId);
```

#### GetUserExpensesByCategoryAsync(int userId, int categoryId)
```csharp
// Get expenses in specific category
var expenses = await _expenseService.GetUserExpensesByCategoryAsync(userId, 1);
```

#### GetUserExpensesByDateRangeAsync(int userId, DateTime startDate, DateTime endDate)
```csharp
// Get expenses within date range
var expenses = await _expenseService.GetUserExpensesByDateRangeAsync(
    userId, 
    new DateTime(2026, 3, 1), 
    new DateTime(2026, 3, 31)
);
```

#### GetUserExpensesFilteredAsync(int userId, int? categoryId, DateTime? startDate, DateTime? endDate)
```csharp
// Get expenses with any combination of filters
var expenses = await _expenseService.GetUserExpensesFilteredAsync(
    userId, 
    categoryId: 1, 
    startDate: new DateTime(2026, 3, 1), 
    endDate: new DateTime(2026, 3, 31)
);
```

#### GetUserExpenseByIdAsync(int userId, int expenseId)
```csharp
// Verify user owns this expense (security check)
var expense = await _expenseService.GetUserExpenseByIdAsync(userId, expenseId);
```

#### CreateExpenseAsync(Expense expense)
```csharp
// Create new expense with validation
var expense = new Expense 
{ 
    UserId = userId,
    CategoryId = 1,
    Amount = 45.50m,
    Description = "Groceries"
};
var created = await _expenseService.CreateExpenseAsync(expense);
```

#### UpdateExpenseAsync(int id, Expense expense)
```csharp
// Update expense
var success = await _expenseService.UpdateExpenseAsync(id, updatedExpense);
```

#### DeleteExpenseAsync(int id)
```csharp
// Delete expense
var success = await _expenseService.DeleteExpenseAsync(id);
```

---

## Error Handling

### Validation Errors (400 Bad Request)
- Empty description
- Amount ≤ 0
- Invalid categoryId
- startDate > endDate
- Null/empty request body

### Authorization Errors (401 Unauthorized)
- Missing Authorization header
- Invalid/expired JWT token
- Malformed token

### Forbidden Errors (403 Forbidden)
- User attempts to access another user's expense

### Not Found Errors (404 Not Found)
- Expense ID doesn't exist
- Expense belongs to another user (security returns 404, not 403)

### Server Errors (500 Internal Server Error)
- Database connection failed
- Unexpected exceptions

---

## Logging

All operations are logged with appropriate levels:

```csharp
_logger.LogInformation($"User {userId} retrieved {expenses.Count()} expenses");
_logger.LogInformation($"User {userId} created expense {id}");
_logger.LogInformation($"User {userId} updated expense {id}");
_logger.LogInformation($"User {userId} deleted expense {id}");
_logger.LogWarning($"User {userId} attempted to access expense {id}");
_logger.LogError(ex, "Error retrieving expenses");
```

---

## Code Examples

### JavaScript/Fetch
```javascript
// Get all expenses
const response = await fetch('http://localhost:5297/api/expenses', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});
const expenses = await response.json();

// Create expense
const newExpense = await fetch('http://localhost:5297/api/expenses', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        description: 'Grocery shopping',
        amount: 45.50,
        categoryId: 1
    })
});
const created = await newExpense.json();

// Update expense
await fetch('http://localhost:5297/api/expenses/1', {
    method: 'PUT',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        amount: 50.75
    })
});

// Delete expense
await fetch('http://localhost:5297/api/expenses/1', {
    method: 'DELETE',
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

### C# HttpClient
```csharp
var client = new HttpClient();
client.DefaultRequestHeaders.Authorization = 
    new AuthenticationHeaderValue("Bearer", token);

// Get expenses
var response = await client.GetAsync("http://localhost:5297/api/expenses");
var json = await response.Content.ReadAsStringAsync();
var expenses = JsonSerializer.Deserialize<List<Expense>>(json);

// Create expense
var request = new CreateExpenseRequest 
{ 
    Description = "Groceries",
    Amount = 45.50m,
    CategoryId = 1
};
var content = new StringContent(
    JsonSerializer.Serialize(request),
    Encoding.UTF8,
    "application/json"
);
var response = await client.PostAsync("http://localhost:5297/api/expenses", content);
```

---

## Testing in Swagger UI

1. **Get Token** (see JWT documentation)
2. **Authorize** (click lock icon, paste Bearer token)
3. **Test Endpoints:**
   - Try GET all expenses
   - Try GET with filters
   - Try POST to create
   - Try PUT to update
   - Try DELETE to remove

---

## Performance Considerations

### Query Optimization
- ✅ Indexed on UserId, CategoryId (foreign keys)
- ✅ Uses Include() for eager loading relationships
- ✅ Single query per operation (no N+1)

### Scalability
- ✅ Pagination: Can be added to GetUserExpensesAsync()
- ✅ Caching: Results can be cached with category/date keys
- ✅ Async/await: Non-blocking I/O

### Database Schema
```sql
CREATE INDEX IX_Expenses_UserId ON Expenses(UserId)
CREATE INDEX IX_Expenses_CategoryId ON Expenses(CategoryId)
```

---

## Security Review

✅ **Authentication**: JWT token required on all endpoints
✅ **Authorization**: User isolation enforced in queries
✅ **Input Validation**: All inputs validated before use
✅ **SQL Injection**: Entity Framework parameterized queries
✅ **User Enumeration**: 404 returned for both "not found" and "not owned"
✅ **Data Exposure**: Only own data returned, never cross-user data
✅ **Logging**: Suspicious activities logged

---

## Future Enhancements

### Pagination
```csharp
public async Task<PaginatedResponse<Expense>> GetUserExpensesPaginatedAsync(
    int userId, int pageNumber, int pageSize) { }
```

### Sorting
```csharp
public async Task<IEnumerable<Expense>> GetUserExpensesSortedAsync(
    int userId, string orderBy = "date-desc") { }
```

### Advanced Filtering
```csharp
public async Task<IEnumerable<Expense>> SearchExpensesAsync(
    int userId, string searchText) { }
```

### Statistics
```csharp
public async Task<ExpenseStatistics> GetUserStatisticsAsync(int userId) { }
```

### Bulk Operations
```csharp
public async Task<int> DeleteExpensesByDateRangeAsync(
    int userId, DateTime startDate, DateTime endDate) { }
```

---

**Last Updated**: March 24, 2026  
**Framework**: ASP.NET Core 8.0  
**Database**: SQLite with Entity Framework Core  
**Authentication**: JWT Bearer Tokens
