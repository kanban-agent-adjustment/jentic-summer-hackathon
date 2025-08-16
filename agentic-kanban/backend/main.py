from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List
import uvicorn
import logging
import traceback
import sys
from datetime import datetime

from models import Card, CardList, CardUpdate, CardResponse, CardsResponse, reload_models, dynamic_models
from database import CardDatabase

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('backend.log')
    ]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Agentic Kanban Backend",
    description="Backend API for managing kanban board cards",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
try:
    db = CardDatabase()
    logger.info("Database initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize database: {e}")
    logger.error(traceback.format_exc())
    db = None


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler to catch all unhandled errors"""
    error_msg = f"Unhandled error: {str(exc)}"
    logger.error(f"Global exception handler caught: {error_msg}")
    logger.error(f"Request: {request.method} {request.url}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "error": error_msg,
            "timestamp": datetime.now().isoformat()
        }
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with logging"""
    logger.warning(f"HTTP exception: {exc.status_code} - {exc.detail}")
    logger.warning(f"Request: {request.method} {request.url}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.now().isoformat()
        }
    )


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware to log all requests and responses"""
    start_time = datetime.now()
    
    # Log request
    logger.info(f"Request: {request.method} {request.url}")
    if request.query_params:
        logger.info(f"Query params: {dict(request.query_params)}")
    
    try:
        response = await call_next(request)
        
        # Log response
        process_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"Response: {response.status_code} - {process_time:.3f}s")
        
        return response
        
    except Exception as e:
        # Log any errors in middleware
        process_time = (datetime.now() - start_time).total_seconds()
        logger.error(f"Middleware error: {str(e)} - {process_time:.3f}s")
        logger.error(traceback.format_exc())
        raise


@app.get("/")
async def root():
    """Health check endpoint"""
    logger.info("Health check endpoint called")
    try:
        return {"message": "Agentic Kanban Backend is running!"}
    except Exception as e:
        logger.error(f"Error in health check: {e}")
        logger.error(traceback.format_exc())
        raise


@app.get("/api/schema")
async def get_schema_info():
    """Get information about the current JSON schema"""
    logger.info("Schema info endpoint called")
    try:
        if not dynamic_models:
            raise HTTPException(status_code=500, detail="Dynamic models not initialized")
        
        schema_info = dynamic_models.get_schema_info()
        logger.info(f"Schema info retrieved successfully: {len(schema_info)} properties")
        
        return {
            "success": True,
            "message": "Schema information retrieved successfully",
            "data": schema_info
        }
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Failed to get schema info: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/api/schema/reload")
async def reload_schema():
    """Reload the schema and regenerate models"""
    logger.info("Schema reload endpoint called")
    try:
        if not dynamic_models:
            raise HTTPException(status_code=500, detail="Dynamic models not initialized")
        
        reload_models()
        logger.info("Schema reloaded successfully")
        
        return {
            "success": True,
            "message": "Schema reloaded successfully",
            "data": {
                "message": "All models have been regenerated from the schema file"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Failed to reload schema: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/api/cards", response_model=CardResponse)
async def put_cards(card_list: CardList):
    """
    Add multiple cards to the database
    
    Args:
        card_list: List of cards to add
        
    Returns:
        Success response with message
    """
    logger.info(f"PUT cards endpoint called with {len(card_list.cards)} cards")
    logger.debug(f"Card list: {card_list}")
    try:
        if not db:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        # Add cards to database
        card_ids = db.add_cards(card_list.cards)
        logger.info(f"Successfully added {len(card_ids)} cards to database")
        
        return CardResponse(
            success=True,
            message=f"Successfully added {len(card_ids)} cards",
            data=None
        )
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Failed to add cards: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_msg)


@app.get("/api/cards", response_model=CardsResponse)
async def get_cards():
    """
    Retrieve all cards from the database
    
    Returns:
        List of all cards
    """
    logger.info("GET cards endpoint called")
    try:
        if not db:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        cards = db.get_all_cards()
        logger.info(f"Successfully retrieved {len(cards)} cards from database")
        
        return CardsResponse(
            success=True,
            message=f"Successfully retrieved {len(cards)} cards",
            data=cards
        )
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Failed to retrieve cards: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_msg)


@app.put("/api/cards/{card_id}", response_model=CardResponse)
async def update_card(card_id: str, updates: CardUpdate):
    """
    Update a specific card in the database
    
    Args:
        card_id: ID of the card to update
        updates: Fields to update
        
    Returns:
        Updated card data
    """
    logger.info(f"UPDATE card endpoint called for card_id: {card_id}")
    try:
        if not db:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        # Check if card exists
        existing_card = db.get_card_by_id(card_id)
        if not existing_card:
            error_msg = f"Card with ID {card_id} not found"
            logger.warning(error_msg)
            raise HTTPException(status_code=404, detail=error_msg)
        
        # Update the card
        updated_card = db.update_card(card_id, updates)
        if not updated_card:
            error_msg = "Failed to update card"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
        
        logger.info(f"Successfully updated card {card_id}")
        return CardResponse(
            success=True,
            message="Card updated successfully",
            data=updated_card
        )
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Failed to update card: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_msg)


@app.get("/api/cards/{card_id}", response_model=CardResponse)
async def get_card(card_id: str):
    """
    Get a specific card by ID
    
    Args:
        card_id: ID of the card to retrieve
        
    Returns:
        Card data
    """
    logger.info(f"GET single card endpoint called for card_id: {card_id}")
    try:
        if not db:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        card = db.get_card_by_id(card_id)
        if not card:
            error_msg = f"Card with ID {card_id} not found"
            logger.warning(error_msg)
            raise HTTPException(status_code=404, detail=error_msg)
        
        logger.info(f"Successfully retrieved card {card_id}")
        return CardResponse(
            success=True,
            message="Card retrieved successfully",
            data=card
        )
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Failed to retrieve card: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_msg)


@app.delete("/api/cards/{card_id}")
async def delete_card(card_id: str):
    """
    Delete a specific card from the database
    
    Args:
        card_id: ID of the card to delete
        
    Returns:
        Success message
    """
    logger.info(f"DELETE card endpoint called for card_id: {card_id}")
    try:
        if not db:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        # Check if card exists
        existing_card = db.get_card_by_id(card_id)
        if not existing_card:
            error_msg = f"Card with ID {card_id} not found"
            logger.warning(error_msg)
            raise HTTPException(status_code=404, detail=error_msg)
        
        # Delete the card
        success = db.delete_card(card_id)
        if not success:
            error_msg = "Failed to delete card"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
        
        logger.info(f"Successfully deleted card {card_id}")
        return {"message": "Card deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Failed to delete card: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_msg)


if __name__ == "__main__":
    logger.info("Starting Agentic Kanban Backend...")
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        logger.error(traceback.format_exc())
        sys.exit(1)
