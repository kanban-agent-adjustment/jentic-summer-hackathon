from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uvicorn

from models import Card, CardList, CardUpdate, CardResponse, CardsResponse
from database import CardDatabase

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
db = CardDatabase()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Agentic Kanban Backend is running!"}


@app.post("/api/cards", response_model=CardResponse)
async def put_cards(card_list: CardList):
    """
    Add multiple cards to the database
    
    Args:
        card_list: List of cards to add
        
    Returns:
        Success response with message
    """
    try:
        # Add cards to database
        card_ids = db.add_cards(card_list.cards)
        
        return CardResponse(
            success=True,
            message=f"Successfully added {len(card_ids)} cards",
            data=None
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add cards: {str(e)}"
        )


@app.get("/api/cards", response_model=CardsResponse)
async def get_cards():
    """
    Retrieve all cards from the database
    
    Returns:
        List of all cards
    """
    try:
        cards = db.get_all_cards()
        
        return CardsResponse(
            success=True,
            message=f"Successfully retrieved {len(cards)} cards",
            data=cards
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve cards: {str(e)}"
        )


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
    try:
        # Check if card exists
        existing_card = db.get_card_by_id(card_id)
        if not existing_card:
            raise HTTPException(
                status_code=404,
                detail=f"Card with ID {card_id} not found"
            )
        
        # Update the card
        updated_card = db.update_card(card_id, updates)
        if not updated_card:
            raise HTTPException(
                status_code=500,
                detail="Failed to update card"
            )
        
        return CardResponse(
            success=True,
            message="Card updated successfully",
            data=updated_card
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update card: {str(e)}"
        )


@app.get("/api/cards/{card_id}", response_model=CardResponse)
async def get_card(card_id: str):
    """
    Get a specific card by ID
    
    Args:
        card_id: ID of the card to retrieve
        
    Returns:
        Card data
    """
    try:
        card = db.get_card_by_id(card_id)
        if not card:
            raise HTTPException(
                status_code=404,
                detail=f"Card with ID {card_id} not found"
            )
        
        return CardResponse(
            success=True,
            message="Card retrieved successfully",
            data=card
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve card: {str(e)}"
        )


@app.delete("/api/cards/{card_id}")
async def delete_card(card_id: str):
    """
    Delete a specific card from the database
    
    Args:
        card_id: ID of the card to delete
        
    Returns:
        Success message
    """
    try:
        # Check if card exists
        existing_card = db.get_card_by_id(card_id)
        if not existing_card:
            raise HTTPException(
                status_code=404,
                detail=f"Card with ID {card_id} not found"
            )
        
        # Delete the card
        success = db.delete_card(card_id)
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to delete card"
            )
        
        return {"message": "Card deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete card: {str(e)}"
        )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
