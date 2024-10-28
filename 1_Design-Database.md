# Database Design for Audio File Storage and Streaming Application

## Database Overview

1. **AudioFiles**: Stores metadata for each audio file.
2. **Users**: Manages user information and access roles (Admin/User).
3. **StreamingLogs**: Records each streaming activity for usage analytics.

These tables are designed to manage audio file metadata and user roles and to track streaming activity.

---

## Table Structure and Design

### 1. **AudioFiles Table**

The `AudioFiles` table stores metadata for each audio file and a reference to its physical location in AWS S3.

- **Columns**:
  - `Id` (INT, Primary Key): Unique identifier for each audio file.
  - `Title` (NVARCHAR): The name of the audio track.
  - `Album` (NVARCHAR): The album the track belongs to.
  - `Singer` (NVARCHAR): The artist or performer of the audio track.
  - `Genre` (NVARCHAR): The genre of the audio file (e.g., Pop, Rock, Jazz).
  - `Duration` (INT): Length of the audio file in seconds.
  - `FileKey` (NVARCHAR): The unique key identifying the file’s location in AWS S3.
  - `CreatedAt` (DATETIME): Timestamp of when the record was created.
  - `UpdatedAt` (DATETIME): Timestamp of the last update to the record.

- **Purpose**:
  The `AudioFiles` table allows efficient storage and retrieval of each audio file's metadata and provides a reference to the S3 location of the file.

```sql
CREATE TABLE AudioFiles (
    Id INT PRIMARY KEY IDENTITY,
    Title NVARCHAR(255) NOT NULL,
    Album NVARCHAR(255),
    Singer NVARCHAR(255),
    Genre NVARCHAR(100),
    Duration INT,                   -- in seconds
    FileKey NVARCHAR(500) NOT NULL, -- S3 object key
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
)
```

### 2. Users Table

The `Users` table manages information about users of the system, specifically admins and regular users..

- **Columns**:
  - `Id` (INT, Primary Key): Unique identifier for each user.
  - `Username` (NVARCHAR, Unique): Username for authentication.
  - `PasswordHash` (NVARCHAR): Hashed password for user security..
  - `Role` (NVARCHAR): Defines the user role as either `Admin` or `User`.
  - `CreatedAt` (DATETIME): Timestamp of when the record was created.

- **Purpose**:
   The `Users` table supports authentication and authorization, enabling role-based access. Admins can manage audio files, while regular users have streaming access.

```sql
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(50) CHECK (Role IN ('Admin', 'User')),
    CreatedAt DATETIME DEFAULT GETDATE()
);
```

### 3. StreamingLogs Table

The `StreamingLogs` table logs each time an audio file is accessed by a user. This data is useful for analyzing usage patterns and tracking streaming events.

- **Columns**:
  - `Id` (INT, Primary Key): Unique identifier for each streaming log entry.
  - `AudioFileId` (INT, Foreign Key): References Id in the AudioFiles table.
  - `UserId` (INT, Foreign Key): References `Id` in the `Users` table.
  - `Role` (NVARCHAR): Defines the user role as either `Admin` or `User`.
  - `StreamedAt` (DATETIME): Timestamp of when the audio file was accessed.

- **Purpose**:
   The `StreamingLogs` table provides a record of streaming activity, enabling analysis of popular audio files and user engagement.

```sql
CREATE TABLE StreamingLogs (
    Id INT PRIMARY KEY IDENTITY,
    AudioFileId INT FOREIGN KEY REFERENCES AudioFiles(Id),
    UserId INT FOREIGN KEY REFERENCES Users(Id),
    StreamedAt DATETIME DEFAULT GETDATE()
);
```

### Relationships Between Tables

  - `AudioFiles to StreamingLogs:` A one-to-many relationship where each audio file can have multiple streaming logs.
  - `Users to StreamingLogs:` A one-to-many relationship where each user can have multiple streaming logs.


## Sample Data Insertion (for Testing)
```
-- Insert Sample Audio File
INSERT INTO AudioFiles (Title, Album, Singer, Genre, Duration, FileKey)
VALUES ('Sample Song', 'Sample Album', 'Sample Artist', 'Pop', 210, 's3/sample-song.mp3');

-- Insert Sample User (Admin Role)
INSERT INTO Users (Username, PasswordHash, Role)
VALUES ('admin', 'hashed_password_here', 'Admin');

-- Insert Sample Streaming Log
INSERT INTO StreamingLogs (AudioFileId, UserId)
VALUES (1, 1);
```

---

Thanks.