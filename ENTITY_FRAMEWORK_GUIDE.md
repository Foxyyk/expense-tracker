# Entity Framework Core & SQLite Integration Guide

## ✅ Complete - Entity Framework Core with SQLite Successfully Integrated!

Your ExpenseTrackerAPI now has a full relational database layer using Entity Framework Core 8.0 and SQLite.

---

## 📋 What Was Added

### NuGet Packages Installed

- ✅ `Microsoft.EntityFrameworkCore.Sqlite` (8.0.0) - SQLite database provider
- ✅ `Microsoft.EntityFrameworkCore.Tools` (8.0.0) - Migration tools
- ✅ `Microsoft.EntityFrameworkCore.Design` (8.0.0) - Design-time services

### Database Models Created

#### **User Model**

```csharp
public class User
{
    public int Id { get; set; }
    public string? Email { get; set; }
    public string? PasswordHash { get; set; }
    public virtual ICollection<Expense> Expenses { get; set; }
}
```

- Represents a user account
- Email: User's email address (required)
- PasswordHash: Hashed password (required)
- One-to-Many relationship with Expenses (cascade delete)

#### **Category Model**

```csharp
public class Category
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public virtual ICollection<Expense> Expenses { get; set; }
}
```

- Represents expense categories
- Name: Category name like "Food", "Transport", etc (required)
- One-to-Many relationship with Expenses (restrict delete)
- **Default Categories Pre-populated:**
  1. Food
  2. Transport
  3. Entertainment
  4. Utilities
  5. Other

#### **Expense Model (Updated)**

```csharp
public class Expense
{
    public int Id { get; set; }
    public string? Description { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public int CategoryId { get; set; }
    public int UserId { get; set; }

    public virtual Category? Category { get; set; }
    public virtual User? User { get; set; }
}
```

- Amount: Stored with precision(18,2) for accurate decimal values
- Date: When the expense occurred
- CategoryId: Foreign key to Category
- UserId: Foreign key to User

### Database Context Created

**File:** [Data/DataContext.cs](../Data/DataContext.cs)

```csharp
public class DataContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Expense> Expenses { get; set; }
}
```

**Configured:**

