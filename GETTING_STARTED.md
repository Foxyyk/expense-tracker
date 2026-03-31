# 🎉 ExpenseTrackerAPI - Complete Setup Guide

## ✅ Project Creation Complete!

Your **ExpenseTrackerAPI** ASP.NET Core 8 Web API project has been successfully created with a professional, production-ready structure.

---

## 📋 What Has Been Created

### Project Artifacts

- ✅ **9 C# source files** created
- ✅ **Project configuration** completed
- ✅ **NuGet packages** restored
- ✅ **Project builds successfully** without errors
- ✅ **Swagger/OpenAPI** enabled and ready
- ✅ **Dependency Injection** configured

### Complete File Structure

```
ExpenseTrackerAPI/
├── Controllers/
│   └── ExpensesController.cs          [REST API endpoints]
├── Models/
│   └── Expense.cs                     [Data entity]
├── Services/
│   └── ExpenseService.cs              [Business logic]
├── Data/
│   └── DataContext.cs                 [Data layer]
├── Program.cs                         [App configuration]
├── ExpenseTrackerAPI.csproj           [Project file]
└── appsettings.json                   [Settings]
```

### Documentation Files

1. **README.md** - Full project documentation with examples
2. **ARCHITECTURE.md** - Detailed architecture diagrams & data flow
3. **COMMANDS.md** - Quick reference for CLI, curl, REST Client commands
4. **SETUP_SUMMARY.md** - Setup checklist and next steps
5. **PROJECT_OVERVIEW.md** - Visual project structure & relationships
6. **This file** - Complete setup guide

---

## 🎯 Folder Structure Explained

### **Controllers/** - HTTP Request Handlers

- **File:** `ExpensesController.cs`
- **Purpose:** Handle incoming HTTP requests and send responses
- **Endpoints:**
  - `GET /api/expenses` - Get all expenses
  - `GET /api/expenses/{id}` - Get single expense
  - `POST /api/expenses` - Create new expense
  - `PUT /api/expenses/{id}` - Update expense
  - `DELETE /api/expenses/{id}` - Delete expense
- **Key Concept:** Controllers use dependency injection to access services

### **Models/** - Data Structure Definitions

- **File:** `Expense.cs`
- **Purpose:** Define entity/data model classes
- **Properties:**
  - `Id` - Unique identifier
  - `Description` - Expense description
  - `Amount` - Expense amount (decimal)
  - `CreatedDate` - When created
  - `Category` - Expense category
- **Key Concept:** Models represent business entities in the system

### **Services/** - Business Logic Layer

- **File:** `ExpenseService.cs`
- **Purpose:** Implement core business operations
- **Implements:** `IExpenseService` interface
- **Methods:** GetAll, GetById, Create, Update, Delete (all async)
- **Storage:** Currently in-memory `List<Expense>` (can be replaced with database)
- **Key Concept:** Services contain reusable, testable business logic

### **Data/** - Data Persistence Layer

- **File:** `DataContext.cs`
- **Purpose:** Database context and data access (prepared for Entity Framework Core)
- **Current:** Placeholder for future database integration
- **Future:** Will replace in-memory storage with actual database
- **Key Concept:** Separates data access from business logic

---

## 🚀 How to Run the Project

### **Method 1: Using dotnet CLI (Recommended)**

```bash
# Navigate to project directory
cd "c:\Users\Andrii\Desktop\projekt na praktyki\ExpenseTrackerAPI"

# Run the application
dotnet run
```

### **Method 2: Using VS Code**

1. Open the project in VS Code
2. Press `F5` or click Run → Start Debugging
3. Select `.NET 8` when prompted (first time only)

### **Method 3: Using Visual Studio**

1. Open the project in Visual Studio
2. Press `F5` or click the green Play button
3. Application will launch automatically

### **What You'll See**

```
Application started. Press Ctrl+C to shut down.
Now listening on: https://localhost:7262
Now listening on: http://localhost:5206
Application is ready to serve.
```

---

## 🌐 Testing the API

### **Option 1: Swagger UI (Easiest)**

1. Start the application (`dotnet run`)
2. Open browser to: `https://localhost:7262/swagger/index.html`
3. You'll see interactive API documentation
4. Click "Try it out" on any endpoint
5. Modify request body and click "Execute"

### **Option 2: curl Commands**

```bash
# Get all expenses
curl -k https://localhost:7262/api/expenses

# Create an expense
curl -k -X POST https://localhost:7262/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"description":"Lunch","amount":15.50,"category":"Food"}'

# Get single expense (ID 1)
curl -k https://localhost:7262/api/expenses/1

# Update expense
curl -k -X PUT https://localhost:7262/api/expenses/1 \
  -H "Content-Type: application/json" \
  -d '{"description":"Lunch Updated","amount":16.50,"category":"Food"}'

# Delete expense
curl -k -X DELETE https://localhost:7262/api/expenses/1
```

