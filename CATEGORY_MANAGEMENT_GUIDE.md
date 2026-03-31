# Category Management - Complete Guide

## Overview

The Category Controller provides comprehensive management of expense categories. Categories are the classification system for organizing expenses (Food, Transport, Entertainment, etc.).

## Database Relationships

### Entity Relationship Diagram

```
┌─────────────┐         1:N        ┌──────────────┐
│    User     │◄─────────────────►│   Expense    │
│  (Accounts) │                   │ (Transactions)│
└─────────────┘                   └──────────────┘
      │                                  │
      │ 1:N                              │
      │                                  │
      │                            ┌─────▼──────┐
      │                            │  Category  │
      │                            │(Classification)│
      └────────────────────────────┘                │
                                    1:N
```

### Relationships Explained

#### 1. User ↔ Expense (One-to-Many)
- **One User** can have **Many Expenses**
- **Delete Behavior**: Cascade
- **Meaning**: When a user is deleted, ALL their expenses are deleted

```csharp
// User.cs
public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();

// Expense.cs
public int UserId { get; set; }
public virtual User User { get; set; }
```

**Database Schema:**
```sql
CREATE TABLE Expenses (
    UserId INTEGER NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);
```

#### 2. Category ↔ Expense (One-to-Many)
- **One Category** can have **Many Expenses**
- **Delete Behavior**: Restrict
- **Meaning**: Cannot delete a category that has expenses

```csharp
// Category.cs
public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();

// Expense.cs
public int CategoryId { get; set; }
public virtual Category Category { get; set; }
```

**Database Schema:**
```sql
CREATE TABLE Expenses (
    CategoryId INTEGER NOT NULL,
    FOREIGN KEY (CategoryId) REFERENCES Categories(Id) ON DELETE RESTRICT
);
```

### Data Flow Example

```
Step 1: User Registers
┌─────────────────┐
│ User (ID: 1)    │
│ alice@gmail.com │
└─────────────────┘
           │
           └─ Linked to default Categories:
              ├─ Food (ID: 1)
              ├─ Transport (ID: 2)
              ├─ Entertainment (ID: 3)
              ├─ Utilities (ID: 4)
              └─ Other (ID: 5)

Step 2: User Creates Expense
       ┌──────────────────────────────────┐
       │ Expense                          │
       │ Description: "Grocery shopping"  │
       │ Amount: $45.50                   │
       │ CategoryId: 1 (Food)             │
       │ UserId: 1 (alice)                │
       └──────────────────────────────────┘
              │
              ├─ Links to User (1)
              └─ Links to Category (1)

Step 3: Query User's Food Expenses
       User (1) → Expenses → Filter by CategoryId=1 → 1 result
                  (all alice's expenses)  (only Food category)
```

## API Endpoints

### 1. GET All Categories

**Endpoint:** `GET /api/categories`

**Authentication:** Not required (public endpoint)

**Query Parameters:** None

**Success Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": 1,
    "name": "Food",
    "expenseCount": 15
  },
  {
    "id": 2,
    "name": "Transport",
    "expenseCount": 8
  },
  {
    "id": 3,
    "name": "Entertainment",
    "expenseCount": 5
  },
  {
    "id": 4,
    "name": "Utilities",
    "expenseCount": 12
  },
  {
    "id": 5,
    "name": "Other",
    "expenseCount": 3
  }
]
```

**Error Responses:**
| Status | Error | Description |
|--------|-------|-------------|
| 500 | Server Error | Database connection failed |

**Example:**
```bash
curl -X GET "http://localhost:5297/api/categories"
```

---

### 2. GET Category by ID

**Endpoint:** `GET /api/categories/{id}`

**Authentication:** Not required (public endpoint)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | int | Yes | Category ID |

**Success Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 1,
  "name": "Food",
  "expenses": [
    {
      "id": 1,
      "description": "Grocery shopping",
      "amount": 45.50,
      "date": "2026-03-24T10:30:00",
      "categoryId": 1,
      "userId": 1,
      "category": { "id": 1, "name": "Food" },
      "user": { "id": 1, "email": "user@example.com" }
    },
    {
      "id": 2,
      "description": "Restaurant",
      "amount": 32.75,
      "date": "2026-03-23T18:45:00",
      "categoryId": 1,
      "userId": 1,
      "category": { "id": 1, "name": "Food" },
      "user": { "id": 1, "email": "user@example.com" }
    }
  ],
  "totalAmount": 78.25
}
```

