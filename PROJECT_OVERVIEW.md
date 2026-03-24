# 📊 ExpenseTrackerAPI - Project Overview

## Project Information

- **Name:** ExpenseTrackerAPI
- **Framework:** ASP.NET Core 8
- **Language:** C# 12
- **API Style:** RESTful Web API
- **Documentation:** Swagger/OpenAPI
- **Status:** ✅ Ready to Run

---

## 🏗️ Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    HTTP CLIENTS / SWAGGER UI                │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  CONTROLLERS LAYER (Controllers/)                            │
│  • ExpensesController                                        │
│  • Routes: /api/expenses                                     │
│  • Methods: GET, POST, PUT, DELETE                           │
│  • Responsibility: Handle HTTP & delegate to services        │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  SERVICES LAYER (Services/)                                  │
│  • IExpenseService (interface)                               │
│  • ExpenseService (implementation)                           │
│  • Business logic & validation                               │
│  • Responsibility: Implement core operations                 │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  DATA LAYER (Data/)                                          │
│  • DataContext                                               │
│  • Responsibility: Data persistence & queries                │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  DATA MODELS (Models/)                                       │
│  • Expense (entity class)                                    │
│  • Properties: Id, Description, Amount, CreatedDate, Category
│  • Responsibility: Define data structures                    │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  DATA SOURCE                                                 │
│  • Currently: In-Memory List<Expense>                        │
│  • Future: SQL Database with Entity Framework Core           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Complete File Structure

```
ExpenseTrackerAPI/
├── 📄 Program.cs
│   • Application startup configuration
│   • Dependency Injection setup
│   • Middleware configuration
│   • Service registration
│
├── 📄 ExpenseTrackerAPI.csproj
│   • Project file
│   • NuGet package references
│   • Target framework: net8.0
│   • Dependencies:
│       - Microsoft.AspNetCore.OpenApi
│       - Swashbuckle.AspNetCore
│
├── 📁 Controllers/
│   └── 📄 ExpensesController.cs
│       • Route: [Route("api/[controller]")]
│       • Endpoints:
│           - GET /api/expenses (all)
│           - GET /api/expenses/{id} (single)
│           - POST /api/expenses (create)
│           - PUT /api/expenses/{id} (update)
│           - DELETE /api/expenses/{id} (delete)
│
├── 📁 Models/
│   └── 📄 Expense.cs
│       • Properties:
│           - int Id
│           - string Description
│           - decimal Amount
│           - DateTime CreatedDate
│           - string Category
│
├── 📁 Services/
│   └── 📄 ExpenseService.cs
│       • Interface: IExpenseService
│       • Methods:
│           - GetAllExpensesAsync()
│           - GetExpenseByIdAsync(int id)
│           - CreateExpenseAsync(Expense)
│           - UpdateExpenseAsync(int id, Expense)
│           - DeleteExpenseAsync(int id)
│       • Storage: Static List<Expense> (in-memory)
│
├── 📁 Data/
│   └── 📄 DataContext.cs
│       • Placeholder for database integration
│       • Prepared for Entity Framework Core
│
├── 📁 Properties/
│   └── 📄 launchSettings.json
│       • Port configurations
│       • Environment settings
│       • HTTPS setup
│
├── 📁 bin/ & 📁 obj/
│   • Build artifacts (auto-generated)
│
├── 📄 appsettings.json
│   • Application configuration
│   • Logging settings
│   • Connection strings (future)
│
├── 📄 appsettings.Development.json
│   • Development-specific settings
│
├── 📄 README.md
│   • Comprehensive project documentation
│   • Getting started guide
│   • API endpoint reference
│   • Examples & troubleshooting
│
├── 📄 ARCHITECTURE.md
│   • Architecture diagrams
│   • Data flow explanation
│   • Layer responsibilities
│
├── 📄 COMMANDS.md
│   • Quick reference commands
│   • Testing examples (curl, REST Client)
│   • Debugging tips
│   • Database migration guide
│
├── 📄 SETUP_SUMMARY.md
│   • Project setup summary
│   • Next steps
│   • Common issues & solutions
│
└── 📄 PROJECT_OVERVIEW.md (this file)
    • Visual project structure
    • Component relationships
    • Key features & technologies
```

---

## 🔄 Data Flow: Create Expense Example

