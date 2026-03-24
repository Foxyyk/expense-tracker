# 🔧 Entity Framework Core - Quick Command Reference

## Essential Migration Commands

### 1. Create a Migration

```bash
dotnet ef migrations add <MigrationName>
```

**Examples:**

```bash
dotnet ef migrations add InitialCreate
dotnet ef migrations add AddUserPreferences
dotnet ef migrations add CreateProductTable
dotnet ef migrations add AddEmailIndexToUser
```

**What happens:**

- Analyzes your models vs current database
- Generates migration files in `Migrations/` folder
- Creates timestamp-prefixed files (e.g., `20260323120246_AddUserPreferences.cs`)
- **Does NOT modify database yet**

---

### 2. Apply Migrations to Database

```bash
dotnet ef database update
```

**What happens:**

- Executes all pending migrations
- Creates database if it doesn't exist
- Updates schema to match models
- Records migration in `__EFMigrationsHistory` table
- **Actually modifies the database**

---

### 3. Remove Last Migration

```bash
dotnet ef migrations remove
```

**When to use:**

- You just created a migration but didn't apply it yet
- Migration has errors and needs to be regenerated

**⚠️ Important:**

- Only works if migration hasn't been applied to database
- If already applied, use rollback instead (see below)

---

### 4. Rollback to Previous Migration

```bash
dotnet ef database update <PreviousMigrationName>
```

**Examples:**

```bash
# Rollback to initial state
dotnet ef database update InitialCreate

# Rollback multiple migrations
dotnet ef database update 20260323120246_InitialCreate
```

**What happens:**

- Runs Down() method of migrations being reverted
- Database schema reverts to that migration state

---

### 5. View All Migrations

```bash
dotnet ef migrations list
```

**Output:**

```
20260323120246_InitialCreate (Pending)
20260323120400_AddUserPreferences (Applied)
20260323120500_CreateProductTable (Pending)
```

**Shows:**

- Migration names with timestamps
- Whether each is Applied or Pending

---

### 6. Drop Database

```bash
dotnet ef database drop
```

**⚠️ Warning:** Deletes all data!

**Use cases:**

- Testing purposes
- Reset development database
- Remove test data

**To recreate after drop:**

```bash
dotnet ef database update
```

---

### 7. Create Database from Scratch

```bash
# Complete reset
dotnet ef database drop
dotnet ef database update
```

---

### 8. View Generated Migration Code

```bash
cat Migrations/20260323120246_InitialCreate.cs
```

**Or in VS Code:**

- Open file: `Migrations/20260323120246_InitialCreate.cs`
- Review Up() and Down() methods

---

## Common Workflows

### Workflow 1: Add New Column to Existing Table

```bash
# 1. Update model
# Edit Models/User.cs, add: public string? PhoneNumber { get; set; }

# 2. Create migration
dotnet ef migrations add AddPhoneNumberToUser

# 3. Review generated migration (optional)
# Check: Migrations/20260323_AddPhoneNumberToUser.cs

# 4. Apply to database
dotnet ef database update
```

---

### Workflow 2: Fix Migration Before Applying

```bash
# 1. Create migration
dotnet ef migrations add AddPhoneNumberToUser

# 2. Realize there's a problem

# 3. Remove the migration
dotnet ef migrations remove

# 4. Fix the model
# Edit your entity class

# 5. Create migration again
dotnet ef migrations add AddPhoneNumberToUser

# 6. Apply
dotnet ef database update
```

---

### Workflow 3: Create New Table

```bash
# 1. Create new model
# New file: Models/Product.cs
# public class Product { public int Id { get; set; } ... }

# 2. Add DbSet to DataContext
# public DbSet<Product> Products { get; set; }

# 3. Create migration
dotnet ef migrations add CreateProductTable

# 4. Apply
dotnet ef database update
```

---

### Workflow 4: Rollback Changes

```bash
# 1. Check what migrations exist
dotnet ef migrations list

# 2. See applied migrations applied, decide which to rollback to
# Example: "InitialCreate" is stable, "AddBadFeature" has issues

# 3. Rollback
dotnet ef database update InitialCreate

# 4. Remove the bad migration(s)
dotnet ef migrations remove  # Removes "AddBadFeature"

# 5. Fix your model and try again
```

---

## Real-World Examples for ExpenseTrackerAPI

### Example 1: Add User Profile Table

```bash
# 1. Create model
# Models/UserProfile.cs
# public class UserProfile {
#     public int Id { get; set; }
#     public int UserId { get; set; }
#     public string PhoneNumber { get; set; }
#     public User User { get; set; }
# }

# 2. Add to DataContext
# public DbSet<UserProfile> UserProfiles { get; set; }

# 3. Create migration
dotnet ef migrations add AddUserProfileTable

# 4. Apply
dotnet ef database update
```

---

### Example 2: Add Category Limit to User

```bash
# 1. Update User model
# public class User {
#     ...
#     public int? MonthlyBudget { get; set; }
# }

# 2. Create migration
dotnet ef migrations add AddMonthlyBudgetToUser

# 3. Apply
dotnet ef database update
```

