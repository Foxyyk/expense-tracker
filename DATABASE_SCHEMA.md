# Database Schema & Relationships Diagram

## 📊 Visual Database Schema

### Complete ER Diagram (Entity-Relationship)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         EXPENSETRACKER DATABASE                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│       USERS          │         │    CATEGORIES        │
├──────────────────────┤         ├──────────────────────┤
│ PK: Id (INT)         │         │ PK: Id (INT)         │
│     Email (TEXT)     │         │     Name (TEXT)      │
│     PasswordHash     │         └──────────────────────┘
│     (TEXT)           │               ▲
└──────────────────────┘               │
        ▲                              │
        │                              │
        │ (1)                      (1) │
        │                              │
        │ One User                      │ One Category
        │ has many Expenses            │ has many Expenses
        │                              │
        │ (Many)                   (Many)
        │                              │
        └─────────────┬────────────────┘
                      │
        ┌─────────────▼──────────────┐
        │       EXPENSES             │
        ├────────────────────────────┤
        │ PK: Id (INT)               │
        │     Description (TEXT)     │
        │     Amount (DECIMAL)       │
        │     Date (DATETIME)        │
        │ FK: UserId (INT)           │─────────► References Users.Id
        │ FK: CategoryId (INT)       │─────────► References Categories.Id
        └────────────────────────────┘
```

---

## 🔗 Relationships Explained

### User → Expense (One-to-Many)

```
Relationship: One User can have Many Expenses

Visual Flow:
┌──────────────────┐
│    USER[1]       │
│ john@example.com │
│  PasswordHash... │
└────────┬─────────┘
         │
         ├─────────────────────────────────┐
         │                                 │
    ┌────▼─────────┐  ┌────────────────┐  ┌───▼───────────┐
    │ EXPENSE[1]   │  │  EXPENSE[2]    │  │  EXPENSE[3]   │
    │ Coffee: $5   │  │  Lunch: $15    │  │  Gas: $50     │
    │ UserId: 1    │  │  UserId: 1     │  │  UserId: 1    │
    └──────────────┘  └────────────────┘  └───────────────┘

Delete Behavior: CASCADE
If delete USER[1] → All 3 Expenses automatically deleted
```

**Database Constraint:**

```sql
ALTER TABLE Expenses
ADD CONSTRAINT FK_Expenses_Users
FOREIGN KEY (UserId) REFERENCES Users(Id)
ON DELETE CASCADE;
```

### Category → Expense (One-to-Many)

```
Relationship: One Category can have Many Expenses

Visual Flow:
┌──────────────────────┐
│   CATEGORY[1]        │
│      "Food"          │
└────────┬─────────────┘
         │
         ├──────────────────────────────────────┐
         │                                      │
    ┌────▼─────────┐  ┌────────────────┐  ┌────▼─────────┐
    │ EXPENSE[1]   │  │  EXPENSE[2]    │  │  EXPENSE[3]  │
    │ Coffee: $5   │  │  Lunch: $15    │  │  Snacks: $8  │
    │ CategoryId:1 │  │ CategoryId: 1  │  │ CategoryId:1 │
    └──────────────┘  └────────────────┘  └──────────────┘

Delete Behavior: RESTRICT
Cannot delete CATEGORY[1] if any Expenses reference it
```

**Database Constraint:**

```sql
ALTER TABLE Expenses
ADD CONSTRAINT FK_Expenses_Categories
FOREIGN KEY (CategoryId) REFERENCES Categories(Id)
ON DELETE RESTRICT;
```

---

## 📋 Table Definitions

### USERS Table

```
Column           Type        Constraints         Description
─────────────────────────────────────────────────────────────
Id               INTEGER     PRIMARY KEY         Auto-increment
                 (PK)        AUTO_INCREMENT      Unique identifier

Email            TEXT        NOT NULL            User email address
                             MAX 256             (required)

PasswordHash     TEXT        NOT NULL            Hashed password
                                                 (required)
```

**Sample Data:**

```
┌────┬──────────────────────┬─────────────────────────────────────┐
│ Id │ Email                │ PasswordHash                        │
├────┼──────────────────────┼─────────────────────────────────────┤
│ 1  │ john@example.com     │ $2a$11$... (hashed)                │
│ 2  │ jane@example.com     │ $2a$11$... (hashed)                │
│ 3  │ bob@example.com      │ $2a$11$... (hashed)                │
└────┴──────────────────────┴─────────────────────────────────────┘
```

---

### CATEGORIES Table

```
Column      Type        Constraints    Description
──────────────────────────────────────────────────
Id          INTEGER     PRIMARY KEY    Auto-increment
            (PK)        AUTO_INCREMENT Unique identifier

Name        TEXT        NOT NULL       Category name
                        MAX 100        (required)
```

**Pre-seeded Data:**

```
┌────┬────────────────┐
│ Id │ Name           │
├────┼────────────────┤
│ 1  │ Food           │
│ 2  │ Transport      │
│ 3  │ Entertainment  │
│ 4  │ Utilities      │
│ 5  │ Other          │
└────┴────────────────┘
```

---

### EXPENSES Table

```
Column          Type        Constraints     Description
──────────────────────────────────────────────────────────
Id              INTEGER     PRIMARY KEY     Auto-increment
                (PK)        AUTO_INCREMENT  Unique identifier

