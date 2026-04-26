from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base
import enum


class TravelType(str, enum.Enum):
    RIDESHARE = "rideshare"
    DELIVERY = "delivery"
    MOVING = "moving"


class TravelStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Travel(Base):
    __tablename__ = "travels"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    travel_type = Column(Enum(TravelType), nullable=False)
    from_location = Column(String(255), nullable=False)
    to_location = Column(String(255), nullable=False)
    departure_time = Column(DateTime(timezone=True), nullable=False)
    arrival_time = Column(DateTime(timezone=True))
    price = Column(Float, nullable=False)
    available_seats = Column(Integer)
    vehicle_type = Column(String(100))
    vehicle_details = Column(Text)
    status = Column(Enum(TravelStatus), default=TravelStatus.SCHEDULED)
    images = Column(Text)  # JSON array of image URLs
    amenities = Column(Text)  # JSON array of amenities
    views = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="travels")
    bookings = relationship("Booking", back_populates="travel", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="travel", cascade="all, delete-orphan")
