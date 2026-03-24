# ExpenseTrackerAPI - Setup Summary

## ✅ Project Successfully Created

Your ASP.NET Core 8 Web API project **ExpenseTrackerAPI** has been created with a professional, clean architecture.

---

## 📂 Folder Structure Explanation

```
ExpenseTrackerAPI/
│
├── Controllers/
│   └── ExpensesController.cs          ← RESTful API endpoints
│
├── Models/
│   └── Expense.cs                     ← Data entities & domain models
│
├── Services/
│   └── ExpenseService.cs              ← Business logic layer
│
├── Data/
│   └── DataContext.cs                 ← Data access layer
│
├── Properties/
│   └── launchSettings.json            ← Application startup configuration
│
├── README.md                          ← Comprehensive documentation
├── ARCHITECTURE.md                    ← Architecture diagrams & flow
├── COMMANDS.md                        ← Quick reference commands
│
├── Program.cs                         ← Application configuration & dependency injection
├── ExpenseTrackerAPI.csproj           ← Project file with NuGet packages
│
└── appsettings.json                   ← Application settings
```

---

## 🎯 Purpose of Each Layer

### 📋 **Controllers** (`Controllers/`)

- **Role:** Request handling and routing
- **Responsibility:**
  - Receive HTTP requests
  - Validate parameters
  - Call business logic services
  - Format and return responses
- **Example:** `ExpensesController` - handles `/api/expenses` endpoints

### 🗂️ **Models** (`Models/`)

- **Role:** Data structure definitions
- **Responsibility:**
  - Define entity shapes (classes)
  - Represent business concepts
  - Data validation annotations (future)
- **Example:** `Expense` - represents an expense with Id, Description, Amount, Category

### ⚙️ **Services** (`Services/`)

- **Role:** Business logic layer
- **Responsibility:**
  - Implement core business rules
  - Data manipulation and validation
  - Coordinate between controllers and data layer
  - Testable business operations
- **Example:** `ExpenseService` - implements Create, Read, Update, Delete operations

### 🗄️ **Data** (`Data/`)

- **Role:** Data persistence layer
- **Responsibility:**
  - Database context (currently in-memory)
  - Query operations
  - Entity-database mapping (when using Entity Framework)
  - Transaction management
- **Example:** `DataContext` - placeholder for future database integration

---

## 🚀 How to Run the Project

### **Step 1: Open Terminal**

Navigate to the project directory:

```bash
cd "c:\Users\Andrii\Desktop\projekt na praktyki\ExpenseTrackerAPI"
```

### **Step 2: Run the Application**

**Option A - Using dotnet CLI:**

```bash
dotnet run
```

**Option B - Using Visual Studio Code:**

- Press `F5` or go to Run → Start Debugging

**Option C - Using Visual Studio:**

- Press `F5` or click the green Play button

### **Step 3: Access the API**

The application will start on:

- **HTTPS:** `https://localhost:7262` (or similar)
- **HTTP:** `http://localhost:5206` (or similar)

### **Step 4: Test with Swagger UI**

Open in your browser:

```
https://localhost:7262/swagger/index.html
```

You can now:

- 📖 View all available endpoints
- 🧪 Test API calls interactively
- 📝 See request/response schemas

---

## 🔗 API Endpoints

| Method     | Endpoint             | Purpose                   |
| ---------- | -------------------- | ------------------------- |
| **GET**    | `/api/expenses`      | Retrieve all expenses     |
| **GET**    | `/api/expenses/{id}` | Retrieve specific expense |
| **POST**   | `/api/expenses`      | Create new expense        |
| **PUT**    | `/api/expenses/{id}` | Update existing expense   |
| **DELETE** | `/api/expenses/{id}` | Delete expense            |

### Example: Create Expense

```bash
curl -X POST "https://localhost:7262/api/expenses" \
  -H "Content-Type: application/json" \
  -d '{"description":"Coffee","amount":5.50,"category":"Food"}' \
  -k
```

---

## 🔧 Key Features Implemented

- ✅ **Clean Architecture** - Separated concerns across layers
- ✅ **Dependency Injection** - Services registered in `Program.cs`
- ✅ **Async/Await** - All operations are asynchronous (`async`/`await`)
- ✅ **REST Conventions** - Proper HTTP verbs and status codes
- ✅ **Swagger/OpenAPI** - Auto-generated API documentation
- ✅ **In-Memory Storage** - Current implementation for testing
- ✅ **Error Handling** - Returns appropriate HTTP status codes (200, 201, 204, 404, etc.)

---

## 📚 Files Reference

| File                       | Purpose                                    |
| -------------------------- | ------------------------------------------ |
| `README.md`                | Full documentation with examples           |
| `ARCHITECTURE.md`          | Visual diagrams and data flow              |
| `COMMANDS.md`              | Quick reference for commands & testing     |
| `Program.cs`               | Startup configuration & DI container setup |
| `ExpenseTrackerAPI.csproj` | Project dependencies & build configuration |

---

## 🔄 Request Flow Example

```
1. Client → HTTP GET /api/expenses
         ↓
2. Router → ExpensesController.GetExpenses()
         ↓
3. Controller → IExpenseService.GetAllExpensesAsync()
         ↓
4. Service → Returns List<Expense>
         ↓
5. Controller → Formats as JSON, returns HTTP 200 OK
         ↓
6. Response → Client receives expense data
```

---

## 🛠️ Next Steps (Optional Enhancements)

1. **Add Database Integration**
   - Install Entity Framework Core
   - Update `DataContext` to inherit from `DbContext`
   - Create database migrations

2. **Add Authentication**
   - Implement JWT or OAuth 2.0
   - Secure endpoints with `[Authorize]` attributes

3. **Add Validation**
   - Use FluentValidation library
   - Validate input in services

4. **Add Unit Tests**
   - Create xUnit test project
   - Test service methods and controllers

5. **Add Logging**
   - Implement Serilog
   - Track application events

---

## 📞 Common Issues & Solutions

| Issue                             | Solution                               |
| --------------------------------- | -------------------------------------- |
| **Port already in use**           | Edit `Properties/launchSettings.json`  |
| **HTTPS certificate not trusted** | Run: `dotnet dev-certs https --trust`  |
| **Package restore fails**         | Run: `dotnet nuget locals all --clear` |
| **Build errors**                  | Run: `dotnet clean && dotnet build`    |

---

## ✨ Project Status

✅ **Build Status:** Successful  
✅ **Configuration:** Complete  
✅ **Swagger:** Enabled  
✅ **Dependency Injection:** Configured  
✅ **Sample Endpoints:** Ready to test

🎉 **Your project is ready to use!**

---

**Created:** March 2026  
**Framework:** ASP.NET Core 8  
**Language:** C# 12
