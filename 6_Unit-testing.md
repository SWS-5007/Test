
# Setting Up Unit Tests for .NET Core Web API

## Step 1: Add a Unit Test Project

1. Navigate to the solution directory in the terminal.
2. Add a new xUnit test project:

    ```bash
    dotnet new xunit -o AudioFileManagement.Tests
    ```

3. Add a reference to the main Web API project:

    ```bash
    dotnet add AudioFileManagement.Tests/AudioFileManagement.Tests.csproj reference AudioFileManagement/AudioFileManagement.csproj
    ```

4. **Install Mocking Framework**: Install Moq to mock dependencies.

    ```bash
    dotnet add AudioFileManagement.Tests package Moq
    ```

5. Update the `AudioFileManagement.Tests.csproj` file if additional dependencies like Entity Framework Core In-Memory are needed for testing database interactions.

---

## Step 2: Define Test Structure

Organize test files by feature or controller for a clean structure. For example:

```
AudioFileManagement.Tests/
│
├── Controllers/
│   └── AudioFilesControllerTests.cs
└── Services/
    └── AudioFileServiceTests.cs
```

---

## Step 3: Writing Unit Tests for Controllers

In the `AudioFilesControllerTests.cs` file, write tests for each action method in the `AudioFilesController`. Use Moq to mock dependencies and test each method's behavior independently.

### Sample Test Cases

1. **GET - Retrieve All Audio Files**

    ```csharp
    using Moq;
    using Xunit;
    using Microsoft.AspNetCore.Mvc;
    using AudioFileManagement.Controllers;
    using AudioFileManagement.Data;
    using AudioFileManagement.Models;
    using Microsoft.Extensions.Logging;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public class AudioFilesControllerTests
    {
        private readonly Mock<IAudioFileService> _mockService;
        private readonly AudioFilesController _controller;

        public AudioFilesControllerTests()
        {
            _mockService = new Mock<IAudioFileService>();
            _controller = new AudioFilesController(_mockService.Object);
        }

        [Fact]
        public async Task GetAudioFiles_ReturnsOkResult_WithListOfAudioFiles()
        {
            // Arrange
            _mockService.Setup(service => service.GetAudioFilesAsync())
                        .ReturnsAsync(new List<AudioFile> { new AudioFile { Id = 1, Title = "Test Song" } });

            // Act
            var result = await _controller.GetAudioFiles();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var audioFiles = Assert.IsType<List<AudioFile>>(okResult.Value);
            Assert.Single(audioFiles);
        }
    }
    ```

2. **POST - Add New Audio File**

    ```csharp
    [Fact]
    public async Task CreateAudioFile_ReturnsCreatedAtAction_WithAudioFile()
    {
        // Arrange
        var audioFile = new AudioFile { Title = "New Song" };
        _mockService.Setup(service => service.CreateAudioFileAsync(audioFile))
                    .ReturnsAsync(audioFile);

        // Act
        var result = await _controller.CreateAudioFile(audioFile);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal("New Song", ((AudioFile)createdResult.Value).Title);
    }
    ```

---

## Step 4: Writing Unit Tests for Service Layer

Testing service layer methods ensures business logic functions as expected. Mock dependencies to isolate service logic from external dependencies.

### Sample Service Test Case

```csharp
public class AudioFileServiceTests
{
    private readonly Mock<IAudioFileRepository> _mockRepository;
    private readonly AudioFileService _service;

    public AudioFileServiceTests()
    {
        _mockRepository = new Mock<IAudioFileRepository>();
        _service = new AudioFileService(_mockRepository.Object);
    }

    [Fact]
    public async Task GetAudioFileById_ReturnsAudioFile()
    {
        // Arrange
        var audioFileId = 1;
        _mockRepository.Setup(repo => repo.GetAudioFileByIdAsync(audioFileId))
                       .ReturnsAsync(new AudioFile { Id = audioFileId, Title = "Test Song" });

        // Act
        var result = await _service.GetAudioFileByIdAsync(audioFileId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Test Song", result.Title);
    }
}
```

---

## Step 5: Run Tests and Check Code Coverage

1. **Run Tests**:

    ```bash
    dotnet test AudioFileManagement.Tests
    ```

2. **Check Code Coverage**:

    Use the `coverlet` tool to measure code coverage.

    ```bash
    dotnet tool install --global coverlet.console
    dotnet test AudioFileManagement.Tests --collect:"XPlat Code Coverage"
    ```

3. **Generate Coverage Report**:

    ```bash
    reportgenerator "-reports:AudioFileManagement.Tests/coverage.cobertura.xml" "-targetdir:CoverageReport"
    ```

4. **Analyze Coverage**: Open `CoverageReport/index.html` to view the coverage report. Aim to achieve 70% or higher coverage by testing controllers and services thoroughly.

---

Thanks.