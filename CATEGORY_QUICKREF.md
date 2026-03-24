# Category Controller - Quick Reference

## API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | /api/categories | No | Get all categories |
| GET | /api/categories/{id} | No | Get category details |
| POST | /api/categories | Yes | Create category |
| PUT | /api/categories/{id} | Yes | Update category |
| DELETE | /api/categories/{id} | Yes | Delete category |

## Quick Examples

### Get All Categories
```bash
curl -X GET "http://localhost:5297/api/categories"

# Response
[
  { "id": 1, "name": "Food", "expenseCount": 15 },
  { "id": 2, "name": "Transport", "expenseCount": 8 }
]
```

### Get Category Details
```bash
curl -X GET "http://localhost:5297/api/categories/1"

# Response
{
  "id": 1,
  "name": "Food",
  "expenses": [...all expenses...],
  "totalAmount": 215.75
}
```

### Create Category
```bash
curl -X POST "http://localhost:5297/api/categories" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Shopping"}'

# Response
{
  "id": 6,
  "name": "Shopping",
  "expenseCount": 0
}
```

### Update Category
```bash
curl -X PUT "http://localhost:5297/api/categories/1" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Groceries"}'

# Response: 204 No Content
```

### Delete Category
```bash
curl -X DELETE "http://localhost:5297/api/categories/6" \
  -H "Authorization: Bearer <token>"

# Response: 204 No Content
# Error if category has expenses:
# 400 - "Cannot delete category 'Food' because it has 15 expenses"
```

## Relationships

### User → Expense → Category Flow
```
User (1)
  └─ Expenses (Many)
       ├─ id: 1, amount: 45.50, categoryId: 1 ─┐
       ├─ id: 2, amount: 32.75, categoryId: 1 ─┤─→ Food (1)
       ├─ id: 3, amount: 25.00, categoryId: 2 ─┤
       └─ id: 4, amount: 18.50, categoryId: 2 ─┼─→ Transport (2)
                                                 │
                     Category (Many)←────────────┘
```

### Delete Behavior
- **User deleted** → All their expenses deleted (Cascade)
- **Category deleted** → Only if NO expenses (Restrict)

## Pre-seeded Categories
```
1. Food
2. Transport
3. Entertainment
4. Utilities
5. Other
```

## Response Models

### CategoryResponse (List/Create)
```json
{
  "id": 1,
  "name": "Food",
  "expenseCount": 15
}
```

### CategoryDetailResponse (Get by ID)
```json
{
  "id": 1,
  "name": "Food",
  "expenses": [{...}, {...}],
  "totalAmount": 215.75
}
```

## HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | GET successful |
| 201 | Created | POST successful |
| 204 | No Content | PUT/DELETE successful |
| 400 | Bad Request | Invalid data or constraint violation |
| 401 | Unauthorized | Missing token (POST/PUT/DELETE) |
| 404 | Not Found | Category not found |
| 500 | Server Error | Database/server issue |

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Category 'Food' already exists" | Duplicate name | Use unique name |
| "Cannot delete category" (+ expense count) | Has expenses | Delete/reassign expenses first |
| "Category not found" | Invalid ID | Use valid categoryId from GET all |
| 401 Unauthorized | Missing token | Add Authorization header |

## Service Layer

### ICategoryService Methods
```csharp
GetAllCategoriesAsync()              // All categories
GetCategoryByIdAsync(int id)          // Single category with expenses
CreateCategoryAsync(Category)         // Create new
UpdateCategoryAsync(int id, Category) // Update existing
DeleteCategoryAsync(int id)           // Delete (if no expenses)
GetCategoryExpenseCountAsync(int id)  // Count expenses
```

## Database Schema

```sql
-- Categories Table
CREATE TABLE Categories (
    Id INTEGER PRIMARY KEY,
    Name TEXT NOT NULL UNIQUE (max 100)
);

-- Foreign Key in Expenses Table
CREATE TABLE Expenses (
    ...
    CategoryId INTEGER NOT NULL,
    FOREIGN KEY (CategoryId) REFERENCES Categories(Id) 
        ON DELETE RESTRICT
);

-- Index for performance
CREATE INDEX IX_Expenses_CategoryId ON Expenses(CategoryId);
```

## Integration with Expenses

### Create Expense with Category
```
POST /api/expenses
{
  "description": "Grocery shopping",
  "amount": 45.50,
  "categoryId": 1    // ← Link to Food category
}
```

### Query Expenses by Category
```
GET /api/expenses?categoryId=1
```

### Link Flow
```
Expense (PostCreate)
  ├─ UserId: 1 (which user)
  ├─ CategoryId: 1 (which category)
  └─ Expense linked to both User and Category
```

## Authorization

- **GET endpoints**: Public (no auth required)
- **POST/PUT/DELETE**: Protected (JWT token required)

### Future: Role-Based
```csharp
[Authorize(Roles = "Admin")]
[HttpPost]
public async Task<ActionResult<CategoryResponse>> CreateCategory(...);

[Authorize(Roles = "Admin")]
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteCategory(int id);
```

## Testing Checklist

- [ ] GET /api/categories (should return 5 default)
- [ ] GET /api/categories/1 (should show Food with all expenses)
- [ ] POST /api/categories with valid name (should create with new ID)
- [ ] POST /api/categories with duplicate name (should error)
- [ ] POST /api/categories without auth (should error with 401)
- [ ] PUT /api/categories/1 with new name (should update)
- [ ] DELETE /api/categories/6 (empty category - should delete)
- [ ] DELETE /api/categories/1 (has expenses - should error)
- [ ] Create expense with categoryId=1 (should link)
- [ ] GET /api/expenses?categoryId=1 (should filter)

## Code Examples

### In ExpensesController
```csharp
// Validate category before creating expense
var category = await _categoryService.GetCategoryByIdAsync(request.CategoryId);
if (category == null)
    return BadRequest(new { error = "Category not found" });

// Create with link
var expense = new Expense
{
    UserId = userId,
    CategoryId = request.CategoryId,  // Link to category
    Amount = request.Amount,
    Description = request.Description
};
```

### In Queries
```csharp
// Get user's expenses in category
var expenses = await _expenseService.GetUserExpensesByCategoryAsync(userId, 1);

// Get category info
var category = await _categoryService.GetCategoryByIdAsync(1);
var totalSpent = category.Expenses.Sum(e => e.Amount);
```

## Important Notes

### Cannot Delete User-Created Categories
If categories are used in expenses, they cannot be deleted (database constraint RESTRICT).

**To delete:**
1. Reassign or delete all expenses in that category
2. Then delete the category

### Default Categories Are Not Deletable
While no technical protection, the 5 default categories are system categories.

### Expenses Must Have Category
Every expense MUST have a valid categoryId. The CategoryId is NOT nullable in the database.

### Performance
- All category queries are fast (< 5ms for list)
- Category lookups use indexed foreign key
- Expense filtering by category uses database index

---

**Quick Notes:**
- Categories are shared across all users (system-wide)
- User isolation happens at Expense level, not Category level
- 5 default categories seeded on database creation
- All Create/Update/Delete requires JWT authentication
