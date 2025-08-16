#!/usr/bin/env python3
"""
Simple startup script for the Agentic Kanban Backend
"""

import uvicorn
from main import app

if __name__ == "__main__":
    print("🚀 Starting Agentic Kanban Backend...")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔍 ReDoc: http://localhost:8000/redoc")
    print("🌐 Server: http://localhost:8000")
    print("=" * 50)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
