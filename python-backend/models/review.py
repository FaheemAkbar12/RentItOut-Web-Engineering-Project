from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base


class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=True)
    travel_id = Column(Integer, ForeignKey("travels.id"), nullable=True)
    rating = Column(Float, nullable=False)  # 1-5 stars
    title = Column(String(255))
    comment = Column(Text)
    images = Column(Text)  # JSON array of image URLs
    helpful_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="reviews")
    item = relationship("Item", back_populates="reviews")
    travel = relationship("Travel", back_populates="reviews")