Description     TEXT        NULL            Optional description
                            MAX 500         of expense

Amount          DECIMAL     NOT NULL        Amount spent
                (18,2)      PRECISION(18,2) Max: 999,999,999.99

Date            DATETIME    NOT NULL        When expense occurred
                (TEXT)                      Stored as ISO string

CategoryId      INTEGER     NOT NULL        Foreign key
                (FK)        REFERENCES      Links to Categories.Id
                            Categories.Id   (Restrict Delete)

UserId          INTEGER     NOT NULL        Foreign key
                (FK)        REFERENCES      Links to Users.Id
                            Users.Id        (Cascade Delete)

Indices:
  IX_Expenses_CategoryId    Faster category queries
  IX_Expenses_UserId        Faster user queries
```

**Sample Data:**

```
┌────┬──────────────────┬────────┬─────────────────────┬────────────┬────────┐
│ Id │ Description      │ Amount │ Date                │ CategoryId │ UserId │
├────┼──────────────────┼────────┼─────────────────────┼────────────┼────────┤
│ 1  │ Morning coffee   │ 5.50   │ 2026-03-23 08:30:00 │ 1          │ 1      │
│ 2  │ Grocery shopping │ 45.99  │ 2026-03-23 14:00:00 │ 1          │ 1      │
│ 3  │ Gas              │ 60.00  │ 2026-03-23 16:45:00 │ 2          │ 1      │
│ 4  │ Movie ticket     │ 12.00  │ 2026-03-23 18:00:00 │ 3          │ 2      │
│ 5  │ Electric bill    │ 120.00 │ 2026-03-22 09:00:00 │ 4          │ 2      │
└────┴──────────────────┴────────┴─────────────────────┴────────────┴────────┘
```

---

## 🔑 Foreign Key Relationships

### FK: Expenses.UserId → Users.Id

```csharp
modelBuilder.Entity<Expense>()
    .HasOne(e => e.User)                    // Expense has ONE User
    .WithMany(u => u.Expenses)              // User has MANY Expenses
    .HasForeignKey(e => e.UserId)           // FK is UserId
    .OnDelete(DeleteBehavior.Cascade);      // Delete user = delete expenses
```

**Behavior:**

```sql
DELETE FROM Users WHERE Id = 1;
-- Automatically deletes all expenses where UserId = 1

-- Invalid - will fail:
INSERT INTO Expenses (UserId) VALUES (999);  -- User 999 doesn't exist!
```

### FK: Expenses.CategoryId → Categories.Id

```csharp
modelBuilder.Entity<Expense>()
    .HasOne(e => e.Category)                // Expense has ONE Category
    .WithMany(c => c.Expenses)              // Category has MANY Expenses
    .HasForeignKey(e => e.CategoryId)       // FK is CategoryId
    .OnDelete(DeleteBehavior.Restrict);     // Can't delete category with expenses
```

**Behavior:**

```sql
DELETE FROM Categories WHERE Id = 1;
-- Error! Expenses still reference Category 1

-- Must delete expenses first:
DELETE FROM Expenses WHERE CategoryId = 1;
DELETE FROM Categories WHERE Id = 1;  -- Now succeeds

-- Invalid - will fail:
INSERT INTO Expenses (CategoryId) VALUES (999);  -- Category 999 doesn't exist!
```

---

## 📊 Query Examples

### Example 1: Get All Expenses with User and Category

```sql
SELECT
    e.Id,
    e.Description,
    e.Amount,
    e.Date,
    u.Email AS UserEmail,
    c.Name AS CategoryName
FROM Expenses e
LEFT JOIN Users u ON e.UserId = u.Id
LEFT JOIN Categories c ON e.CategoryId = c.Id
ORDER BY e.Date DESC;
```

**Result:**

```
Id | Description      | Amount | Date                | UserEmail        | CategoryName
──────────────────────────────────────────────────────────────────────────────────────
1  | Morning coffee   | 5.50   | 2026-03-23 08:30:00 | john@example.com | Food
2  | Grocery shopping | 45.99  | 2026-03-23 14:00:00 | john@example.com | Food
3  | Gas              | 60.00  | 2026-03-23 16:45:00 | john@example.com | Transport
```

### Example 2: Total Expenses by Category

```sql
SELECT
    c.Name,
    COUNT(e.Id) AS ExpenseCount,
    SUM(e.Amount) AS TotalAmount
FROM Categories c
LEFT JOIN Expenses e ON c.Id = e.CategoryId
GROUP BY c.Id, c.Name
ORDER BY TotalAmount DESC;
```

**Result:**

```
Name           | ExpenseCount | TotalAmount
───────────────────────────────────────────
Food           | 2            | 51.49
Transport      | 1            | 60.00
Entertainment  | 1            | 12.00
Utilities      | 1            | 120.00
Other          | 0            | 0.00
```

### Example 3: User Expenses

```sql
SELECT
    u.Email,
    COUNT(e.Id) AS TotalExpenses,
    SUM(e.Amount) AS TotalSpent,
    AVG(e.Amount) AS AverageExpense