---

### Example 3: Create Audit Log Table

```bash
# 1. Create model
# Models/AuditLog.cs
# public class AuditLog {
#     public int Id { get; set; }
#     public string Action { get; set; }
#     public DateTime Timestamp { get; set; }
#     public string Details { get; set; }
# }

# 2. Register in DataContext
# public DbSet<AuditLog> AuditLogs { get; set; }

# 3. Create migration
dotnet ef migrations add CreateAuditLogTable

# 4. Apply
dotnet ef database update
```

---

## Troubleshooting

### Problem: "Unable to create a 'DbContext' of type 'DataContext'"

**Solution:**

```bash
# Make sure Program.cs has DbContext registration:
builder.Services.AddDbContext<DataContext>(options =>
    options.UseSqlite(connectionString));
```

---

### Problem: "The migration 'XYZ' has already been applied"

**Solution:**

```bash
# Check current state
dotnet ef migrations list

# If you want to regenerate that migration:
dotnet ef database update <PreviousMigration>  # Rollback
dotnet ef migrations remove                     # Remove problem migration
dotnet ef migrations add <MigrationName>        # Create new
dotnet ef database update                       # Apply
```

---

### Problem: "Foreign key constraint failed"

**Solution:**

- Check delete behavior in DataContext configuration
- Ensure referenced records exist before inserting
- Can't delete parent if children exist (Restrict)

```csharp
// In DataContext OnModelCreating:
.OnDelete(DeleteBehavior.Cascade)   // Delete parent = delete children
// or
.OnDelete(DeleteBehavior.Restrict)  // Can't delete parent with children
```

---

### Problem: "Sqlite database is locked"

**Solution:**

```bash
# Close all connections to database
# Stop running application: Ctrl+C

# Then try again:
dotnet ef database update

# Or delete and recreate
dotnet ef database drop
dotnet ef database update
```

---

## Database File Location

**SQLite Database:**

```
c:\Users\Andrii\Desktop\projekt na praktyki\ExpenseTrackerAPI\expensetracker.db
```

### View Database Contents

**Option 1: VS Code Extension**

1. Install "SQLite" extension
2. Right-click `expensetracker.db` → "Open Database"
3. Browse tables and data

**Option 2: Command Line**

```bash
sqlite3 expensetracker.db
sqlite> .tables
sqlite> .schema Users
sqlite> SELECT * FROM Users;
sqlite> .quit
```

**Option 3: Online Viewer**

- Upload DB to SQLite browser: https://sqlitebrowser.org/

---

## Current Project State

### Existing Migrations

```
✓ 20260323120246_InitialCreate
  ├─ Creates Users, Categories, Expenses tables
  ├─ Sets up foreign keys
  ├─ Creates indices
  └─ Seeds 5 default categories
```

### Tables in expensetracker.db

```
1. Users (3 columns)
2. Categories (2 columns) + 5 default records
3. Expenses (6 columns)
4. __EFMigrationsHistory (tracks applied migrations)
```

### Ready for New Migrations

```bash
# Add any new features:
dotnet ef migrations add <YourMigration>
dotnet ef database update
```

---

## Migration Best Practices

✅ **DO:**

- Create migration immediately after model change
- Use descriptive names: `AddPhoneNumberToUser` not `Update1`
- Review generated migration before applying
- Keep migrations small and focused
- Commit migrations to version control

❌ **DON'T:**

- Manually edit generated migration files (unless very familiar)
- Apply migrations to production without testing
- Skip migration history (don't recreate database in prod)
- Leave pending migrations unapplied

---

## Help & Documentation

### Built-in Help

```bash
dotnet ef --help
dotnet ef migrations --help
dotnet ef database --help
```

### Project Specific Info

```bash
# Show current DataContext
dotnet ef dbcontext info

# Show model configuration
dotnet ef dbcontext scaffold --help
```

### Useful Links

- [EF Core Documentation](https://learn.microsoft.com/ef/core/)
- [Migrations Guide](https://learn.microsoft.com/ef/core/managing-schemas/migrations/)
- [Relationships](https://learn.microsoft.com/ef/core/modeling/relationships)

---

## Quick Cheat Sheet

| Task                  | Command                                                |
| --------------------- | ------------------------------------------------------ |
| Create migration      | `dotnet ef migrations add <Name>`                      |
| Apply migrations      | `dotnet ef database update`                            |
| Rollback to migration | `dotnet ef database update <MigrationName>`            |
| Remove last migration | `dotnet ef migrations remove`                          |
| List migrations       | `dotnet ef migrations list`                            |
| Drop database         | `dotnet ef database drop`                              |
| View migration file   | `cat Migrations/20260323_*.cs`                         |
| Reset completely      | `dotnet ef database drop && dotnet ef database update` |

---

**Your Project:** ExpenseTrackerAPI  
**Database:** expensetracker.db (SQLite)  
**Framework:** ASP.NET Core 8 + EF Core 8  
**Status:** Ready for development!