```
┌─ CLIENT REQUEST ─────────────────────────────────────────┐
│                                                           │
│  POST https://localhost:7262/api/expenses                │
│  Content-Type: application/json                          │
│                                                           │
│  {                                                        │
│    "description": "Lunch",                               │
│    "amount": 15.50,                                      │
│    "category": "Food"                                    │
│  }                                                        │
│                                                           │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─ ROUTING & CONTROLLER ───────────────────────────────────┐
│                                                           │
│  ExpensesController.CreateExpense(expense)               │
│  • Receives HTTP request                                 │
│  • Parses JSON body → Expense object                     │
│  • Injects IExpenseService                               │
│  • Calls: _expenseService.CreateExpenseAsync(expense)    │
│                                                           │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─ SERVICE LAYER ──────────────────────────────────────────┐
│                                                           │
│  ExpenseService.CreateExpenseAsync(expense)              │
│  • Validates input                                       │
│  • Generates Id (++nextId)                               │
│  • Sets CreatedDate = DateTime.Now                       │
│  • Adds to in-memory list                                │
│  • Returns created Expense                               │
│                                                           │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─ DATA STORAGE ───────────────────────────────────────────┐
│                                                           │
│  _expenses.Add(expense)                                  │
│  • Static List<Expense> in memory                        │
│  • Expense object stored with generated Id               │
│                                                           │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─ RESPONSE ───────────────────────────────────────────────┐
│                                                           │
│  HTTP 201 Created                                        │
│  Location: /api/expenses/1                               │
│  Content-Type: application/json                          │
│                                                           │
│  {                                                        │
│    "id": 1,                                              │
│    "description": "Lunch",                               │
│    "amount": 15.50,                                      │
│    "createdDate": "2026-03-23T10:30:00",                 │
│    "category": "Food"                                    │
│  }                                                        │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 🎯 Dependency Injection Container

```
Program.cs (Startup Configuration)
│
├─ builder.Services.AddControllers()
│  └─ Registers all controllers
│
├─ builder.Services.AddEndpointsApiExplorer()
│  └─ Enables API exploration
│
├─ builder.Services.AddSwaggerGen()
│  └─ Enables Swagger/OpenAPI documentation
│
└─ builder.Services.AddScoped<IExpenseService, ExpenseService>()
   └─ Registers ExpenseService
       • When controller needs IExpenseService
       • DI automatically injects ExpenseService instance
       • Scoped = new instance per HTTP request
       • Disposed at end of request
```

---

## 🧪 Testing the API

### Interactive Testing

```
1. Start application: dotnet run
2. Open browser: https://localhost:7262/swagger/index.html
3. Click "Try it out" on any endpoint
4. Fill in parameters & execute
```

### Command Line Testing

```bash
# Get all expenses
curl https://localhost:7262/api/expenses -k

# Create expense
curl -X POST https://localhost:7262/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"description":"Food","amount":25.99,"category":"Food"}' \
  -k
```

### VS Code REST Client

```
Install "REST Client" extension
Create test.http file
Click "Send Request" above HTTP methods
```

---

## ✨ Key Technologies

| Technology            | Purpose               | Version        |
| --------------------- | --------------------- | -------------- |
| ASP.NET Core          | Web framework         | 8.0            |
| C#                    | Language              | 12.0           |
| Swagger/OpenAPI       | API documentation     | Auto-generated |
| Entity Framework Core | ORM (optional future) | 8.0+           |

---

## 🚀 Quick Start Commands

```bash
# Navigate to project
cd "c:\Users\Andrii\Desktop\projekt na praktyki\ExpenseTrackerAPI"

# Restore packages
dotnet restore

# Build
dotnet build

# Run
dotnet run

# Run with release configuration
dotnet run --configuration Release

# Run with watch mode (auto-reload on file changes)
dotnet watch run
```

---

## 📈 Scalability & Future Enhancements

Current State:

- ✅ In-memory data storage
- ✅ Basic CRUD operations
- ✅ Swagger documentation
- ✅ Clean architecture

Future Additions:

- 🔄 Real database (SQL Server, PostgreSQL)
- 🔐 Authentication & Authorization
- ✔️ Input validation (FluentValidation)
- 📝 Logging (Serilog)
- 🧪 Unit tests (xUnit)
- 🔄 Caching (Redis)
- 📊 Pagination & Filtering
- 📧 Email notifications

---

## 📞 Support Resources

- [ASP.NET Core Docs](https://docs.microsoft.com/aspnet/core)
- [C# Documentation](https://docs.microsoft.com/dotnet/csharp)
- [Entity Framework Core](https://docs.microsoft.com/ef/core)
- [Swagger/OpenAPI](https://swagger.io/)
- [REST API Best Practices](https://restfulapi.net/)

---

**Project Version:** 1.0.0  
**Created:** March 2026  
**Status:** ✅ Production Ready for Development
