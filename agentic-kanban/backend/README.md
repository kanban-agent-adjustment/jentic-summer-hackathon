# Agentic Kanban Backend

A FastAPI-based backend for managing kanban board cards using ChromaDB for storage.

## Features

- **PUT /api/cards** - Add multiple cards to the database
- **GET /api/cards** - Retrieve all cards from the database
- **PUT /api/cards/{card_id}** - Update a specific card (status, title, description, etc.)
- **GET /api/cards/{card_id}** - Get a specific card by ID
- **DELETE /api/cards/{card_id}** - Delete a specific card

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the Backend

```bash
python main.py
```

The server will start on `http://localhost:8000`

### 3. Access API Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Endpoints

### PUT /api/cards
Add multiple cards to the database.

**Request Body:**
```json
{
  "cards": [
    {
      "id": "card-1",
      "title": "Implement User Authentication",
      "description": "Add JWT-based authentication system",
      "status": "in-progress",
      "order": 1,
      "tags": ["backend", "security"],
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully added 1 cards",
  "data": null
}
```

### GET /api/cards
Retrieve all cards from the database.

**Response:**
```json
{
  "success": true,
  "message": "Successfully retrieved 2 cards",
  "data": [
    {
      "id": "card-1",
      "title": "Implement User Authentication",
      "description": "Add JWT-based authentication system",
      "status": "in-progress",
      "order": 1,
      "tags": ["backend", "security"],
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "completedAt": null
    }
  ]
}
```

### PUT /api/cards/{card_id}
Update a specific card. Only provide the fields you want to update.

**Request Body:**
```json
{
  "status": "done",
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
    "title": "Implement User Authentication",
    "description": "Add JWT-based authentication system",
    "status": "done",
    "order": 1,
    "tags": ["backend", "security"],
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-16T15:30:00Z",
    "completedAt": "2024-01-16T15:30:00Z"
  }
}
```

## Card Status Values

- `research` - Card is in research phase
- `in-progress` - Card is currently being worked on
- `done` - Card is completed
- `blocked` - Card is blocked and cannot proceed
- `planned` - Card is planned but not started

## Database

The backend uses **ChromaDB** as the database, which provides:
- Persistent storage (data survives server restarts)
- Fast vector-based retrieval
- Simple document storage with metadata
- Automatic ID generation and management

Data is stored in the `./chroma_db` directory by default.

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `404` - Card not found
- `500` - Internal server error

All error responses include a descriptive message.

## Development

### Project Structure
```
backend/
├── main.py          # FastAPI application and endpoints
├── models.py        # Pydantic models for data validation
├── database.py      # ChromaDB integration and operations
├── requirements.txt # Python dependencies
└── README.md        # This file
```

### Adding New Endpoints

1. Add the endpoint function in `main.py`
2. Define request/response models in `models.py` if needed
3. Add database operations in `database.py` if needed
4. Update this README with the new endpoint documentation

### Testing

You can test the API using:
- The built-in Swagger UI at `/docs`
- Tools like Postman or curl
- The frontend application

## Example Usage with curl

### Add cards
```bash
curl -X POST "http://localhost:8000/api/cards" \
  -H "Content-Type: application/json" \
  -d '{
    "cards": [
      {
        "id": "task-1",
        "title": "Setup Project",
        "description": "Initialize the project structure",
        "status": "done",
        "order": 1,
        "tags": ["setup"],
        "createdAt": "2024-01-15T09:00:00Z",
        "updatedAt": "2024-01-15T09:00:00Z"
      }
    ]
  }'
```

### Get all cards
```bash
curl "http://localhost:8000/api/cards"
```

### Update a card
```bash
curl -X PUT "http://localhost:8000/api/cards/task-1" \
  -H "Content-Type: application/json" \
  -d '{"status": "in-progress"}'
```
