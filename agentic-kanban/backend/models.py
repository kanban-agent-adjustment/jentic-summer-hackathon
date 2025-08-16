from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class CardStatus(str, Enum):
    RESEARCH = "research"
    IN_PROGRESS = "in-progress"
    DONE = "done"
    BLOCKED = "blocked"
    PLANNED = "planned"


class Card(BaseModel):
    id: str
    title: str
    description: str
    status: CardStatus
    order: int
    tags: List[str]
    createdAt: datetime
    updatedAt: datetime
    completedAt: Optional[datetime] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class CardList(BaseModel):
    cards: List[Card]


class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[CardStatus] = None
    order: Optional[int] = None
    tags: Optional[List[str]] = None
    completedAt: Optional[datetime] = None


class CardResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Card] = None


class CardsResponse(BaseModel):
    success: bool
    message: str
    data: List[Card]