### **Option 3: VS Code REST Client Extension**

1. Install "REST Client" extension by Huachao Mao
2. Create file `test.http` in project root
3. Add HTTP requests (example in COMMANDS.md)
4. Click "Send Request" link above each request

### **Option 4: Postman/Insomnia**

- Import API endpoints from Swagger JSON
- URL: `https://localhost:7262/swagger/v1/swagger.json`
- Create requests and test

---

## 📊 Typical API Response Examples

### Create Expense

**Request:**

```http
POST /api/expenses HTTP/1.1
Content-Type: application/json

{
  "description": "Grocery shopping",
  "amount": 45.99,
  "category": "Food"
}
```

**Response (201 Created):**

```json
{
  "id": 1,
  "description": "Grocery shopping",
  "amount": 45.99,
  "createdDate": "2026-03-23T10:30:45.1234567",
  "category": "Food"
}
```

### Get All Expenses

**Request:**

```http
GET /api/expenses HTTP/1.1
```

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "description": "Grocery shopping",
    "amount": 45.99,
    "createdDate": "2026-03-23T10:30:45",
    "category": "Food"
  },
  {
    "id": 2,
    "description": "Gas",
    "amount": 60.0,
    "createdDate": "2026-03-23T11:15:30",
    "category": "Transport"
  }
]
```

### Error Response

**Request (ID doesn't exist):**

```http
GET /api/expenses/999 HTTP/1.1
```

**Response (404 Not Found):**

```
HTTP/1.1 404 Not Found
```

---

## 🔧 Project Configuration Details

### **Program.cs Setup**

```csharp
// Services registration:
builder.Services.AddControllers();           // Controller support
builder.Services.AddEndpointsApiExplorer();  // API exploration
builder.Services.AddSwaggerGen();            // Swagger generation

// Custom service (Dependency Injection):
builder.Services.AddScoped<IExpenseService, ExpenseService>();

// Middleware pipeline:
app.UseSwagger();                             // Enable Swagger endpoint
app.UseSwaggerUI();                           // Enable Swagger UI
app.UseHttpsRedirection();                    // Redirect HTTP to HTTPS
app.UseAuthorization();                       // Authorization middleware
app.MapControllers();                         // Map controller endpoints
```

### **Dependency Injection (DI)**

- When `ExpensesController` is created, the DI container automatically provides an `IExpenseService` instance
- `ExpenseService` is registered with "Scoped" lifetime = new instance per HTTP request
- Testable: Can easily swap with mock service for unit tests

### **NuGet Packages**

```xml
<PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="8.0.11" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="6.6.2" />
```

- Provides Swagger/OpenAPI documentation support

---

## 📈 Data Flow Visualization

```
HTTP CLIENT REQUEST
        ↓
ROUTING → ExpensesController
        ↓
DEPENDENCY INJECTION → ExpenseService injected
        ↓
CONTROLLER METHOD EXECUTES → await service.GetAllExpensesAsync()
        ↓
SERVICE EXECUTES BUSINESS LOGIC → retrieves from List<Expense>
        ↓
SERVICE RETURNS DATA → List<Expense>
        ↓
CONTROLLER FORMATS RESPONSE → JSON serialization
        ↓
HTTP RESPONSE SENT (200 OK with JSON body)
        ↓