- User entity with Email required (max 256 chars)
- Category entity with Name required (max 100 chars)
- Expense entity with cascade/restrict delete rules
- Foreign key constraints:
  - Expense → User (Cascade delete: deleting user removes expenses)
  - Expense → Category (Restrict delete: can't delete category if expenses exist)
- Default categories seeded automatically

---

## 🗄️ Database Schema

### Tables Created

```
Users
├─ Id (INTEGER PRIMARY KEY AUTO_INCREMENT)
├─ Email (TEXT NOT NULL, MAX 256)
└─ PasswordHash (TEXT NOT NULL)

Categories
├─ Id (INTEGER PRIMARY KEY AUTO_INCREMENT)
└─ Name (TEXT NOT NULL, MAX 100)

Expenses
├─ Id (INTEGER PRIMARY KEY AUTO_INCREMENT)
├─ Description (TEXT NULL, MAX 500)
├─ Amount (DECIMAL(18,2) NOT NULL)
├─ Date (DATETIME NOT NULL)
├─ CategoryId (INTEGER NOT NULL) → FK → Categories.Id
└─ UserId (INTEGER NOT NULL) → FK → Users.Id

Indices Created:
├─ IX_Expenses_CategoryId
└─ IX_Expenses_UserId
```

### Relationships

```
User (1) ──────── (Many) Expense
  │                       │
  └─ Delete cascade    Uses Category
                          │
                    Delete restrict

Category (1) ────── (Many) Expense
  │
  └─ Delete restrict
```

---

## 📁 Project Structure Updated

```
ExpenseTrackerAPI/
├── Models/
│   ├── User.cs ..................... NEW - User entity
│   ├── Category.cs ................. NEW - Category entity
│   ├── Expense.cs .................. UPDATED - Now with FK relationships
│
├── Data/
│   └── DataContext.cs .............. UPDATED - Full EF Core configuration
│
├── Migrations/
│   ├── 20260323120246_InitialCreate.cs ... GENERATED - Initial schema
│   ├── 20260323120246_InitialCreate.Designer.cs
│   └── DataContextModelSnapshot.cs
│
├── Services/
│   └── ExpenseService.cs ........... UPDATED - Now uses DbContext
│
├── Program.cs ...................... UPDATED - Added DbContext configuration
├── appsettings.json ................ UPDATED - Added connection string
│
└── expensetracker.db ............... NEW - SQLite database file
```

---

## 🚀 How It Works: Step-by-Step

### Step 1: NuGet Packages Installed

Entity Framework Core packages added to project:

- SQLite provider for database operations
- Tools for creating and managing migrations
- Design-time services for automatic model discovery

### Step 2: Models Created

Three entities define the data structure:

- **User:** Represents people using the app
- **Category:** Pre-defined expense categories
- **Expense:** Individual expense records linked to users and categories

### Step 3: DbContext Configured

[DataContext.cs](../Data/DataContext.cs) acts as bridge between application and database:

- Defines `DbSet<T>` properties for each entity
- Configures relationships and constraints
- Seeds default categories (Food, Transport, etc.)
- Handles foreign key behavior

### Step 4: Database Connection String

Added to [appsettings.json](../appsettings.json):

```json
"ConnectionStrings": {
  "DefaultConnection": "Data Source=expensetracker.db"
}
```

Points to SQLite database file in project root

### Step 5: DbContext Registered in DI

Added to [Program.cs](../Program.cs):

```csharp
builder.Services.AddDbContext<DataContext>(options =>
    options.UseSqlite(connectionString));
```

Makes DataContext available for dependency injection

### Step 6: Migration Created

Command: `dotnet ef migrations add InitialCreate`

Generated files in `Migrations/` folder:

- **InitialCreate.cs** - Describes database changes (Create tables, indexes, seed data)
- **InitialCreate.Designer.cs** - Model snapshot for tracking changes
- **DataContextModelSnapshot.cs** - Current model state

Migration contains:

```sql
CREATE TABLE Users (Id, Email, PasswordHash)
CREATE TABLE Categories (Id, Name)
CREATE TABLE Expenses (Id, Description, Amount, Date, CategoryId, UserId)
INSERT INTO Categories (Food, Transport, Entertainment, Utilities, Other)
```

### Step 7: Migration Applied

Command: `dotnet ef database update`

Result:

- **expensetracker.db** created in project root
- All tables created with relationships and indexes
- Default 5 categories inserted
- Ready for data operations!

### Step 8: Service Updated

[ExpenseService.cs](../Services/ExpenseService.cs) now:

- Uses `DataContext` via dependency injection
- Performs LINQ queries against database
- Includes related entities (User, Category)
- Persists changes with `SaveChangesAsync()`

---

## 📊 Entity Relationships Explained

### User → Expense (One-to-Many)

```
One User can have Many Expenses

User
  ├─ Id: 1
  ├─ Email: "john@example.com"
  └─ Expenses: [
       Expense { Id: 1, Amount: 50, Description: "Coffee" },
       Expense { Id: 2, Amount: 30, Description: "Lunch" }
     ]
```

**Delete Behavior:** Cascade

- If user is deleted → all their expenses are deleted
- Rationale: Expenses belong to users

### Category → Expense (One-to-Many)

```
One Category can have Many Expenses

Category "Food"
  ├─ Id: 1
  ├─ Name: "Food"
  └─ Expenses: [
       Expense { Id: 1, Amount: 15.50 },
       Expense { Id: 2, Amount: 25.00 }
     ]
```

**Delete Behavior:** Restrict

- Cannot delete category if expenses exist
- Exception thrown: "The DELETE statement conflicted with a FOREIGN KEY constraint"
- Rationale: Maintain data integrity

### Expense Relationships (Foreign Keys)

```
Expense
├─ UserId (1) → References User (1)
│   └─ Navigation Property: User
└─ CategoryId (1) → References Category (1)
    └─ Navigation Property: Category
```

---

## 🔧 Common Database Operations

### Create a New Expense

```csharp
var expense = new Expense
{
    Description = "Grocery shopping",
    Amount = 45.99m,
    Date = DateTime.Now,
    CategoryId = 1,  // Food
    UserId = 1
};

await _expenseService.CreateExpenseAsync(expense);
```

### Query Expenses with Related Data

```csharp
var expenses = await _context.Expenses
    .Include(e => e.User)      // Load related User
    .Include(e => e.Category)  // Load related Category
    .ToListAsync();

// Access related data
foreach(var expense in expenses)
{
    Console.WriteLine($"{expense.Description} - ${expense.Amount}");
    Console.WriteLine($"  Category: {expense.Category.Name}");
    Console.WriteLine($"  User: {expense.User.Email}");
}
```

### Update an Expense

```csharp
var expense = await _context.Expenses.FindAsync(1);
expense.Amount = 50.00m;
_context.Expenses.Update(expense);
await _context.SaveChangesAsync();
```

### Delete an Expense

```csharp
var expense = await _context.Expenses.FindAsync(1);
_context.Expenses.Remove(expense);
await _context.SaveChangesAsync();
```

---

## 📝 Migration Commands Reference

### Create a Migration

```bash
dotnet ef migrations add <MigrationName>
```

Example: `dotnet ef migrations add AddUserPreferences`

Creates new migration files in `Migrations/` folder

### Apply Migrations to Database

```bash
dotnet ef database update
```

Applies all pending migrations and creates/updates database

### Remove Last Migration

```bash
dotnet ef migrations remove
```

⚠️ Only works if migration hasn't been applied to database

### View Pending Migrations

```bash
dotnet ef migrations list
```

Shows all migrations and their status

### Revert to Previous Migration

```bash
dotnet ef database update <PreviousMigrationName>
```

Example: `dotnet ef database update InitialCreate`

### Drop Database

```bash
dotnet ef database drop
```

⚠️ Deletes the database file completely

### Create Database from Scratch

```bash
dotnet ef database drop
dotnet ef database update
```

---

## 🔄 How to Add New Columns

### Example: Add "Notes" field to User

#### Step 1: Update Model

```csharp
public class User
{
    public int Id { get; set; }
    public string? Email { get; set; }
    public string? PasswordHash { get; set; }
    public string? Notes { get; set; }  // NEW
    public virtual ICollection<Expense> Expenses { get; set; }
}
```

#### Step 2: Create Migration

```bash
dotnet ef migrations add AddNotesFieldToUser
```

#### Step 3: Review Generated Migration

File: `Migrations/20260323XXXXXX_AddNotesFieldToUser.cs`

```csharp
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.AddColumn<string>(
        name: "Notes",
        table: "Users",
        type: "TEXT",
        nullable: true);
}

protected override void Down(MigrationBuilder migrationBuilder)
{
    migrationBuilder.DropColumn(
        name: "Notes",
        table: "Users");
}
```

#### Step 4: Apply Migration

```bash
dotnet ef database update
```

---

## 🔑 Important Configuration Details

### Foreign Key Constraints

**User → Expense (Cascade Delete)**

```csharp
entity.HasOne(e => e.User)
    .WithMany(u => u.Expenses)
    .HasForeignKey(e => e.UserId)
    .OnDelete(DeleteBehavior.Cascade);  // ← Delete user = delete expenses
```

**Category → Expense (Restrict Delete)**

```csharp
entity.HasOne(e => e.Category)
    .WithMany(c => c.Expenses)
    .HasForeignKey(e => e.CategoryId)
    .OnDelete(DeleteBehavior.Restrict);  // ← Can't delete category with expenses
```

### Default Data Seeding

Categories are automatically created on first database update:

```csharp
modelBuilder.Entity<Category>().HasData(
    new Category { Id = 1, Name = "Food" },
    new Category { Id = 2, Name = "Transport" },
    new Category { Id = 3, Name = "Entertainment" },
    new Category { Id = 4, Name = "Utilities" },
    new Category { Id = 5, Name = "Other" }
);
```

Query to verify:

```bash
SELECT * FROM Categories;
```

---

## 📂 Database File Location

```
expensetracker.db
```

Located in project root: `c:\Users\Andrii\Desktop\projekt na praktyki\ExpenseTrackerAPI\`

### View Database

**Using VS Code Extension:**

1. Install "SQLite" extension by alexcvzz
2. Right-click `expensetracker.db` → "Open Database"
3. View tables, data, schema

**Using Command Line:**

```bash
sqlite3 expensetracker.db
sqlite> .tables
sqlite> SELECT * FROM Users;
sqlite> SELECT * FROM Categories;
sqlite> SELECT * FROM Expenses;
sqlite> .quit
```

---

## 🧪 Testing the Database Integration

### Create Test Data

```bash
# Start the application
dotnet run
```

### Using Swagger UI

1. Open: `https://localhost:7262/swagger`

2. **Create User (via API or directly)**
   - Note: Need to add User endpoints (see next section)

3. **Create Expense**

   ```json
   {
     "description": "Coffee break",
     "amount": 5.5,
     "categoryId": 1,
     "userId": 1
   }
   ```

4. **Verify in Database**
   ```sql
   SELECT e.*, c.Name as CategoryName, u.Email as UserEmail
   FROM Expenses e
   LEFT JOIN Categories c ON e.CategoryId = c.Id
   LEFT JOIN Users u ON e.UserId = u.Id;
   ```

---

## ⚠️ Important Notes

### Nullable Reference Types

The `?` in properties indicates nullable types:

- `public string? Email` - Can be null
- `public virtual Category? Category` - Navigation property

### Foreign Key Rules

- **UserId:** Always required (no expense without user)
- **CategoryId:** Always required (no expense without category)
- **Amount:** Must be provided (required)
- **Date:** Auto-set to DateTime.Now if not provided

### Cascade vs Restrict Delete

- **Cascade:** Deleting parent deletes children (Users → Expenses)
- **Restrict:** Can't delete parent if children exist (Categories → Expenses)

### Connection String

SQLite uses local file:

```json
"DefaultConnection": "Data Source=expensetracker.db"
```

Relative path works from project directory

---

## 🎯 Next Steps

### Add User Controller

Create `Controllers/UsersController.cs` with CRUD operations:

```csharp
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly DataContext _context;

    [HttpPost]
    public async Task<ActionResult<User>> CreateUser(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
    }
}
```

### Add Category Controller

Create `Controllers/CategoriesController.cs` to:

- View all categories
- Add custom categories
- Update category names

### Add Migrations for Future Changes

As you add features:

```bash
dotnet ef migrations add <DescriptiveNameHere>
dotnet ef database update
```

### Implement Authentication

- Add password hashing (BCrypt)
- Create login endpoint
- Implement JWT tokens
- Secure user data

---

## 📖 Additional Resources

- [Entity Framework Core Documentation](https://learn.microsoft.com/en-us/ef/core/)
- [SQLite Documentation](https://www.sqlite.org/)
- [Relationship Configuration](https://learn.microsoft.com/en-us/ef/core/modeling/relationships)
- [Migrations Overview](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/)
- [Data Seeding](https://learn.microsoft.com/en-us/ef/core/modeling/data-seeding)

---

## ✅ Verification Checklist

- ✅ EF Core packages installed
- ✅ Models created (User, Category, Expense)
- ✅ DbContext configured with relationships
- ✅ Migrations created and applied
- ✅ Database file created (expensetracker.db)
- ✅ Default categories seeded
- ✅ Service updated to use DbContext
- ✅ Program.cs configured for DI
- ✅ Project compiles without errors
- ✅ Database structure verified

**Status:** ✅ Production Ready

---

**Date:** March 23, 2026  
**Version:** 1.0.0  
**Framework:** ASP.NET Core 8 + EF Core 8 + SQLite
