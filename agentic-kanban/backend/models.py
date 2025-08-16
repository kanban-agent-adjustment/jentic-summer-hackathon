from pydantic import BaseModel, Field, create_model
from typing import List, Optional, Dict, Any, Type
from datetime import datetime
from enum import Enum
import logging
import traceback
from schema_loader import SchemaLoader

# Get logger for this module
logger = logging.getLogger(__name__)


class DynamicCardModel:
    """Dynamically creates Pydantic models based on the JSON schema"""
    
    def __init__(self):
        logger.info("Initializing DynamicCardModel")
        try:
            self.schema_loader = SchemaLoader()
            self._create_models()
            logger.info("DynamicCardModel initialized successfully")
        except Exception as e:
            error_msg = f"Failed to initialize DynamicCardModel: {e}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            raise RuntimeError(error_msg)
    
    def _create_models(self):
        """Create Pydantic models dynamically from schema"""
        try:
            logger.info("Creating Pydantic models from schema")
            
            schema_data = self.schema_loader.get_schema()
            card_properties = self.schema_loader.get_card_properties()
            required_fields = self.schema_loader.get_required_fields()
            
            logger.debug(f"Found {len(card_properties)} card properties")
            logger.debug(f"Found {len(required_fields)} required fields")
            
            # Create field definitions for the Card model
            field_definitions = {}
            
            for field_name, field_spec in card_properties.items():
                try:
                    field_type = self._get_python_type(field_spec)
                    field_required = field_name in required_fields
                    
                    if field_required:
                        field_definitions[field_name] = (field_type, ...)
                        logger.debug(f"Added required field: {field_name} -> {field_type}")
                    else:
                        field_definitions[field_name] = (Optional[field_type], None)
                        logger.debug(f"Added optional field: {field_name} -> Optional[{field_type}]")
                        
                except Exception as e:
                    logger.warning(f"Failed to process field {field_name}: {e}")
                    # Use Any type as fallback
                    field_definitions[field_name] = (Any, None)
            
            # Create the Card model dynamically
            logger.info("Creating Card model")
            self.Card = create_model('Card', **field_definitions)
            
            # Create the CardList model
            logger.info("Creating CardList model")
            self.CardList = create_model('CardList', cards=(List[self.Card], ...))
            
            # Create the CardUpdate model (all fields optional)
            update_field_definitions = {}
            for field_name, field_spec in card_properties.items():
                if field_name not in ['id', 'createdAt']:  # Don't allow updating these
                    try:
                        field_type = self._get_python_type(field_spec)
                        update_field_definitions[field_name] = (Optional[field_type], None)
                        logger.debug(f"Added update field: {field_name} -> Optional[{field_type}]")
                    except Exception as e:
                        logger.warning(f"Failed to process update field {field_name}: {e}")
                        update_field_definitions[field_name] = (Optional[Any], None)
            
            logger.info("Creating CardUpdate model")
            self.CardUpdate = create_model('CardUpdate', **update_field_definitions)
            
            # Create response models
            logger.info("Creating response models")
            self.CardResponse = create_model('CardResponse', 
                success=(bool, ...),
                message=(str, ...),
                data=(Optional[self.Card], None)
            )
            
            self.CardsResponse = create_model('CardsResponse',
                success=(bool, ...),
                message=(str, ...),
                data=(List[self.Card], ...)
            )
            
            logger.info("All Pydantic models created successfully")
            
        except Exception as e:
            error_msg = f"Failed to create models: {e}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            raise RuntimeError(error_msg)
    
    def _get_python_type(self, field_spec: Dict[str, Any]) -> Type:
        """Convert JSON schema types to Python types"""
        try:
            field_type = field_spec.get('type')
            
            if field_type == 'string':
                # Check for specific string formats
                if field_spec.get('format') == 'date-time':
                    logger.debug("Detected date-time field")
                    return datetime
                elif 'enum' in field_spec:
                    # Create a dynamic enum for status
                    if field_spec.get('description', '').lower() == 'status':
                        logger.debug("Creating dynamic status enum")
                        return self._create_status_enum(field_spec['enum'])
                return str
            elif field_type == 'integer':
                return int
            elif field_type == 'array':
                items_type = field_spec.get('items', {}).get('type')
                if items_type == 'string':
                    return List[str]
                return List[Any]
            elif field_type == 'boolean':
                return bool
            else:
                logger.warning(f"Unknown field type: {field_type}, using Any")
                return Any
                
        except Exception as e:
            logger.warning(f"Error determining field type: {e}, using Any as fallback")
            return Any
    
    def _create_status_enum(self, status_values: List[str]) -> Type[Enum]:
        """Create a dynamic enum for status values"""
        try:
            logger.debug(f"Creating status enum with values: {status_values}")
            enum_dict = {value.upper().replace('-', '_'): value for value in status_values}
            return Enum('CardStatus', enum_dict)
        except Exception as e:
            logger.error(f"Failed to create status enum: {e}")
            logger.error(traceback.format_exc())
            # Return a simple string type as fallback
            return str
    
    def reload_models(self):
        """Reload models from schema (useful when schema changes)"""
        logger.info("Reloading models from schema")
        try:
            self.schema_loader.reload_schema()
            self._create_models()
            logger.info("Models reloaded successfully")
        except Exception as e:
            error_msg = f"Failed to reload models: {e}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            raise RuntimeError(error_msg)
    
    def get_schema_info(self) -> Dict[str, Any]:
        """Get information about the current schema"""
        try:
            return self.schema_loader.get_schema_info()
        except Exception as e:
            error_msg = f"Failed to get schema info: {e}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            return {"error": error_msg}
    
    def validate_schema(self) -> bool:
        """Validate that the schema is properly structured"""
        try:
            return self.schema_loader.validate_schema_structure()
        except Exception as e:
            logger.error(f"Schema validation failed: {e}")
            return False


# Initialize the dynamic models
logger.info("Initializing dynamic models...")
try:
    dynamic_models = DynamicCardModel()
    logger.info("Dynamic models initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize dynamic models: {e}")
    logger.error(traceback.format_exc())
    dynamic_models = None

# Export the dynamically created models
if dynamic_models:
    Card = dynamic_models.Card
    CardList = dynamic_models.CardList
    CardUpdate = dynamic_models.CardUpdate
    CardResponse = dynamic_models.CardResponse
    CardsResponse = dynamic_models.CardsResponse
else:
    # Fallback models in case of initialization failure
    logger.warning("Using fallback models due to initialization failure")
    Card = BaseModel
    CardList = BaseModel
    CardUpdate = BaseModel
    CardResponse = BaseModel
    CardsResponse = BaseModel

# Function to reload models if schema changes
def reload_models():
    """Reload all models from the schema file"""
    global dynamic_models, Card, CardList, CardUpdate, CardResponse, CardsResponse
    
    logger.info("Reloading all models")
    try:
        if dynamic_models:
            dynamic_models.reload_models()
            Card = dynamic_models.Card
            CardList = dynamic_models.CardList
            CardUpdate = dynamic_models.CardUpdate
            CardResponse = dynamic_models.CardResponse
            CardsResponse = dynamic_models.CardsResponse
            logger.info("Models reloaded successfully")
        else:
            logger.error("Dynamic models not available for reload")
            raise RuntimeError("Dynamic models not initialized")
            
    except Exception as e:
        error_msg = f"Failed to reload models: {e}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        raise RuntimeError(error_msg)
