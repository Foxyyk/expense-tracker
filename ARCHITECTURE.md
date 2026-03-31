# Architecture Overview

## Data Flow Diagram

```
HTTP Request
    ↓
[Controller Layer] - Handles HTTP requests/responses
    ↓ (Dependency Injection)
[Service Layer] - Business logic and operations
    ↓
[Data Layer] - Database operations (currently in-memory)
    ↓
Data Source (In-memory list / Future: Database)
```

## Request-Response Lifecycle

```
1. Client sends HTTP request to /api/expenses
        ↓
2. Routing identifies ExpensesController
        ↓
3. Controller method (e.g., GetExpenses) is invoked
        ↓
4. Controller calls IExpenseService (dependency injected)
        ↓
5. Service performs business logic
        ↓
6. Service returns data to Controller
        ↓
7. Controller formats response (JSON) with appropriate status code
        ↓
8. HTTP response sent to client
```

## Dependency Injection Flow

```
Program.cs
    ├─ builder.Services.AddScoped<IExpenseService, ExpenseService>()
    └─ Registers the service in the DI container

When ExpensesController needs IExpenseService:
    └─ DI container automatically provides ExpenseService instance
```

## Layer Responsibilities

```
┌─────────────────────────────────────────────────────┐
│           HTTP / Client Request                      │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│  Controllers (Request handling & routing)            │
│  - Parse input                                       │
│  - Call services                                     │
│  - Return HTTP responses                             │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│  Services (Business logic)                           │
│  - Validate data                                     │
│  - Implement business rules                          │
│  - Coordinate operations                             │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│  Data Layer (Data access)                            │
│  - Query data                                        │
│  - Save data                                         │
│  - Handle persistence                                │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│  Data Source (Database / In-Memory)                  │
└─────────────────────────────────────────────────────┘
```

## API Response Codes

| Code | Meaning      | Usage                  |
| ---- | ------------ | ---------------------- |
| 200  | OK           | Successful GET/PUT     |
| 201  | Created      | POST successful        |
| 204  | No Content   | DELETE successful      |
| 404  | Not Found    | Resource doesn't exist |
| 400  | Bad Request  | Invalid input          |
| 500  | Server Error | Unhandled exception    |
