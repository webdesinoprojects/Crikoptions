# Backend Service

## Getting Started

### Clone the Repository

```bash
git clone <repository-url>
cd <project-name>
```

### Install Dependencies

```bash
go mod tidy
```

### Configure Environment Variables

Create a `.env` file in the project root and add the required environment variables.

Example:

```env
PORT=3000
```

### Run the Application

```bash
go run ./cmd/api
```

The server will start on the configured port.

### Build the Application

```bash
go build -o server ./cmd/api
```

### Run the Executable

#### Windows

```powershell
.\server.exe
```

#### Linux / macOS

```bash
./server
```

### Health Check

```bash
curl http://localhost:3000/health
```

Expected Response:

```json
{
  "status": "ok"
}
```