FROM Users u
LEFT JOIN Expenses e ON u.Id = e.UserId
GROUP BY u.Id, u.Email;
```

**Result:**

```
Email               | TotalExpenses | TotalSpent | AverageExpense
───────────────────────────────────────────────────────────────
john@example.com    | 3             | 111.49     | 37.16
jane@example.com    | 2             | 132.00     | 66.00
bob@example.com     | 0             | NULL       | NULL
```

---

## 🗄️ System Tables

### \_\_EFMigrationsHistory

Tracks all applied migrations:

```
Column           Type        Purpose
──────────────────────────────────────
MigrationId      TEXT        Migration name (timestamp + description)
ProductVersion   TEXT        EF Core version that created it
```

**Example Data:**

```
MigrationId                            | ProductVersion
────────────────────────────────────────────────────────
20260323120246_InitialCreate           | 8.0.0
20260323120400_AddUserPreferences      | 8.0.0
20260323120500_CreateAuditLogTable     | 8.0.0
```

**Used by:** EF Core to track which migrations have been applied

---

## 🔍 Database Indices

### Automatically Created

```sql
-- Index for Expenses.CategoryId (foreign key)
CREATE INDEX IX_Expenses_CategoryId ON Expenses(CategoryId);

-- Index for Expenses.UserId (foreign key)
CREATE INDEX IX_Expenses_UserId ON Expenses(UserId);
```

**Benefits:**

- Faster joins in queries
- Faster filtering by UserId or CategoryId
- Better performance when deleting users/categories

### Performance Impact

**Without Index:**

```
SELECT * FROM Expenses WHERE UserId = 1;
-- Must scan entire Expenses table → Slow with large data
```

**With Index:**

```
SELECT * FROM Expenses WHERE UserId = 1;
-- Uses index to jump directly to records → Fast!
```

---

## 📈 Data Integrity Scenarios

### Scenario 1: Valid Insert

```csharp
var expense = new Expense
{
    Description = "Coffee",
    Amount = 5.50m,
    Date = DateTime.Now,
    CategoryId = 1,    // Food category exists ✓
    UserId = 1         // User exists ✓
};
_context.Expenses.Add(expense);
await _context.SaveChangesAsync();  // ✓ SUCCESS
```

### Scenario 2: Invalid UserId

```csharp
var expense = new Expense
{
    Description = "Coffee",
    Amount = 5.50m,
    Date = DateTime.Now,
    CategoryId = 1,
    UserId = 999       // User doesn't exist ✗
};
_context.Expenses.Add(expense);
await _context.SaveChangesAsync();  // ✗ FOREIGN KEY ERROR
```

### Scenario 3: Cascade Delete

```csharp
var user = await _context.Users.FindAsync(1);
_context.Users.Remove(user);
await _context.SaveChangesAsync();

// Result:
// - User[1] deleted
// - All Expenses with UserId=1 automatically deleted (CASCADE)
// - Orphaned expense records prevented ✓
```

### Scenario 4: Restrict Delete

```csharp
var category = await _context.Categories.FindAsync(1);  // Food
_context.Categories.Remove(category);
await _context.SaveChangesAsync();  // ✗ FOREIGN KEY ERROR

// If any Expenses have CategoryId=1:
// - DELETE blocked (RESTRICT)
// - Exception thrown
// - Data integrity maintained ✓

// Solution:
await _context.Expenses
    .Where(e => e.CategoryId == 1)
    .ExecuteDeleteAsync();  // Delete expenses first

_context.Categories.Remove(category);
await _context.SaveChangesAsync();  // ✓ Now succeeds
```

---

## 🎯 Database Design Principles Applied

✅ **Normalization** - Separate tables for Users, Categories, Expenses  
✅ **Referential Integrity** - Foreign key constraints  
✅ **Primary Keys** - Unique identifier for each record  
✅ **Foreign Keys** - Link between tables  
✅ **Indices** - Performance optimization  
✅ **Constraints** - Data validation (NOT NULL, MAX LENGTH)  
✅ **Delete Behavior** - CASCADE for ownership, RESTRICT for lookups  
✅ **Atomic Operations** - SaveChangesAsync() for consistency

---

## 📂 Files Reference

| File                                       | Purpose                           |
| ------------------------------------------ | --------------------------------- |
| [Models/User.cs](Models/User.cs)           | User entity definition            |
| [Models/Category.cs](Models/Category.cs)   | Category entity definition        |
| [Models/Expense.cs](Models/Expense.cs)     | Expense entity with relationships |
| [Data/DataContext.cs](Data/DataContext.cs) | Database context & configuration  |
| [Migrations/](Migrations/)                 | Migration files & history         |
| expensetracker.db                          | SQLite database file              |

---

**Database Engine:** SQLite  
**Framework:** Entity Framework Core 8.0  
**Tables:** 3 user tables + 1 system table  
**Relationships:** 2 (User→Expense, Category→Expense)  
**Status:** ✅ Production Ready
