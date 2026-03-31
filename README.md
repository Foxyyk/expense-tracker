# ExpenseTrackerAPI

A clean, well-structured ASP.NET Core 8 Web API for managing expenses.

## Overview

This project demonstrates a professional ASP.NET Core Web API architecture with clear separation of concerns and best practices including:

- RESTful API endpoints
- Dependency Injection
- Service layer pattern
- Swagger/OpenAPI documentation
- Async/await patterns

## Project Structure

```
ExpenseTrackerAPI/
├── Controllers/          # API endpoint handlers
├── Models/              # Data models and entity classes
├── Services/            # Business logic and data operations
├── Data/                # Data access layer (prepared for EF Core)
├── Properties/          # Launch settings and profiles
├── Program.cs           # Application configuration and startup
└── ExpenseTrackerAPI.csproj  # Project file with dependencies
```

## Folder Purposes

### 📁 Controllers

- **Purpose:** Handles HTTP requests and responses
- **Contains:** API endpoint classes (e.g., `ExpensesController`)
- **Responsibility:** Route mapping, parameter validation, calling services
- **File:** `Controllers/ExpensesController.cs` - RESTful endpoints for CRUD operations on expenses

### 📁 Models

- **Purpose:** Defines data structures and entity classes
- **Contains:** Domain models and POCOs (Plain Old C# Objects)
- **Responsibility:** Data representation and validation
- **File:** `Models/Expense.cs` - Defines the Expense entity with properties like Id, Description, Amount, Category

### 📁 Services

- **Purpose:** Contains business logic and data operations
- **Contains:** Service interfaces and implementations
- **Responsibility:** Complex business rules, data processing, orchestration
- **File:** `Services/ExpenseService.cs` - Implements in-memory storage and CRUD operations

### 📁 Data

- **Purpose:** Data access layer for database operations
- **Contains:** DbContext, repositories (when using EF Core)
- **Responsibility:** Database communication and query operations
- **File:** `Data/DataContext.cs` - Currently a placeholder for future database integration

## Getting Started

### Prerequisites

- .NET 8 SDK or higher installed
- Visual Studio Code or Visual Studio (optional)

### Installation

1. Navigate to the project directory:

```bash
cd ExpenseTrackerAPI
```

2. Restore NuGet packages:

```bash
dotnet restore
```

3. Build the project:

```bash
dotnet build
```

### Running the Project

**Option 1: Using the dotnet CLI**

```bash
dotnet run
```

**Option 2: Using Visual Studio Code**

- Press `F5` or go to Run → Start Debugging

**Option 3: Using Visual Studio**

- Press `F5` or click the Debug button

The API will start on:

- **HTTPS:** https://localhost:7262 (or similar HTTPS port)
- **HTTP:** http://localhost:5206 (or similar HTTP port)

### Accessing Swagger UI

Once the application is running, open your browser and navigate to:

```
https://localhost:7262/swagger/index.html
```

You'll see the interactive Swagger documentation where you can:

- View all available endpoints
- Test API calls directly from the browser
- See request/response schemas

## API Endpoints

### Expenses API

| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| GET    | `/api/expenses`      | Get all expenses     |
| GET    | `/api/expenses/{id}` | Get expense by ID    |
| POST   | `/api/expenses`      | Create a new expense |
| PUT    | `/api/expenses/{id}` | Update an expense    |
| DELETE | `/api/expenses/{id}` | Delete an expense    |

### Example Request (Create Expense)

**POST** `/api/expenses`

```json
{
  "description": "Grocery shopping",
  "amount": 45.99,
  "category": "Food"
}
```

### Example Response

```json
{
  "id": 1,
  "description": "Grocery shopping",
  "amount": 45.99,
  "createdDate": "2026-03-23T10:30:00",
  "category": "Food"
}
```

## Project Architecture

### Current Implementation

- **Data Storage:** In-memory list (suitable for development/testing)
- **Framework:** ASP.NET Core 8
- **API Style:** RESTful with attribute routing

### Future Enhancements

- **Database Integration:** Replace in-memory storage with Entity Framework Core
- **Authentication:** Add JWT or OAuth 2.0
- **Validation:** Add FluentValidation for robust input validation
- **Logging:** Implement Serilog or similar logging framework
- **Unit Tests:** Add xUnit or NUnit test projects

## Technology Stack

- **Framework:** ASP.NET Core 8
- **Language:** C# 12
- **API Documentation:** Swagger/OpenAPI (Swashbuckle)
- **Nullable Reference Types:** Enabled for type safety

## NuGet Packages

- `Microsoft.AspNetCore.OpenApi` - OpenAPI support
- `Swashbuckle.AspNetCore` - Swagger documentation

## Key Features Implemented

✅ **Dependency Injection** - IExpenseService registered in Program.cs  
✅ **Async/Await** - All service methods are asynchronous  
✅ **REST Conventions** - Proper HTTP methods and status codes  
✅ **Swagger UI** - Auto-generated API documentation  
✅ **Clean Architecture** - Separation of concerns with layers  
✅ **Error Handling** - Proper HTTP status codes (404, 201, 204, etc.)

## Development Tips

1. **Add a new controller:**
   - Create a new file in the `Controllers/` folder
   - Inherit from `ControllerBase`
   - Use the `[ApiController]` and `[Route]` attributes

2. **Add a new service:**
   - Create an interface in `Services/`
   - Create an implementation class
   - Register in `Program.cs` using `builder.Services.AddScoped<IMyService, MyService>()`

3. **Add a new model:**
   - Create a new class in `Models/`
   - Add properties for your entity

4. **Enable Database Integration:**
   - Install Entity Framework Core packages
   - Move `DataContext` to inherit from `DbContext`
   - Configure connection strings in `appsettings.json`
   - Create migrations and update database

## Troubleshooting

### Port Already in Use

If the default port is in use, modify the launch settings in `Properties/launchSettings.json`

### HTTPS Certificate Issues

Run: `dotnet dev-certs https --trust`

### Package Restore Fails

Clear NuGet cache: `dotnet nuget locals all --clear`

## Resources

- [ASP.NET Core Documentation](https://docs.microsoft.com/aspnet/core)
- [REST API Best Practices](https://restfulapi.net/)
- [Swagger/OpenAPI Specification](https://swagger.io/)

---

**Created:** March 2026  
**Version:** 1.0.0
