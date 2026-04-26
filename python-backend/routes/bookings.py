from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from config.database import get_db
from models.user import User
from models.booking import Booking, BookingStatus
from models.travel import Travel
from middleware.auth import get_current_user
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


# Schemas
class BookingCreate(BaseModel):
    travel_id: int
    seats_booked: int = Field(1, gt=0)
    pickup_location: Optional[str] = None
    dropoff_location: Optional[str] = None
    special_requests: Optional[str] = None
    payment_method: Optional[str] = None


class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None
    pickup_location: Optional[str] = None
    dropoff_location: Optional[str] = None
    special_requests: Optional[str] = None
    payment_status: Optional[str] = None


class BookingResponse(BaseModel):
    id: int
    user_id: int
    travel_id: int
    seats_booked: int
    total_price: float
    status: BookingStatus
    pickup_location: Optional[str]
    dropoff_location: Optional[str]
    special_requests: Optional[str]
    payment_method: Optional[str]
    payment_status: str
    created_at: datetime
    updated_at: Optional[datetime]
    user: dict
    travel: dict
    
    class Config:
        from_attributes = True


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new booking"""
    # Check if travel exists
    travel = db.query(Travel).filter(Travel.id == booking_data.travel_id).first()
    if not travel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel listing not found"
        )
    
    # Check if enough seats available
    if travel.available_seats and booking_data.seats_booked > travel.available_seats:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {travel.available_seats} seats available"
        )
    
    # Calculate total price
    total_price = travel.price * booking_data.seats_booked
    
    # Create booking
    new_booking = Booking(
        user_id=current_user.id,
        travel_id=booking_data.travel_id,
        seats_booked=booking_data.seats_booked,
        total_price=total_price,
        pickup_location=booking_data.pickup_location,
        dropoff_location=booking_data.dropoff_location,
        special_requests=booking_data.special_requests,
        payment_method=booking_data.payment_method
    )
    
    # Update available seats
    if travel.available_seats:
        travel.available_seats -= booking_data.seats_booked
    
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    
    return {
        **new_booking.__dict__,
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "profile_image": current_user.profile_image,
            "phone": current_user.phone
        },
        "travel": {
            "id": travel.id,
            "title": travel.title,
            "from_location": travel.from_location,
            "to_location": travel.to_location,
            "departure_time": travel.departure_time
        }
    }


@router.get("/", response_model=List[BookingResponse])
async def get_user_bookings(
    skip: int = 0,
    limit: int = 20,
    status: Optional[BookingStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all bookings for current user"""
    query = db.query(Booking).filter(Booking.user_id == current_user.id)
    
    if status:
        query = query.filter(Booking.status == status)
    
    bookings = query.order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for booking in bookings:
        result.append({
            **booking.__dict__,
            "user": {
                "id": booking.user.id,
                "username": booking.user.username,
                "profile_image": booking.user.profile_image
            },
            "travel": {
                "id": booking.travel.id,
                "title": booking.travel.title,
                "from_location": booking.travel.from_location,
                "to_location": booking.travel.to_location,
                "departure_time": booking.travel.departure_time,
                "owner": {
                    "id": booking.travel.owner.id,
                    "username": booking.travel.owner.username,
                    "phone": booking.travel.owner.phone
                }
            }
        })
    
    return result


@router.get("/travel/{travel_id}", response_model=List[BookingResponse])
async def get_travel_bookings(
    travel_id: int,
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all bookings for a travel listing (only for owner)"""
    # Check if travel exists and user is owner
    travel = db.query(Travel).filter(Travel.id == travel_id).first()
    if not travel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel listing not found"
        )
    
    if travel.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these bookings"
        )
    
    bookings = db.query(Booking).filter(
        Booking.travel_id == travel_id
    ).order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for booking in bookings:
        result.append({
            **booking.__dict__,
            "user": {
                "id": booking.user.id,
                "username": booking.user.username,
                "profile_image": booking.user.profile_image,
                "phone": booking.user.phone
            },
            "travel": {
                "id": travel.id,
                "title": travel.title,
                "from_location": travel.from_location,
                "to_location": travel.to_location,
                "departure_time": travel.departure_time
            }
        })
    
    return result


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get booking by ID"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if user is booking owner or travel owner
    if booking.user_id != current_user.id and booking.travel.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this booking"
        )
    
    return {
        **booking.__dict__,
        "user": {
            "id": booking.user.id,
            "username": booking.user.username,
            "profile_image": booking.user.profile_image,
            "phone": booking.user.phone
        },
        "travel": {
            "id": booking.travel.id,
            "title": booking.travel.title,
            "from_location": booking.travel.from_location,
            "to_location": booking.travel.to_location,
            "departure_time": booking.travel.departure_time,
            "owner": {
                "id": booking.travel.owner.id,
                "username": booking.travel.owner.username,
                "phone": booking.travel.owner.phone
            }
        }
    }


@router.put("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: int,
    booking_data: BookingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a booking"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check authorization (user can update their booking, travel owner can update status)
    is_booking_owner = booking.user_id == current_user.id
    is_travel_owner = booking.travel.user_id == current_user.id
    
    if not (is_booking_owner or is_travel_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this booking"
        )
    
    # Update fields
    if booking_data.status is not None:
        old_status = booking.status
        booking.status = booking_data.status
        
        # If cancelling, return seats
        if booking_data.status == BookingStatus.CANCELLED and old_status != BookingStatus.CANCELLED:
            if booking.travel.available_seats is not None:
                booking.travel.available_seats += booking.seats_booked
    
    if booking_data.pickup_location is not None and is_booking_owner:
        booking.pickup_location = booking_data.pickup_location
    if booking_data.dropoff_location is not None and is_booking_owner:
        booking.dropoff_location = booking_data.dropoff_location
    if booking_data.special_requests is not None and is_booking_owner:
        booking.special_requests = booking_data.special_requests
    if booking_data.payment_status is not None:
        booking.payment_status = booking_data.payment_status
    
    db.commit()
    db.refresh(booking)
    
    return {
        **booking.__dict__,
        "user": {
            "id": booking.user.id,
            "username": booking.user.username,
            "profile_image": booking.user.profile_image
        },
        "travel": {
            "id": booking.travel.id,
            "title": booking.travel.title,
            "from_location": booking.travel.from_location,
            "to_location": booking.travel.to_location,
            "departure_time": booking.travel.departure_time
        }
    }


@router.delete("/{booking_id}")
async def delete_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete/Cancel a booking"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this booking"
        )
    
    # Return seats if not already cancelled
    if booking.status != BookingStatus.CANCELLED and booking.travel.available_seats is not None:
        booking.travel.available_seats += booking.seats_booked
    
    db.delete(booking)
    db.commit()
    
    return {
        "success": True,
        "message": "Booking deleted successfully"
    }
