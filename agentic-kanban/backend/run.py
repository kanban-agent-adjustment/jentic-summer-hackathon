#!/usr/bin/env python3
"""
Simple startup script for the Agentic Kanban Backend
"""

import uvicorn
import logging
import sys
import traceback
from main import app

# Configure logging for the startup script
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def main():
    """Main startup function with error handling"""
    try:
        logger.info("🚀 Starting Agentic Kanban Backend...")
        logger.info("📖 API Documentation: http://localhost:8000/docs")
        logger.info("🔍 ReDoc: http://localhost:8000/redoc")
        logger.info("🌐 Server: http://localhost:8000")
        logger.info("📝 Logs will be written to both console and backend.log")
        logger.info("=" * 50)
        
        # Start the server
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
        
    except KeyboardInterrupt:
        logger.info("🛑 Server stopped by user (Ctrl+C)")
    except Exception as e:
        logger.error(f"❌ Failed to start server: {e}")
        logger.error("Full traceback:")
        logger.error(traceback.format_exc())
        sys.exit(1)

if __name__ == "__main__":
    main()