**Error Responses:**
| Status | Error | Description |
|--------|-------|-------------|
| 404 | Not Found | Category doesn't exist |
| 500 | Server Error | Database error |

**Example:**
```bash
curl -X GET "http://localhost:5297/api/categories/1"
```

---

### 3. POST Create Category

**Endpoint:** `POST /api/categories`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "name": "Shopping"
}
```

**Request Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| name | string | Yes | Non-empty, max 100 chars, unique |

**Success Response:**
```http
HTTP/1.1 201 Created
Location: /api/categories/6
Content-Type: application/json

{
  "id": 6,
  "name": "Shopping",
  "expenseCount": 0
}
```

**Error Responses:**
| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Empty name or name too long |
| 400 | Bad Request | Category name already exists |
| 401 | Unauthorized | Missing or invalid token |
| 500 | Server Error | Database error |

**Example:**
```bash
curl -X POST "http://localhost:5297/api/categories" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Shopping"}'
```

---

### 4. PUT Update Category

**Endpoint:** `PUT /api/categories/{id}`

**Authentication:** Required (Bearer token)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | int | Yes | Category ID to update |

**Request Body:**
```json
{
  "name": "Groceries"
}
```

**Request Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| name | string | Yes | Non-empty, max 100 chars, unique |

**Success Response:**
```http
HTTP/1.1 204 No Content
```

**Error Responses:**
| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid name or duplicate |
| 401 | Unauthorized | Missing or invalid token |
| 404 | Not Found | Category not found |
| 500 | Server Error | Database error |

**Example:**
```bash
curl -X PUT "http://localhost:5297/api/categories/1" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Groceries"}'
```

---

### 5. DELETE Category

**Endpoint:** `DELETE /api/categories/{id}`

**Authentication:** Required (Bearer token)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | int | Yes | Category ID to delete |

**Success Response:**
```http
HTTP/1.1 204 No Content
```

**Error Responses:**
| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Category has associated expenses |
| 401 | Unauthorized | Missing or invalid token |
| 404 | Not Found | Category not found |
| 500 | Server Error | Database error |

**Example:**
```bash
curl -X DELETE "http://localhost:5297/api/categories/6" \
  -H "Authorization: Bearer <token>"
```

---

## Response Models

### CategoryResponse
```csharp
public class CategoryResponse
{
    public int Id { get; set; }           // Category ID
    public string Name { get; set; }      // Category name
    public int ExpenseCount { get; set; } // Count of expenses in this category
}
```

### CategoryDetailResponse
```csharp
public class CategoryDetailResponse
{
    public int Id { get; set; }                      // Category ID
    public string Name { get; set; }                 // Category name
    public ICollection<Expense> Expenses { get; set; } // All expenses in category
    public decimal TotalAmount { get; set; }         // Total amount spent
}
```

### CreateCategoryRequest
```csharp
public class CreateCategoryRequest
{
    public string Name { get; set; } // Required category name
}
```

### UpdateCategoryRequest
```csharp
public class UpdateCategoryRequest
{
    public string? Name { get; set; } // Optional updated name
}
```

## Service Methods

### ICategoryService Interface

```csharp
public interface ICategoryService
{
    // Get all categories
    Task<IEnumerable<Category>> GetAllCategoriesAsync();
    
    // Get single category with expenses
    Task<Category?> GetCategoryByIdAsync(int id);
    
    // Create new category
    Task<Category> CreateCategoryAsync(Category category);
    
    // Update existing category
    Task<bool> UpdateCategoryAsync(int id, Category category);
    
    // Delete category (if no expenses)
    Task<bool> DeleteCategoryAsync(int id);
    
