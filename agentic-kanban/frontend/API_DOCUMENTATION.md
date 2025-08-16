# Agentic Kanban Backend API Documentation

## Overview
Complete API documentation for the Agentic Kanban Backend with all endpoints, request/response formats.

## Base Configuration
- **Base URL**: `http://localhost:8000`
- **Content-Type**: `application/json`
- **CORS**: Enabled for all origins (development)

---

## API Endpoints

### 1. Health Check
**GET** `/`

**Response:**
```json
{
  "message": "Agentic Kanban Backend is running!"
}
```

---

### 2. Get Schema Information
**GET** `/api/schema`

**Response:**
```json
{
  "success": true,
  "message": "Schema information retrieved successfully",
  "data": {
    "title": "CardList",
    "description": "Schema for a list of cards with metadata and status",
    "card_properties": [
      "id", "title", "description", "status", "order", 
      "tags", "createdAt", "updatedAt", "completedAt"
    ],
    "required_fields": [
      "id", "title", "description", "status", "order", 
      "createdAt", "updatedAt"
    ],
    "status_values": [
      "research", "in-progress", "done", "blocked", "planned"
    ],
    "schema_file": "../card.schema.json",
    "last_modified": 1234567890
  }
}
```

---

### 3. Reload Schema
**POST** `/api/schema/reload`

**Response:**
```json
{
  "success": true,
  "message": "Schema reloaded successfully",
  "data": {
    "message": "All models have been regenerated from the schema file"
  }
}
```

---

### 4. Create Multiple Cards
**POST** `/api/cards`

**Request Body:**
```json
{
  "cards": [
    {
      "id": "card-1",
      "title": "Implement Login Feature",
      "description": "Create user authentication system with JWT tokens",
      "status": "in-progress",
      "order": 1,
      "tags": ["frontend", "auth", "security"],
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    },
    {
      "id": "card-2",
      "title": "Design Database Schema",
      "description": "Plan and implement the database structure",
      "status": "done",
      "order": 2,
      "tags": ["backend", "database", "architecture"],
      "createdAt": "2024-01-14T09:00:00Z",
      "updatedAt": "2024-01-15T11:00:00Z",
      "completedAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully added 2 cards",
  "data": null
}
```

---

### 5. Get All Cards
**GET** `/api/cards`

**Response:**
```json
{
  "success": true,
  "message": "Successfully retrieved 2 cards",
  "data": [
    {
      "id": "card-1",
      "title": "Implement Login Feature",
      "description": "Create user authentication system with JWT tokens",
      "status": "in-progress",
      "order": 1,
      "tags": ["frontend", "auth", "security"],
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "completedAt": null
    },
    {
      "id": "card-2",
      "title": "Design Database Schema",
      "description": "Plan and implement the database structure",
      "status": "done",
      "order": 2,
      "tags": ["backend", "database", "architecture"],
      "createdAt": "2024-01-14T09:00:00Z",
      "updatedAt": "2024-01-15T11:00:00Z",
      "completedAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

---

### 6. Get Single Card
**GET** `/api/cards/{card_id}`

**Response:**
```json
{
  "success": true,
  "message": "Card retrieved successfully",
  "data": {
    "id": "card-1",
    "title": "Implement Login Feature",
    "description": "Create user authentication system with JWT tokens",
    "status": "in-progress",
    "order": 1,
    "tags": ["frontend", "auth", "security"],
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "completedAt": null
  }
}
```

---

### 7. Update Card
**PUT** `/api/cards/{card_id}`

**Request Body:**
```json
{
  "title": "Updated Login Feature",
  "status": "done",
  "description": "Login feature completed with OAuth integration",
  "order": 3,
  "tags": ["frontend", "auth", "security", "completed"],
  "completedAt": "2024-01-16T15:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Card updated successfully",
  "data": {
    "id": "card-1",
    "title": "Updated Login Feature",
    "description": "Login feature completed with OAuth integration",
    "status": "done",
    "order": 3,
    "tags": ["frontend", "auth", "security", "completed"],
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-16T15:30:00Z",
    "completedAt": "2024-01-16T15:30:00Z"
  }
}
```

---

### 8. Delete Card
**DELETE** `/api/cards/{card_id}`

**Response:**
```json
{
  "message": "Card deleted successfully"
}
```

---

## Data Models

### Card Object Structure
```json
{
  "id": "string",                    // Required: Unique identifier
  "title": "string",                 // Required: Card title
  "description": "string",           // Required: Card description
  "status": "string",                // Required: One of: "research", "in-progress", "done", "blocked", "planned"
  "order": "integer",                // Required: Position in list
  "createdAt": "string",             // Required: ISO 8601 datetime
  "updatedAt": "string",             // Required: ISO 8601 datetime
  "tags": ["string"],                // Optional: Array of tags
  "completedAt": "string"            // Optional: ISO 8601 datetime (when status = "done")
}
```

### Response Models
```json
{
  "success": "boolean",
  "message": "string",
  "data": "object | array | null"
}
```

---

## Error Responses

### Error Response Format
```json
{
  "success": false,
  "message": "string",
  "status_code": "integer",
  "error": "string",
  "timestamp": "string"
}
```

### Common Error Examples

**404 Not Found:**
```json
{
  "success": false,
  "message": "Card with ID card-999 not found",
  "status_code": 404,
  "timestamp": "2024-01-16T15:30:00Z"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed",
  "timestamp": "2024-01-16T15:30:00Z"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error",
  "status_code": 400,
  "timestamp": "2024-01-16T15:30:00Z"
}
```

---

## Status Values
Available status values for cards:
- `"research"` - Initial research phase
- `"in-progress"` - Currently being worked on
- `"done"` - Completed
- `"blocked"` - Blocked by external factors
- `"planned"` - Planned but not started

---

## Testing Commands

### Using curl
```bash
# Health check
curl http://localhost:8000/

# Get all cards
curl http://localhost:8000/api/cards

# Create cards
curl -X POST http://localhost:8000/api/cards \
  -H "Content-Type: application/json" \
  -d '{"cards":[{"id":"test-1","title":"Test","description":"Test card","status":"planned","order":1,"createdAt":"2024-01-16T10:00:00Z","updatedAt":"2024-01-16T10:00:00Z"}]}'

# Update card
curl -X PUT http://localhost:8000/api/cards/test-1 \
  -H "Content-Type: application/json" \
  -d '{"status":"in-progress"}'

# Delete card
curl -X DELETE http://localhost:8000/api/cards/test-1
```

---

## Development Notes

### Schema Validation
- Backend uses dynamic Pydantic models generated from `card.schema.json`
- Schema can be reloaded at runtime using `/api/schema/reload`
- All requests are validated against the schema

### Database
- Uses ChromaDB for vector storage
- Cards are stored with metadata for semantic search capabilities
- Automatic indexing of card content

### Logging
- Comprehensive logging for all requests and responses
- Logs stored in `backend.log`
- Debug level logging available

### CORS
- Currently allows all origins (development mode)
- Should be configured for specific origins in production

---

*Last updated: January 2024*
*API Version: 1.0.0*
