# Agentic Kanban Backend

A FastAPI-based backend for managing kanban board cards using ChromaDB for storage. **Now with dynamic schema loading!**

## ✨ **Key Features**

- **🔄 Dynamic Schema Loading** - Automatically reads from `card.schema.json` and generates models
- **📝 Schema Hot-Reload** - Reload schema changes without restarting the server
- **🗄️ ChromaDB Storage** - Persistent, fast vector-based storage
- **🔍 Schema Information** - Get current schema details via API
- **✅ Automatic Validation** - Models automatically validate against your schema

## 🚀 **Your 3 Required APIs:**

1. **`PUT /api/cards`** - Add multiple cards to the database
2. **`GET /api/cards`** - Retrieve all cards from the database  
3. **`PUT /api/cards/{card_id}`** - Update card status and other fields

## 🆕 **New Schema Management APIs:**

4. **`GET /api/schema`** - Get current schema information
5. **`POST /api/schema/reload`** - Reload schema and regenerate models

## 🏗️ **How Dynamic Schema Works**

The backend automatically:
1. **Reads** your `card.schema.json` file on startup
2. **Generates** Pydantic models dynamically from the schema
3. **Validates** all incoming data against your current schema
4. **Updates** models when you call the reload endpoint

**No more manual model updates when you change the schema!**

## 📁 **Setup & Running:**

1. **Install dependencies:**
   ```bash
   cd jentic-summer-hackathon/agentic-kanban/backend
   pip install -r requirements.txt
   ```

2. **Start the server:**
   ```bash
   python run.py
   # or
   python main.py
   ```

3. **Access API docs:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## 🧪 **Testing:**

Run the test script to verify everything works:
```bash
python test_api.py
```

## 🔄 **Schema Hot-Reload Workflow:**

1. **Edit** your `card.schema.json` file
2. **Call** `POST /api/schema/reload` 
3. **Models automatically regenerate** with new schema
4. **No server restart needed!**

## 📊 **Schema Information Endpoint:**

```bash
curl http://localhost:8000/api/schema
```

**Response:**
```json
{
  "success": true,
  "message": "Schema information retrieved successfully",
  "data": {
    "title": "CardList",
    "description": "Schema for a list of cards with metadata and status",
    "card_properties": ["id", "title", "description", "status", "order", "tags", "createdAt", "updatedAt", "completedAt"],
    "required_fields": ["id", "title", "description", "status", "order", "tags", "createdAt", "updatedAt"],
    "status_values": ["research", "in-progress", "done", "blocked", "planned"],
    "schema_file": "/path/to/card.schema.json",
    "last_modified": 1705123456.789
  }
}
```

## 🗄️ **Database Features:**

- **ChromaDB** provides persistent storage (data survives restarts)
- **Automatic ID generation** and timestamp management
- **Fast retrieval** and updates
- **Data stored** in `./chroma_db` directory
- **Schema-aware** - automatically handles new/removed fields

## 🔧 **Additional Features:**

- **CORS enabled** for frontend integration
- **Error handling** with proper HTTP status codes
- **Data validation** using dynamically generated Pydantic models
- **Automatic timestamps** for created/updated fields
- **Status enum** automatically generated from your schema

## 📁 **Project Structure**

```
backend/
├── main.py              # FastAPI application and endpoints
├── models.py            # Dynamic Pydantic model generator
├── schema_loader.py     # JSON schema file loader and parser
├── database.py          # ChromaDB integration and operations
├── requirements.txt     # Python dependencies
├── test_api.py          # Comprehensive API testing
├── run.py               # Startup script
└── README.md            # This file
```

## 🔄 **Development Workflow**

1. **Edit** `../card.schema.json` (add/remove fields, change types, etc.)
2. **Call** `POST /api/schema/reload` to regenerate models
3. **Test** with your updated schema
4. **No code changes needed!**

## 🚨 **Important Notes**

- **Schema file path**: The backend looks for `../card.schema.json` relative to the backend directory
- **Hot reload**: Models are regenerated in memory, no server restart needed
- **Backward compatibility**: Existing data in ChromaDB will work with new schemas
- **Validation**: All incoming data is automatically validated against current schema

## 🧪 **Example Usage with curl**

### Get current schema info
```bash
curl "http://localhost:8000/api/schema"
```

### Reload schema after changes
```bash
curl -X POST "http://localhost:8000/api/schema/reload"
```

### Add cards (automatically validated against current schema)
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

## 🎯 **Benefits of Dynamic Schema**

- **🔄 Zero downtime** when updating schema
- **📝 Single source of truth** - your JSON schema file
- **✅ Automatic validation** - no manual model updates
- **🚀 Faster development** - change schema, reload, test immediately
- **🔄 Live updates** - frontend can query current schema structure
- **🛡️ Type safety** - Pydantic models automatically generated with correct types

The backend is now **production-ready** with **zero-maintenance schema management**! 🎉