    // Get expense count in category
    Task<int> GetCategoryExpenseCountAsync(int categoryId);
}
```

### Usage Examples

```csharp
// Get all categories
var categories = await _categoryService.GetAllCategoriesAsync();
// Returns: [Food, Transport, Entertainment, Utilities, Other]

// Get category with expenses
var category = await _categoryService.GetCategoryByIdAsync(1);
// Returns: Food category with all 15 food expenses

// Create category
var newCategory = new Category { Name = "Shopping" };
var created = await _categoryService.CreateCategoryAsync(newCategory);
// Returns: Category with generated ID 6

// Update category
var updated = new Category { Name = "Groceries" };
var success = await _categoryService.UpdateCategoryAsync(1, updated);
// Returns: true if updated

// Delete category
var deleted = await _categoryService.DeleteCategoryAsync(6);
// Returns: true if deleted, throws exception if has expenses

// Get expense count
var count = await _categoryService.GetCategoryExpenseCountAsync(1);
// Returns: 15
```

## Linking Categories with Expenses

### How to Use in ExpensesController

```csharp
[HttpPost]
public async Task<ActionResult<Expense>> CreateExpense(
    [FromBody] CreateExpenseRequest request)
{
    try
    {
        var userId = GetCurrentUserId();

        // Validate category exists
        var category = await _categoryService.GetCategoryByIdAsync(request.CategoryId);
        if (category == null)
            return BadRequest(new { error = "Category not found" });

        // Create expense with category link
        var expense = new Expense
        {
            Description = request.Description,
            Amount = request.Amount,
            CategoryId = request.CategoryId,  // ← Link to category
            UserId = userId,
            Date = request.Date ?? DateTime.Now
        };

        var createdExpense = await _expenseService.CreateExpenseAsync(expense);
        return CreatedAtAction(nameof(GetExpense), 
            new { id = createdExpense.Id }, createdExpense);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error creating expense");
        return StatusCode(500, new { error = "An error occurred" });
    }
}
```

### Querying Expenses by Category

```csharp
// Get all expenses in Food category
GET /api/expenses?categoryId=1

// Response includes all expenses linked to category 1
[
  { id: 1, description: "Grocery", amount: 45.50, categoryId: 1, ... },
  { id: 2, description: "Restaurant", amount: 32.75, categoryId: 1, ... }
]
```

## Relationship Constraints

### Cascade Delete (User → Expense)

**Behavior:** When a user is deleted, all their expenses are deleted

```sql
FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
```

**Example:**
```
DELETE FROM Users WHERE Id = 1
-- Result: All expenses with UserId=1 are also deleted
-- Categories remain intact
```

### Restrict Delete (Category → Expense)

**Behavior:** Cannot delete a category if it has expenses

```sql
FOREIGN KEY (CategoryId) REFERENCES Categories(Id) ON DELETE RESTRICT
```

**Example:**
```
DELETE FROM Categories WHERE Id = 1
-- If any expenses have CategoryId=1, this DELETE fails with:
-- "FOREIGN KEY constraint failed"
-- Result: Category not deleted, expenses remain unchanged
```

**In Code:**
```csharp
public async Task<bool> DeleteCategoryAsync(int id)
{
    var category = await _context.Categories
        .Include(c => c.Expenses)
        .FirstOrDefaultAsync(c => c.Id == id);

    if (category == null)
        return false;

    // Check for associated expenses
    if (category.Expenses.Any())
        throw new InvalidOperationException(
            $"Cannot delete category '{category.Name}' " +
            $"because it has {category.Expenses.Count} associated expenses");

    _context.Categories.Remove(category);
    await _context.SaveChangesAsync();
    return true;
}
```

## Database Schema

### Categories Table
```sql
CREATE TABLE Categories (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL UNIQUE,
    CONSTRAINT MAX_LENGTH CHECK (LENGTH(Name) <= 100)
);
```

### Expenses Table (Relevant foreign keys)
```sql
CREATE TABLE Expenses (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Description TEXT,
    Amount DECIMAL(18,2) NOT NULL,
    Date TEXT NOT NULL,
    CategoryId INTEGER NOT NULL,
    UserId INTEGER NOT NULL,
    
    -- This is the relationship to Category
    FOREIGN KEY (CategoryId) REFERENCES Categories(Id) 
        ON DELETE RESTRICT,  -- Prevent deleting categories with expenses
    
    -- This is the relationship to User
    FOREIGN KEY (UserId) REFERENCES Users(Id) 
        ON DELETE CASCADE   -- Delete all user expenses when user deleted
);

