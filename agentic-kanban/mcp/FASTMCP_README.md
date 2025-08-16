# Agentic Kanban FastMCP Server

A modern, clean MCP (Model Context Protocol) server built with FastMCP that provides agents with tools to interact with your kanban board backend.

## 🚀 **Why FastMCP?**

FastMCP is a modern, simplified approach to building MCP servers that offers:

- **🎯 Simpler Code** - Just use `@mcp.tool()` decorators
- **🔍 Automatic Type Inference** - From function signatures
- **✅ Built-in Validation** - Automatic parameter validation
- **🔄 Cleaner Async** - Better async/await patterns
- **📦 Less Boilerplate** - Focus on your tools, not MCP protocol details

## 🛠️ **Available Tools**

### 1. **`create_kanban_cards`**
Create one or more kanban cards with full metadata.

```python
@mcp.tool()
async def create_kanban_cards(
    cards: List[Dict[str, Any]]
) -> str:
```

**Example Usage:**
```json
{
  "cards": [
    {
      "title": "Implement User Authentication",
      "description": "Add JWT-based authentication system",
      "status": "in-progress",
      "order": 1,
      "tags": ["backend", "security"]
    }
  ]
}
```

### 2. **`get_all_kanban_cards`**
Retrieve all kanban cards with filtering and sorting options.

```python
@mcp.tool()
async def get_all_kanban_cards(
    include_completed: bool = True,
    status_filter: str = "all",
    sort_by: str = "order"
) -> str:
```

**Parameters:**
- `include_completed`: Whether to include completed cards
- `status_filter`: Filter by status (research, in-progress, done, blocked, planned, all)
- `sort_by`: Sort by (order, createdAt, updatedAt, title)

### 3. **`search_kanban_cards`**
Search for cards by title, description, or tags.

```python
@mcp.tool()
async def search_kanban_cards(
    query: str,
    status_filter: str = "all",
    tag_filter: Optional[List[str]] = None
) -> str:
```

**Example Usage:**
```json
{
  "query": "authentication",
  "status_filter": "in-progress",
  "tag_filter": ["backend"]
}
```

### 4. **`update_kanban_card`**
Update an existing card's properties.

```python
@mcp.tool()
async def update_kanban_card(
    card_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    status: Optional[str] = None,
    order: Optional[int] = None,
    tags: Optional[List[str]] = None,
    completed_at: Optional[str] = None
) -> str:
```

**Example Usage:**
```json
{
  "card_id": "card-123",
  "status": "done",
  "completed_at": "2024-01-16T15:30:00Z"
}
```

### 5. **`get_kanban_schema`**
Get information about the current card schema structure.

```python
@mcp.tool()
async def get_kanban_schema() -> str:
```

**Returns:** Schema information including properties, required fields, and status values.

### 6. **`get_kanban_stats`** 🆕
Get statistics about the current kanban board.

```python
@mcp.tool()
async def get_kanban_stats() -> str:
```

**Returns:** Board analytics including:
- Total card count
- Status distribution with percentages
- Top tags by usage
- Recent cards

## 📦 **Installation**

### 1. **Install FastMCP Dependencies**
```bash
cd jentic-summer-hackathon/agentic-kanban/backend
pip install -r fastmcp_requirements.txt
```

### 2. **Start Your Backend**
Make sure your main backend is running:
```bash
python run.py
```

### 3. **Run the FastMCP Server**
```bash
python fastmcp_server.py
```

## 🔧 **Configuration**

### **Backend API URL**
The FastMCP server connects to your backend at `http://localhost:8000` by default:

```python
BACKEND_BASE_URL = "http://localhost:8000"  # Change this if needed
```

### **API Timeout**
Set the timeout for API requests:
```python
API_TIMEOUT = 30  # seconds
```

## 🤖 **Agent Integration Examples**

### **Claude Desktop Integration**

