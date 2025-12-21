from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base
import enum


class ItemCategory(str, enum.Enum):
    ELECTRONICS = "electronics"
    FURNITURE = "furniture"
    CLOTHING = "clothing"
    BOOKS = "books"
    SPORTS = "sports"
    VEHICLES = "vehicles"
    REAL_ESTATE = "real_estate"
    OTHER = "other"


class ItemStatus(str, enum.Enum):
    AVAILABLE = "available"
    SOLD = "sold"
    RESERVED = "reserved"


class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    category = Column(Enum(ItemCategory), nullable=False)
    price = Column(Float, nullable=False)
    status = Column(Enum(ItemStatus), default=ItemStatus.AVAILABLE)
    location = Column(String(255))
    condition = Column(String(50))  # new, like-new, good, fair, poor
    images = Column(Text)  # JSON array of image URLs
    tags = Column(Text)  # JSON array of tags
    views = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="items")
    reviews = relationship("Review", back_populates="item", cascade="all, delete-orphan")