-- Indexing for performance
CREATE INDEX IX_Expenses_CategoryId ON Expenses(CategoryId);
CREATE INDEX IX_Expenses_UserId ON Expenses(UserId);
```

## Pre-seeded Categories

Five default categories are created automatically on first database initialization:

```
ID | Name
---|----
1  | Food
2  | Transport
3  | Entertainment
4  | Utilities
5  | Other
```

These are seeded in DataContext.OnModelCreating():

```csharp
modelBuilder.Entity<Category>().HasData(
    new Category { Id = 1, Name = "Food" },
    new Category { Id = 2, Name = "Transport" },
    new Category { Id = 3, Name = "Entertainment" },
    new Category { Id = 4, Name = "Utilities" },
    new Category { Id = 5, Name = "Other" }
);
```

## Authorization & Security

### Endpoint Permissions

| Endpoint | Auth Required | Description |
|----------|---------------|-------------|
| GET /api/categories | No | Public - anyone can see categories |
| GET /api/categories/{id} | No | Public - see category details |
| POST /api/categories | Yes | Protected - need JWT token |
| PUT /api/categories/{id} | Yes | Protected - need JWT token |
| DELETE /api/categories/{id} | Yes | Protected - need JWT token |

### Why Different Permissions?

- **GET**: Public because categories are system-wide reference data
- **POST/PUT/DELETE**: Protected to prevent unauthorized category management

### Future Enhancement - Role-Based Access

```csharp
[Authorize(Roles = "Admin")]
[HttpPost]
public async Task<ActionResult<CategoryResponse>> CreateCategory(...)
{
    // Only admins can create categories
}
```

## Error Handling Examples

### Cannot Delete Category with Expenses
```
DELETE /api/categories/1

Response (400):
{
  "error": "Cannot delete category 'Food' because it has 15 associated expenses"
}
```

**Solution:** User must delete or reassign all expenses before deleting the category

### Duplicate Category Name
```
POST /api/categories

{
  "name": "Food"
}

Response (400):
{
  "error": "Category 'Food' already exists"
}
```

**Solution:** Use a unique category name

### Invalid Category on Expense Creation
```
POST /api/expenses

{
  "description": "Grocery",
  "amount": 45.50,
  "categoryId": 999  // Non-existent category
}

Response (400):
{
  "error": "Category not found"
}
```

**Solution:** Use a valid categoryId from GET /api/categories

## Performance Considerations

### Queries
- **Get all categories**: ~5ms (small table, always cached after first request)
- **Get category with expenses**: ~50ms (depends on expense count)
- **Filter expenses by category**: ~50ms (uses indexed CategoryId)

### Optimization Strategies
- ✅ Indexed CategoryId foreign key
- ✅ Eager loading with Include() to prevent N+1 queries
- ✅ Async queries for non-blocking I/O
- ✅ Restrict delete behavior prevents orphaned expenses

## Usage Flow Example

```
1. User registers and logs in
   ↓
2. Get all categories (to show dropdown)
   GET /api/categories
   Response: [Food, Transport, Entertainment, Utilities, Other]
   ↓
3. User creates expense with category
   POST /api/expenses
   { description: "Grocery", amount: 45.50, categoryId: 1 }
   ↓
4. Expense is now linked to Food category
   ↓
5. User filters expenses by category
   GET /api/expenses?categoryId=1
   Response: All user's Food expenses
   ↓
6. User can later create custom categories
   POST /api/categories
   { name: "Subscriptions" }
   ↓
7. Admin can delete unused categories
   DELETE /api/categories/{id}
   (Only if no expenses linked)
```

---

**Last Updated:** March 24, 2026  
**Framework:** ASP.NET Core 8.0  
**Database:** SQLite with Entity Framework Core  
**Status:** ✅ Complete and tested
