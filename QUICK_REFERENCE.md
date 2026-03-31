# 🎯 ExpenseTrackerAPI - Quick Start Cheat Sheet

## ⚡ 30-Second Quick Start

```bash
cd "c:\Users\Andrii\Desktop\projekt na praktyki\ExpenseTrackerAPI"
dotnet run
```

Then open: **https://localhost:7262/swagger/index.html**

---

## 📁 Folder Structure at a Glance

```
ExpenseTrackerAPI/
├── Controllers/        ← Handles HTTP requests → ExpensesController.cs
├── Models/            ← Data entities → Expense.cs
├── Services/          ← Business logic → ExpenseService.cs
├── Data/              ← Data layer → DataContext.cs
├── Program.cs         ← App configuration
└── [Documentation files]
```

---

## 📊 Each Folder's Job

### 🕹️ **Controllers/** - "Traffic Cop"

**What it does:** Accepts HTTP requests, tells services what to do, sends responses back

**Example file:** `ExpensesController.cs`

- `GET /api/expenses` → Returns all expenses
- `POST /api/expenses` → Creates new expense
- `PUT /api/expenses/{id}` → Updates expense
- `DELETE /api/expenses/{id}` → Deletes expense

**Key fact:** Depends on Services layer through dependency injection

---

### 📦 **Models/** - "Data Blueprint"

**What it does:** Defines the shape of your data (like a template)

**Example file:** `Expense.cs`

```csharp
public class Expense {
    public int Id { get; set; }              // Unique identifier
    public string Description { get; set; }  // What was spent on
    public decimal Amount { get; set; }      // How much
    public DateTime CreatedDate { get; set; }// When created
    public string Category { get; set; }     // Type (Food, Transport, etc)
}
```

**Key fact:** The exact same class is used everywhere (database, API, services)

---

### ⚙️ **Services/** - "Business Logic Brain"

**What it does:** Contains the actual business operations and rules

**Example file:** `ExpenseService.cs`

- Methods: `GetAllAsync()`, `GetByIdAsync()`, `CreateAsync()`, `UpdateAsync()`, `DeleteAsync()`
- Where logic lives (validation, calculations, etc.)
- Currently stores data in memory (List<Expense>)

**Key fact:** Controllers never access data directly - always go through services

---

### 🗄️ **Data/** - "Future Database Connection"

**What it does:** Handles communication with database (currently empty/placeholder)

**Example file:** `DataContext.cs`

- Will connect to SQL database in future
- Uses Entity Framework Core pattern
- Ready for upgrade to real persistence

**Key fact:** Currently not used (data in memory), but will replace it later

---

## 🚀 How to Run

### Option 1: CLI (Best)

```bash
cd "c:\Users\Andrii\Desktop\projekt na praktyki\ExpenseTrackerAPI"
dotnet run
```

### Option 2: VS Code

- Press `F5` (Debug) or `Ctrl+F5` (Run)

### Option 3: Visual Studio

- Press `F5` or click Play button

## ✅ Project is Ready When You See:

```
Now listening on: https://localhost:7262
Application is ready to serve.
```

---

## 🌐 Testing Your API

### Test #1: Swagger UI (Easiest)

1. Go to: `https://localhost:7262/swagger/index.html`
2. See all endpoints documented
3. Click "Try it out" on any endpoint
4. Test with browser GUI

### Test #2: curl Command Line

```bash
# Get all expenses
curl -k https://localhost:7262/api/expenses

# Create expense
curl -k -X POST https://localhost:7262/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"description":"Lunch","amount":15.50,"category":"Food"}'
```

### Test #3: VS Code REST Client

1. Install "REST Client" extension
2. Create `test.http` file
3. Add HTTP requests
4. Click "Send Request"

---

## 📝 Example API Calls

### Create an Expense

```
POST /api/expenses
{
  "description": "Coffee",
  "amount": 5.50,
  "category": "Food"
}
Response: 201 Created
{
  "id": 1,
  "description": "Coffee",
  "amount": 5.50,
  "createdDate": "2026-03-23T...",
  "category": "Food"
}
```

### Get All Expenses

