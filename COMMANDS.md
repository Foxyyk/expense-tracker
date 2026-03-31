# Quick Reference Commands

## Running the Application

### Using dotnet CLI

```bash
cd ExpenseTrackerAPI
dotnet run
```

### Using Visual Studio Code

- Press `F5` to start with debugger
- Press `Ctrl+F5` to start without debugger

### Using Visual Studio

- Press `F5` or click the green "Play" button

## Common dotnet Commands

### Project Management

```bash
# Restore packages
dotnet restore

# Build project
dotnet build

# Clean build artifacts
dotnet clean

# Run in release mode
dotnet run --configuration Release
```

### Creating New Files

#### Add a new model

```bash
# Models/YourModel.cs
namespace ExpenseTrackerAPI.Models
{
    public class YourModel
    {
        public int Id { get; set; }
        // Add your properties
    }
}
```

#### Add a new service

```bash
# Services/IYourService.cs + Services/YourService.cs
# Then register in Program.cs:
builder.Services.AddScoped<IYourService, YourService>();
```

#### Add a new controller

```bash
# Controllers/YourController.cs
[ApiController]
[Route("api/[controller]")]
public class YourController : ControllerBase
{
    private readonly IYourService _service;

    public YourController(IYourService service)
    {
        _service = service;
    }
}
```

## Testing the API

### Using Swagger UI

- Navigate to: `https://localhost:7262/swagger/index.html`
- Click on endpoints to test
- Fill in request body and execute

### Using curl (Command Line)

#### GET all expenses

```bash
curl -X GET "https://localhost:7262/api/expenses" -k
```

#### GET expense by ID

```bash
curl -X GET "https://localhost:7262/api/expenses/1" -k
```

#### POST create expense

```bash
curl -X POST "https://localhost:7262/api/expenses" \
  -H "Content-Type: application/json" \
  -d '{"description":"Lunch","amount":15.50,"category":"Food"}' \
  -k
```

#### PUT update expense

```bash
curl -X PUT "https://localhost:7262/api/expenses/1" \
  -H "Content-Type: application/json" \
  -d '{"description":"Lunch Updated","amount":16.50,"category":"Food"}' \
  -k
```

#### DELETE expense

```bash
curl -X DELETE "https://localhost:7262/api/expenses/1" -k
```

### Using VS Code REST Client Extension

Install: `REST Client` extension by Huachao Mao

Create `test.http` file:

```http
### Get all expenses
GET https://localhost:7262/api/expenses HTTP/1.1

### Get expense by ID
GET https://localhost:7262/api/expenses/1 HTTP/1.1

### Create expense
POST https://localhost:7262/api/expenses HTTP/1.1
Content-Type: application/json

{
  "description": "Grocery shopping",
  "amount": 25.99,
  "category": "Food"
}

### Update expense
PUT https://localhost:7262/api/expenses/1 HTTP/1.1
Content-Type: application/json

{
  "description": "Updated grocery",
  "amount": 30.99,
  "category": "Food"
}

### Delete expense
DELETE https://localhost:7262/api/expenses/1 HTTP/1.1
```

## Port Configuration

Default ports (may vary):

- **HTTPS:** `https://localhost:7262`
- **HTTP:** `http://localhost:5206`

To change ports, edit `Properties/launchSettings.json`

## Environment Variables

Set in `appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  },
  "AllowedHosts": "*"
}
```

## Debugging Tips

### Enable Debug Logging

Add to `appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft": "Warning"
    }
  }
}
```

### Set Breakpoints

- Click on line number in VS Code
- Press F5 to debug
- Step through code with F10 (step over) or F11 (step into)

### View Request/Response

- Use browser Developer Tools (F12)
- Check Network tab to see HTTP requests
- View headers and body data

## Troubleshooting

### "Port already in use"

```bash
# Find process using port
netstat -ano | findstr :7262

# Kill process (Windows)
taskkill /PID <PID> /F
```

### "Certificate not trusted"

```bash
# Trust HTTPS development certificate
dotnet dev-certs https --trust
```

### "Restore failed"

```bash
# Clear NuGet cache
dotnet nuget locals all --clear

# Restore packages
dotnet restore
```

## Database Migration (Future)

When integrating Entity Framework Core:

```bash
# Install EF Core tools
dotnet tool install --global dotnet-ef

# Create migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update

# View migrations
dotnet ef migrations list
```

## Publishing

### Build for production

```bash
dotnet publish -c Release -o ./publish
```

### Deploy to Azure

```bash
az webapp up --runtime dotnet8 --sku F1
```
