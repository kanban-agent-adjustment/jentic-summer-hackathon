import json
import os
from typing import Dict, Any, List, Optional
from pathlib import Path
import logging
import traceback

# Get logger for this module
logger = logging.getLogger(__name__)


class SchemaLoader:
    """Dynamically loads and parses JSON schema files"""
    
    def __init__(self, schema_path: str = "../card.schema.json"):
        """
        Initialize schema loader
        
        Args:
            schema_path: Path to the JSON schema file relative to this module
        """
        self.schema_path = Path(__file__).parent / schema_path
        self.schema_data = None
        
        logger.info(f"Initializing SchemaLoader with path: {self.schema_path}")
        self._load_schema()
    
    def _load_schema(self):
        """Load the JSON schema file"""
        try:
            logger.info(f"Loading schema from: {self.schema_path}")
            
            if not self.schema_path.exists():
                error_msg = f"Schema file not found: {self.schema_path}"
                logger.error(error_msg)
                logger.error(f"Current working directory: {os.getcwd()}")
                logger.error(f"Available files in parent directory: {list(Path(__file__).parent.parent.iterdir())}")
                raise FileNotFoundError(error_msg)
            
            with open(self.schema_path, 'r') as f:
                self.schema_data = json.load(f)
            
            logger.info(f"Successfully loaded schema with {len(self.schema_data)} top-level keys")
            logger.debug(f"Schema keys: {list(self.schema_data.keys())}")
                
        except FileNotFoundError:
            raise
        except json.JSONDecodeError as e:
            error_msg = f"Invalid JSON in schema file: {e}"
            logger.error(error_msg)
            logger.error(f"Schema file path: {self.schema_path}")
            raise RuntimeError(error_msg)
        except Exception as e:
            error_msg = f"Failed to load schema: {e}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            raise RuntimeError(error_msg)
    
    def reload_schema(self):
        """Reload the schema from file (useful for development)"""
        logger.info("Reloading schema from file")
        try:
            self._load_schema()
            logger.info("Schema reloaded successfully")
        except Exception as e:
            error_msg = f"Failed to reload schema: {e}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            raise RuntimeError(error_msg)
    
    def get_schema(self) -> Dict[str, Any]:
        """Get the loaded schema data"""
        if not self.schema_data:
            error_msg = "Schema not loaded"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
        return self.schema_data
    
    def get_card_properties(self) -> Dict[str, Any]:
        """Get the properties of a single card from the schema"""
        try:
            if not self.schema_data:
                raise RuntimeError("Schema not loaded")
            
            # Navigate to the card properties
            properties = self.schema_data.get('properties', {})
            if not properties:
                error_msg = "No properties found in schema"
                logger.error(error_msg)
                logger.debug(f"Schema structure: {self.schema_data}")
                raise RuntimeError(error_msg)
            
            cards_array = properties.get('cards', {})
            if not cards_array:
                error_msg = "No 'cards' property found in schema"
                logger.error(error_msg)
                logger.debug(f"Available properties: {list(properties.keys())}")
                raise RuntimeError(error_msg)
            
            card_item = cards_array.get('items', {})
            if not card_item:
                error_msg = "No 'items' property found in cards array"
                logger.error(error_msg)
                logger.debug(f"Cards array structure: {cards_array}")
                raise RuntimeError(error_msg)
            
            card_properties = card_item.get('properties', {})
            if not card_properties:
                error_msg = "No properties found in card item"
                logger.error(error_msg)
                logger.debug(f"Card item structure: {card_item}")
                raise RuntimeError(error_msg)
            
            logger.debug(f"Found {len(card_properties)} card properties")
            return card_properties
            
        except Exception as e:
            error_msg = f"Failed to get card properties: {e}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            raise RuntimeError(error_msg)
    
    def get_required_fields(self) -> List[str]:
        """Get the required fields for a card"""
        try:
            if not self.schema_data:
                raise RuntimeError("Schema not loaded")
            
            # Navigate to the card properties
            properties = self.schema_data.get('properties', {})
            cards_array = properties.get('cards', {})
            card_item = cards_array.get('items', {})
            
            required_fields = card_item.get('required', [])
            logger.debug(f"Found {len(required_fields)} required fields: {required_fields}")
            return required_fields
            
        except Exception as e:
            error_msg = f"Failed to get required fields: {e}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            raise RuntimeError(error_msg)
    
    def get_status_enum(self) -> List[str]:
        """Get the possible status values from the schema"""
        try:
            if not self.schema_data:
                raise RuntimeError("Schema not loaded")
            
            status_prop = self.get_card_properties().get('status', {})
            if not status_prop:
                logger.warning("No 'status' property found in card schema")
                return []
            
            status_enum = status_prop.get('enum', [])
            if not status_enum:
                logger.warning("No enum values found in status property")
                logger.debug(f"Status property structure: {status_prop}")
                return []
            
            logger.debug(f"Found {len(status_enum)} status values: {status_enum}")
            return status_enum
            
        except Exception as e:
            error_msg = f"Failed to get status enum: {e}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            return []
    
    def validate_card_data(self, card_data: Dict[str, Any]) -> bool:
        """
        Basic validation of card data against the schema
        
        Args:
            card_data: Dictionary containing card data
            
        Returns:
            True if valid, False otherwise
        """
        try:
            logger.debug(f"Validating card data: {card_data}")
            
            properties = self.get_card_properties()
            required_fields = self.get_required_fields()
            
            # Check required fields
            for field in required_fields:
                if field not in card_data:
                    logger.warning(f"Required field '{field}' missing from card data")
                    return False
            
            # Check status enum
            if 'status' in card_data:
                valid_statuses = self.get_status_enum()
                if valid_statuses and card_data['status'] not in valid_statuses:
                    logger.warning(f"Invalid status '{card_data['status']}'. Valid values: {valid_statuses}")
                    return False
            
            logger.debug("Card data validation passed")
            return True
            
        except Exception as e:
            logger.error(f"Error during card validation: {e}")
            logger.error(traceback.format_exc())
            return False
    
    def get_schema_info(self) -> Dict[str, Any]:
        """Get summary information about the schema"""
        try:
            if not self.schema_data:
                return {}
            
            card_properties = self.get_card_properties()
            required_fields = self.get_required_fields()
            status_values = self.get_status_enum()
            
            schema_info = {
                "title": self.schema_data.get('title'),
                "description": self.schema_data.get('description'),
                "card_properties": list(card_properties.keys()),
                "required_fields": required_fields,
                "status_values": status_values,
                "schema_file": str(self.schema_path),
                "last_modified": os.path.getmtime(self.schema_path) if self.schema_path.exists() else None
            }
            
            logger.debug(f"Generated schema info: {len(schema_info)} fields")
            return schema_info
            
        except Exception as e:
            error_msg = f"Failed to get schema info: {e}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            return {
                "error": error_msg,
                "schema_file": str(self.schema_path) if hasattr(self, 'schema_path') else "unknown"
            }
    
    def validate_schema_structure(self) -> bool:
        """Validate that the schema has the expected structure"""
        try:
            logger.info("Validating schema structure")
            
            # Check basic structure
            if not isinstance(self.schema_data, dict):
                logger.error("Schema root is not a dictionary")
                return False
            
            # Check required top-level keys
            required_keys = ['properties', 'type']
            for key in required_keys:
                if key not in self.schema_data:
                    logger.error(f"Missing required key: {key}")
                    return False
            
            # Check cards property structure
            properties = self.schema_data.get('properties', {})
            if 'cards' not in properties:
                logger.error("Missing 'cards' property in schema")
                return False
            
            cards_prop = properties['cards']
            if not isinstance(cards_prop, dict):
                logger.error("'cards' property is not a dictionary")
                return False
            
            if 'items' not in cards_prop:
                logger.error("Missing 'items' in cards property")
                return False
            
            # Check card item structure
            card_item = cards_prop['items']
            if not isinstance(card_item, dict):
                logger.error("Card item is not a dictionary")
                return False
            
            if 'properties' not in card_item:
                logger.error("Missing 'properties' in card item")
                return False
            
            logger.info("Schema structure validation passed")
            return True
            
        except Exception as e:
            error_msg = f"Schema structure validation failed: {e}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            return False