```
GET /api/expenses
Response: 200 OK
[
  { "id": 1, "description": "Coffee", ... },
  { "id": 2, "description": "Lunch", ... }
]
```

### Update Expense

```
PUT /api/expenses/1
{
  "description": "Expensive Coffee",
  "amount": 6.50,
  "category": "Food"
}
Response: 204 No Content
```

### Delete Expense

```
DELETE /api/expenses/1
Response: 204 No Content
```

---

## 🔄 Request Flow (Simplified)

```
Browser/Client
    ↓
ExpensesController (catches the request)
    ↓
ExpenseService (does the work)
    ↓
Data Storage (in-memory List)
    ↓
Service returns result
    ↓
Controller formats as JSON
    ↓
Response sent back to client
```

---

## 📋 API Endpoints

| Method | URL               | Purpose                  |
| ------ | ----------------- | ------------------------ |
| GET    | `/api/expenses`   | Get all expenses         |
| GET    | `/api/expenses/1` | Get expense with id=1    |
| POST   | `/api/expenses`   | Create new expense       |
| PUT    | `/api/expenses/1` | Update expense with id=1 |
| DELETE | `/api/expenses/1` | Delete expense with id=1 |

---

## 🎓 What Each Layer Does

| Layer          | Handles                                                    |
| -------------- | ---------------------------------------------------------- |
| **Controller** | Receiving requests, calling services, formatting responses |
| **Service**    | Business logic, validation, data operations                |
| **Data**       | Database connection (currently just in-memory)             |
| **Model**      | Shape of the data                                          |

**Flow:** Request → Controller → Service → Data → Response

---

## 📚 Documentation Files Provided

- **README.md** - Full details, examples, troubleshooting
- **ARCHITECTURE.md** - Visual diagrams of how it all works
- **COMMANDS.md** - All CLI commands, curl examples, testing
- **GETTING_STARTED.md** - Comprehensive getting started guide
- **PROJECT_OVERVIEW.md** - Complete project visualization
- **This file** - Quick reference cheat sheet

---

## 🔧 Common Commands

```bash
# Run the app
dotnet run

# Build the app
dotnet build

# Clean build artifacts
dotnet clean

# Restore packages
dotnet restore

# Run with auto-reload on file changes
dotnet watch run

# Build for production
dotnet publish -c Release
```

---

## 🐛 Quick Troubleshooting

| Problem                         | Solution                                                   |
| ------------------------------- | ---------------------------------------------------------- |
| Can't connect to localhost:7262 | Check if app is running: `dotnet run`                      |
| Port already in use             | Close other apps or change port in launchSettings.json     |
| HTTPS certificate error         | Run: `dotnet dev-certs https --trust`                      |
| Swagger not showing             | Visit `/swagger` or `/swagger/index.html`                  |
| API returns 404                 | Check endpoint URL spelling and HTTP method (GET/POST/etc) |

---

## ✨ What You Have

✅ Clean layered architecture  
✅ Dependency injection configured  
✅ REST API endpoints working  
✅ Swagger documentation  
✅ In-memory data storage  
✅ Async/await operations  
✅ Professional project structure  
✅ Complete documentation

---

## 🎯 Next Steps

1. **Run it:** `dotnet run`
2. **Test it:** Open `https://localhost:7262/swagger`
3. **Play with it:** Create/update/delete some expenses
4. **Explore code:** Look at Expense.cs, ExpenseService.cs, ExpensesController.cs
5. **Add features:** New models, services, endpoints (see README.md for guide)

---

## 💻 System Requirements

- .NET 8 SDK installed
- Terminal/PowerShell
- Text editor or IDE (VS Code, Visual Studio)
- Browser (for Swagger UI testing)

---

## 🎉 Ready to Start!

```bash
cd "c:\Users\Andrii\Desktop\projekt na praktyki\ExpenseTrackerAPI"
dotnet run
```

Your API will be live at: `https://localhost:7262`  
Swagger UI at: `https://localhost:7262/swagger/index.html`

---

**Version:** 1.0.0 | Created: March 2026 | Status: ✅ Ready to Use
