import chromadb
import json
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from models import Card, CardUpdate


class CardDatabase:
    def __init__(self, persist_directory: str = "./chroma_db"):
        """Initialize ChromaDB client and collection for cards"""
        self.client = chromadb.PersistentClient(path=persist_directory)
        
        # Create or get the cards collection
        try:
            self.collection = self.client.get_collection("cards")
        except:
            self.collection = self.client.create_collection(
                name="cards",
                metadata={"description": "Kanban board cards storage"}
            )
    
    def add_cards(self, cards: List[Card]) -> List[str]:
        """Add multiple cards to the database"""
        card_ids = []
        documents = []
        metadatas = []
        
        for card in cards:
            # Generate ID if not provided
            if not card.id:
                card.id = str(uuid.uuid4())
            
            # Update timestamps
            now = datetime.utcnow()
            if not card.createdAt:
                card.createdAt = now
            card.updatedAt = now
            
            # Convert card to document format
            card_dict = card.dict()
            card_dict['createdAt'] = card.createdAt.isoformat()
            card_dict['updatedAt'] = card.updatedAt.isoformat()
            if card.completedAt:
                card_dict['completedAt'] = card.completedAt.isoformat()
            
            documents.append(json.dumps(card_dict))
            metadatas.append(card_dict)
            card_ids.append(card.id)
        
        # Add to ChromaDB
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=card_ids
        )
        
        return card_ids
    
    def get_all_cards(self) -> List[Card]:
        """Retrieve all cards from the database"""
        try:
            results = self.collection.get()
            cards = []
            
            for i, metadata in enumerate(results['metadatas']):
                if metadata:
                    # Convert metadata back to Card object
                    card_data = metadata.copy()
                    
                    # Parse datetime fields
                    card_data['createdAt'] = datetime.fromisoformat(metadata['createdAt'])
                    card_data['updatedAt'] = datetime.fromisoformat(metadata['updatedAt'])
                    if metadata.get('completedAt'):
                        card_data['completedAt'] = datetime.fromisoformat(metadata['completedAt'])
                    
                    # Create Card object
                    card = Card(**card_data)
                    cards.append(card)
            
            # Sort by order
            cards.sort(key=lambda x: x.order)
            return cards
            
        except Exception as e:
            print(f"Error retrieving cards: {e}")
            return []
    
    def update_card(self, card_id: str, updates: CardUpdate) -> Optional[Card]:
        """Update a specific card in the database"""
        try:
            # Get current card
            results = self.collection.get(ids=[card_id])
            if not results['metadatas']:
                return None
            
            current_metadata = results['metadatas'][0]
            current_document = results['documents'][0]
            
            # Update fields
            update_dict = updates.dict(exclude_unset=True)
            if update_dict:
                # Update timestamp
                update_dict['updatedAt'] = datetime.utcnow().isoformat()
                
                # Merge updates with current data
                updated_metadata = current_metadata.copy()
                updated_metadata.update(update_dict)
                
                # Update the document
                updated_document = json.dumps(updated_metadata)
                
                # Update in ChromaDB
                self.collection.update(
                    ids=[card_id],
                    documents=[updated_document],
                    metadatas=[updated_metadata]
                )
                
                # Return updated card
                card_data = updated_metadata.copy()
                card_data['createdAt'] = datetime.fromisoformat(updated_metadata['createdAt'])
                card_data['updatedAt'] = datetime.fromisoformat(updated_metadata['updatedAt'])
                if updated_metadata.get('completedAt'):
                    card_data['completedAt'] = datetime.fromisoformat(updated_metadata['completedAt'])
                
                return Card(**card_data)
            
            return None
            
        except Exception as e:
            print(f"Error updating card: {e}")
            return None
    
    def delete_card(self, card_id: str) -> bool:
        """Delete a card from the database"""
        try:
            self.collection.delete(ids=[card_id])
            return True
        except Exception as e:
            print(f"Error deleting card: {e}")
            return False
    
    def get_card_by_id(self, card_id: str) -> Optional[Card]:
        """Get a specific card by ID"""
        try:
            results = self.collection.get(ids=[card_id])
            if not results['metadatas']:
                return None
            
            metadata = results['metadatas'][0]
            card_data = metadata.copy()
            
            # Parse datetime fields
            card_data['createdAt'] = datetime.fromisoformat(metadata['createdAt'])
            card_data['updatedAt'] = datetime.fromisoformat(metadata['updatedAt'])
            if metadata.get('completedAt'):
                card_data['completedAt'] = datetime.fromisoformat(metadata['completedAt'])
            
            return Card(**card_data)
            
        except Exception as e:
            print(f"Error retrieving card: {e}")
            return None