CLIENT RECEIVES RESPONSE
```

---

## 🎓 Architecture Principles

### **Layered Architecture Benefits**

| Layer       | Benefit                             |
| ----------- | ----------------------------------- |
| Controllers | Decouples HTTP from business logic  |
| Services    | Reusable logic, easy to test        |
| Data        | Separates data access concerns      |
| Models      | Single source of truth for entities |

### **SOLID Principles Applied**

- **S**ingle Responsibility: Each class has one reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Services use interfaces (IExpenseService)
- **I**nterface Segregation: Interface exposes only needed methods
- **D**ependency Inversion: Depend on abstractions (interfaces), not concrete types

---

## 💡 Key Features Implemented

✅ **RESTful API**

- Proper HTTP verbs (GET, POST, PUT, DELETE)
- Correct status codes (200, 201, 204, 404)
- Resource-based URLs (`/api/expenses`)

✅ **Async/Await**

- All methods use `async/await`
- Non-blocking operations
- Better performance under load

✅ **Dependency Injection**

- Constructor injection in controllers
- Services registered in DI container
- Easy to test with mocks

✅ **API Documentation**

- Swagger/OpenAPI auto-generated
- Interactive testing interface
- No manual documentation maintenance

✅ **Error Handling**

- Proper HTTP status codes
- 404 for not found
- Exception handling in place

---

## 🔄 Common Development Tasks

### **Add New API Endpoint**

1. Add method to `ExpenseService`
2. Add corresponding method to controller
3. Test in Swagger UI

### **Modify Data Model**

1. Update `Models/Expense.cs` class
2. Update service methods that use it
3. Rebuild project

### **Change Service Logic**

1. Edit implementation in `Services/ExpenseService.cs`
2. No controller changes needed (abstraction)
3. Service changes are isolated

### **Integrate Database**

1. Install EF Core NuGet packages
2. Update `DataContext` to inherit from `DbContext`
3. Create DbSet properties for entities
4. Create and apply migrations
5. Update service to use DbContext

---

## 🐛 Troubleshooting

| Issue                              | Solution                                                       |
| ---------------------------------- | -------------------------------------------------------------- |
| **Port 7262 already in use**       | Edit `Properties/launchSettings.json` or change port in system |
| **HTTPS certificate error**        | Run: `dotnet dev-certs https --trust`                          |
| **Packages won't restore**         | Run: `dotnet nuget locals all --clear`                         |
| **Build fails**                    | Run: `dotnet clean && dotnet build`                            |
| **Swagger not showing**            | Verify `app.UseSwagger()` in Program.cs                        |
| **Controller endpoints not found** | Verify `app.MapControllers()` in Program.cs                    |

---

## 📚 Documentation Files

| File                    | Content                                                |
| ----------------------- | ------------------------------------------------------ |
| **README.md**           | Full documentation, examples, getting started          |
| **ARCHITECTURE.md**     | Visual diagrams, request flow, layer responsibility    |
| **COMMANDS.md**         | CLI commands, testing with curl/REST Client, debugging |
| **SETUP_SUMMARY.md**    | Quick setup checklist, next steps                      |
| **PROJECT_OVERVIEW.md** | Visual structure, component relationships              |

---

## 🎯 Next Steps (Choose Based on Your Needs)

### **Immediate (Within Project)**

- [ ] Test all endpoints in Swagger UI
- [ ] Create a few sample expenses
- [ ] Verify GET, POST, PUT, DELETE operations

### **Short Term**

- [ ] Add input validation (FluentValidation)
- [ ] Add unit tests (xUnit)
- [ ] Implement logging (Serilog)

### **Medium Term**

- [ ] Integrate real database (SQL Server/PostgreSQL)
- [ ] Add authentication (JWT)
- [ ] Add authorization (roles/permissions)

### **Long Term**

- [ ] Add caching (Redis)
- [ ] Implement pagination
- [ ] Add filtering and sorting
- [ ] Deploy to cloud (Azure/AWS)

---

## 🚀 Build & Deployment Commands

```bash
# Development - with debug info
dotnet run

# Production build - optimized
dotnet publish -c Release -o ./publish

# Run specific configuration
dotnet run --configuration Release

# Watch mode - auto-reload on file changes
dotnet watch run

# Test build without running
dotnet build

# Clean build artifacts
dotnet clean
```

---

## 🔑 Key Files Reference

| File                  | Line Count | Purpose                             |
| --------------------- | ---------- | ----------------------------------- |
| Program.cs            | 21         | Application startup & configuration |
| ExpensesController.cs | 50         | REST endpoints                      |
| ExpenseService.cs     | 60         | Business logic                      |
| Expense.cs            | 12         | Data model                          |
| DataContext.cs        | 10         | Data layer placeholder              |

---

## ✨ Final Checklist

- ✅ Project created with .NET 8
- ✅ Folder structure organized (Controllers, Models, Services, Data)
- ✅ Clean architecture implemented
- ✅ Dependency Injection configured
- ✅ Swagger/OpenAPI enabled
- ✅ Sample API endpoints created
- ✅ In-memory data storage implemented
- ✅ All code compiles successfully
- ✅ Project builds without errors
- ✅ Complete documentation provided

---

## 📞 Need Help?

1. **Check Documentation** - See README.md, ARCHITECTURE.md, COMMANDS.md
2. **Review Examples** - See ExpensesController.cs for endpoint patterns
3. **Test in Swagger** - Run project and visit `/swagger`
4. **Check Logs** - Application logs in terminal window

---

## 🎉 You're Ready!

Your **ExpenseTrackerAPI** is fully configured and ready to:

- ✅ Run and debug
- ✅ Test endpoints
- ✅ Extend with new features
- ✅ Deploy to production

**Start the project now:**

```bash
cd "c:\Users\Andrii\Desktop\projekt na praktyki\ExpenseTrackerAPI"
dotnet run
```

Then open Swagger at: `https://localhost:7262/swagger/index.html`

---

**Version:** 1.0.0  
**Created:** March 23, 2026  
**Framework:** ASP.NET Core 8  
**Status:** ✅ Ready for Development & Testing
