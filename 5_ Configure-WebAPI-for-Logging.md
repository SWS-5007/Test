
# Configuring WebAPI for Logging, Exception Handling, and Authorization via JWT

## Step 1: Configure Logging with Serilog

Serilog is a structured logging library for .NET that provides advanced logging capabilities.

1. **Install Serilog and Related Packages**:

    ```bash
    dotnet add package Serilog.AspNetCore
    dotnet add package Serilog.Sinks.Console
    dotnet add package Serilog.Sinks.File
    ```

2. **Configure Serilog in `Program.cs`**:

    ```csharp
    using Serilog;

    var builder = WebApplication.CreateBuilder(args);

    // Add Serilog configuration
    Log.Logger = new LoggerConfiguration()
        .WriteTo.Console()
        .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day)
        .CreateLogger();

    builder.Host.UseSerilog();
    ```

3. **Use Serilog for Logging in Controllers**:

    Inject `ILogger` into  controller, then use it to log information, errors, or warnings.

    ```csharp
    private readonly ILogger<AudioFilesController> _logger;

    public AudioFilesController(ILogger<AudioFilesController> logger)
    {
        _logger = logger;
    }

    public IActionResult Get()
    {
        _logger.LogInformation("Fetching all audio files.");
        return Ok();
    }
    ```

---

## Step 2: Implement Global Exception Handling Middleware

Centralized exception handling ensures that all unhandled exceptions are logged and returned in a consistent response format.

1. **Create Middleware for Exception Handling**:

    ```csharp
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred.");
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                await context.Response.WriteAsync("An unexpected error occurred.");
            }
        }
    }
    ```

2. **Register the Middleware**:

    Add the middleware in `Program.cs`.

    ```csharp
    var app = builder.Build();

    app.UseMiddleware<ExceptionHandlingMiddleware>();
    ```

---

## Step 3: Configure JWT Authentication

JWT (JSON Web Token) is a secure way to authorize users, allowing access based on a signed token.

1. **Install JWT Authentication Package**:

    ```bash
    dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
    ```

2. **Add JWT Authentication Settings in `appsettings.json`**:

    ```json
    "Jwt": {
      "Key": "SecretKeyHere",  // Replace with a strong secret key
      "Issuer": "Issuer",
      "Audience": "Audience"
    }
    ```

3. **Configure JWT Authentication in `Program.cs`**:

    ```csharp
    using Microsoft.IdentityModel.Tokens;
    using System.Text;

    var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>();
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key))
        };
    });

    builder.Services.AddAuthorization();
    ```

4. **Secure Endpoints with Authorization**:

    Add the `[Authorize]` attribute to any controller or action method that requires authorization.

    ```csharp
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AudioFilesController : ControllerBase
    {
        // Controller actions here
    }
    ```

---

## Step 4: Generating JWT Tokens

Create a helper method to generate JWT tokens upon user authentication.

1. **Token Generation Code**:

    ```csharp
    using Microsoft.IdentityModel.Tokens;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;

    public string GenerateJwtToken(User user, IConfiguration config)
    {
        var jwtSettings = config.GetSection("Jwt").Get<JwtSettings>();

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtSettings.Issuer,
            audience: jwtSettings.Audience,
            claims: claims,
            expires: DateTime.Now.AddMinutes(30),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    ```

---

Thanks.