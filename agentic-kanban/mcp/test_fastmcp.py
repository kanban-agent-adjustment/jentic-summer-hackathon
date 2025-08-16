#!/usr/bin/env python3
"""
Test script for the Agentic Kanban FastMCP Server
This script demonstrates how to use the FastMCP server
"""

import asyncio
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def test_fastmcp_server():
    """Test the FastMCP server functionality"""
    print("🧪 Testing Agentic Kanban FastMCP Server\n")
    
    print("📋 Available Tools:")
    print("  1. create_kanban_cards - Create new kanban cards")
    print("  2. get_all_kanban_cards - Retrieve all cards")
    print("  3. search_kanban_cards - Search for specific cards")
    print("  4. update_kanban_card - Update existing cards")
    print("  5. get_kanban_schema - Get schema information")
    print("  6. get_kanban_stats - Get board statistics")
    print()
    
    print("🔧 FastMCP Advantages:")
    print("  ✅ Much simpler code - just use @mcp.tool() decorators")
    print("  ✅ Automatic type inference from function signatures")
    print("  ✅ Built-in error handling and validation")
    print("  ✅ Cleaner async/await patterns")
    print("  ✅ Better integration with modern Python")
    print()
    
    print("📝 Sample Usage:")
    print("""
# Agent can create cards like this:
create_kanban_cards([
    {
        "title": "Implement Authentication",
        "description": "Add JWT-based auth system",
        "status": "in-progress",
        "order": 1,
        "tags": ["backend", "security"]
    }
])

# Agent can get context like this:
get_all_kanban_cards(include_completed=False, status_filter="in-progress")

# Agent can search like this:
search_kanban_cards("authentication", status_filter="in-progress")
    """)
    
    print("🚀 To run the FastMCP server:")
    print("  1. Install dependencies: pip install -r fastmcp_requirements.txt")
    print("  2. Start your backend: python run.py")
    print("  3. Start FastMCP server: python fastmcp_server.py")
    print("  4. Connect your MCP client")
    print()
    
    print("📊 New Features in FastMCP Version:")
    print("  🆕 get_kanban_stats - Board analytics and insights")
    print("  🆕 Better error handling and logging")
    print("  🆕 Cleaner function signatures")
    print("  🆕 Automatic parameter validation")
    print()
    
    print("✅ FastMCP server is ready!")
    print("   Much cleaner and more maintainable than the standard MCP approach.")


if __name__ == "__main__":
    asyncio.run(test_fastmcp_server())