Add this to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "agentic-kanban": {
      "command": "python",
      "args": ["/path/to/fastmcp_server.py"],
      "env": {
        "PYTHONPATH": "/path/to/backend"
      }
    }
  }
}
```

### **Other MCP Clients**

The server uses stdio communication, so it works with any MCP client that supports stdio servers.

## 📝 **Usage Examples**

### **Creating a Project Plan**
An agent can create a complete development project:

```
I need to create a project plan for a web application. Let me create kanban cards for each development phase.
```

The agent will use `create_kanban_cards` to create:
- Research & Planning card
- Frontend Development card
- Backend Development card
- Testing & QA card
- Deployment card

### **Getting Current Context**
An agent can retrieve all cards to understand the current state:

```
Let me get an overview of all the current tasks and their status to understand what needs to be done.
```

This uses `get_all_kanban_cards` to fetch the current board state.

### **Searching for Specific Work**
An agent can search for specific types of tasks:

```
Show me all the backend-related tasks that are currently in progress.
```

This uses `search_kanban_cards` with query "backend" and status filter "in-progress".

### **Getting Board Analytics**
An agent can get insights about the board:

```
Give me a summary of the current kanban board status and progress.
```

This uses `get_kanban_stats` to get comprehensive board analytics.

## 🔄 **FastMCP vs Standard MCP**

| Feature | Standard MCP | FastMCP |
|---------|--------------|---------|
| **Code Complexity** | High - lots of boilerplate | Low - simple decorators |
| **Type Handling** | Manual type definitions | Automatic inference |
| **Error Handling** | Manual implementation | Built-in |
| **Validation** | Manual schema definition | Automatic from types |
| **Maintenance** | Complex | Simple |
| **Learning Curve** | Steep | Gentle |

## 🧪 **Testing the FastMCP Server**

### **1. Run the Test Script**
```bash
python test_fastmcp.py
```

### **2. Test Tool Listing**
The server should respond to tool listing requests with the available tools.

### **3. Test Tool Execution**
Try creating a card and then retrieving all cards to verify the flow.

### **4. Check Logs**
The server provides detailed logging for debugging.

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Backend Not Running**
   - Error: "API request failed: Connection refused"
   - Solution: Start your backend with `python run.py`

2. **FastMCP Not Installed**
   - Error: "No module named 'fastmcp'"
   - Solution: Install with `pip install -r fastmcp_requirements.txt`

3. **Schema Loading Errors**
   - Error: "Schema file not found"
   - Solution: Ensure `card.schema.json` exists in the parent directory

### **Debug Mode**
Enable debug logging by modifying the logging level:
```python
logging.basicConfig(level=logging.DEBUG)
```

## 🔮 **Future Enhancements**

- **Real-time updates** via WebSocket
- **Card templates** for common task types
- **Bulk operations** for multiple cards
- **Advanced filtering** and analytics
- **Integration with other FastMCP servers**

## 📚 **FastMCP Benefits**

### **For Developers:**
- **Faster Development** - Less boilerplate code
- **Better Maintainability** - Cleaner, simpler code
- **Automatic Validation** - Built-in parameter validation
- **Type Safety** - Automatic type inference

### **For Agents:**
- **Better Tool Discovery** - Clear function signatures
- **Improved Error Handling** - Better error messages
- **Consistent Interface** - Standardized tool patterns
- **Enhanced Context** - Rich return values

## 🎯 **Use Cases**

### **Project Management Agents**
- Create comprehensive project plans
- Track task progress and dependencies
- Generate status reports and analytics

### **Development Agents**
- Plan development sprints and milestones
- Track bug fixes and feature requests
- Manage technical debt and refactoring

### **Research Agents**
- Organize research tasks and findings
- Track investigation progress and insights
- Manage knowledge base and documentation

### **Content Creation Agents**
- Plan content calendars and workflows
- Track writing progress and revisions
- Manage editorial processes and deadlines

## 🔗 **Integration with Your Workflow**

1. **Start your backend** (FastAPI + ChromaDB)
2. **Start the FastMCP server** (this file)
3. **Connect your agent** (Claude, GPT, etc.)
4. **Agent can now manage your kanban board intelligently!**

## 🎉 **Why FastMCP is Better**

- **🚀 10x Less Code** - Focus on your tools, not MCP protocol
- **🔍 Automatic Types** - No manual schema definitions
- **✅ Built-in Validation** - Automatic parameter checking
- **🔄 Modern Python** - Clean async/await patterns
- **📦 Easy Maintenance** - Simple, readable code

The FastMCP server provides a clean, modern interface between AI agents and your kanban system, enabling intelligent task management with minimal code complexity! 🎯
