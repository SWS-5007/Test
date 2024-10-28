
# Web APIs for CRUD Operations in .NET Core

## Project Setup

1. **Create a New .NET Core Web API Project**:

    ```bash
    dotnet new webapi -n AudioFileManagement
    ```

2. **Add Dependencies**:

    - **Entity Framework Core** for database operations:
        ```bash
        dotnet add package Microsoft.EntityFrameworkCore
        dotnet add package Microsoft.EntityFrameworkCore.SqlServer
        dotnet add package Microsoft.EntityFrameworkCore.Tools
        ```

    - **Install Swashbuckle** for API documentation:
        ```bash
        dotnet add package Swashbuckle.AspNetCore
        ```

3. **Configure Database Context**: Create a DbContext to manage the connection to the database and define the `AudioFiles` table schema.

---

## Step 1: Define Models

Define a model class `AudioFile` in the `Models` folder to represent the data structure for an audio file's metadata.

```csharp
namespace AudioFileManagement.Models
{
    public class AudioFile
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Album { get; set; }
        public string Singer { get; set; }
        public string Genre { get; set; }
        public int Duration { get; set; } // Duration in seconds
        public string FileKey { get; set; } // S3 file key
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
```

---

## Step 2: Create the Database Context

Define `AppDbContext` in the `Data` folder to interact with the database.

```csharp
using Microsoft.EntityFrameworkCore;
using AudioFileManagement.Models;

namespace AudioFileManagement.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<AudioFile> AudioFiles { get; set; }
    }
}
```

Add the connection string in `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=_SERVER;Database=AudioFileDb;User Id=_USER;Password=_PASSWORD;"
}
```

Update `Startup.cs` to add the DbContext:

```csharp
services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));
```

---

## Step 3: Implement the CRUD API

Create a controller `AudioFilesController` in the `Controllers` folder to define API endpoints for CRUD operations.

### 1. **GET** - Retrieve all audio files

```csharp
[HttpGet]
public async Task<ActionResult<IEnumerable<AudioFile>>> GetAudioFiles()
{
    return await _context.AudioFiles.ToListAsync();
}
```

### 2. **GET** - Retrieve an audio file by ID

```csharp
[HttpGet("{id}")]
public async Task<ActionResult<AudioFile>> GetAudioFile(int id)
{
    var audioFile = await _context.AudioFiles.FindAsync(id);
    if (audioFile == null) return NotFound();
    return audioFile;
}
```

### 3. **POST** - Create a new audio file

```csharp
[HttpPost]
public async Task<ActionResult<AudioFile>> CreateAudioFile(AudioFile audioFile)
{
    _context.AudioFiles.Add(audioFile);
    await _context.SaveChangesAsync();
    return CreatedAtAction(nameof(GetAudioFile), new { id = audioFile.Id }, audioFile);
}
```

### 4. **PUT** - Update an existing audio file

```csharp
[HttpPut("{id}")]
public async Task<IActionResult> UpdateAudioFile(int id, AudioFile audioFile)
{
    if (id != audioFile.Id) return BadRequest();
    _context.Entry(audioFile).State = EntityState.Modified;
    await _context.SaveChangesAsync();
    return NoContent();
}
```

### 5. **DELETE** - Delete an audio file

```csharp
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteAudioFile(int id)
{
    var audioFile = await _context.AudioFiles.FindAsync(id);
    if (audioFile == null) return NotFound();
    _context.AudioFiles.Remove(audioFile);
    await _context.SaveChangesAsync();
    return NoContent();
}
```

---

## Step 4: Enable Swagger for API Documentation

1. In `Startup.cs`, add Swagger to the services:

    ```csharp
    services.AddSwaggerGen();
    ```

2. Update the `Configure` method to use Swagger:

    ```csharp
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "AudioFileManagement API V1");
    });
    ```

3. Run the application and navigate to `/swagger` to view the API documentation.

---

## Summary

The API provides endpoints to perform CRUD operations on audio file metadata:

- **GET /api/audiofiles** - Retrieves all audio files.
- **GET /api/audiofiles/{id}** - Retrieves a single audio file by ID.
- **POST /api/audiofiles** - Creates a new audio file.
- **PUT /api/audiofiles/{id}** - Updates an existing audio file.
- **DELETE /api/audiofiles/{id}** - Deletes an audio file by ID.

---

Thanks.