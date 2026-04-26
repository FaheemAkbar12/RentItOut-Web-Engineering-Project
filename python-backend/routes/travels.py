from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from config.database import get_db
from models.user import User
from models.travel import Travel, TravelType, TravelStatus
from middleware.auth import get_current_user
from middleware.upload import upload_multiple_files
from pydantic import BaseModel, Field
import json

router = APIRouter(prefix="/api/travels", tags=["travels"])


# Schemas
class TravelCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    travel_type: TravelType
    from_location: str
    to_location: str
    departure_time: datetime
    arrival_time: Optional[datetime] = None
    price: float = Field(..., gt=0)
    available_seats: Optional[int] = Field(None, gt=0)
    vehicle_type: Optional[str] = None
    vehicle_details: Optional[str] = None
    amenities: Optional[List[str]] = []


class TravelUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    travel_type: Optional[TravelType] = None
    from_location: Optional[str] = None
    to_location: Optional[str] = None
    departure_time: Optional[datetime] = None
    arrival_time: Optional[datetime] = None
    price: Optional[float] = None
    available_seats: Optional[int] = None
    vehicle_type: Optional[str] = None
    vehicle_details: Optional[str] = None
    status: Optional[TravelStatus] = None
    amenities: Optional[List[str]] = None


class TravelResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    travel_type: TravelType
    from_location: str
    to_location: str
    departure_time: datetime
    arrival_time: Optional[datetime]
    price: float
    available_seats: Optional[int]
    vehicle_type: Optional[str]
    vehicle_details: Optional[str]
    status: TravelStatus
    images: Optional[str]
    amenities: Optional[str]
    views: int
    created_at: datetime
    updated_at: Optional[datetime]
    owner: dict
    
    class Config:
        from_attributes = True


@router.post("/", response_model=TravelResponse, status_code=status.HTTP_201_CREATED)
async def create_travel(
    travel_data: TravelCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new travel/ride listing"""
    new_travel = Travel(
        user_id=current_user.id,
        title=travel_data.title,
        description=travel_data.description,
        travel_type=travel_data.travel_type,
        from_location=travel_data.from_location,
        to_location=travel_data.to_location,
        departure_time=travel_data.departure_time,
        arrival_time=travel_data.arrival_time,
        price=travel_data.price,
        available_seats=travel_data.available_seats,
        vehicle_type=travel_data.vehicle_type,
        vehicle_details=travel_data.vehicle_details,
        amenities=json.dumps(travel_data.amenities) if travel_data.amenities else None
    )
    
    db.add(new_travel)
    db.commit()
    db.refresh(new_travel)
    
    return {
        **new_travel.__dict__,
        "owner": {
            "id": current_user.id,
            "username": current_user.username,
            "profile_image": current_user.profile_image
        }
    }


@router.post("/{travel_id}/images")
async def upload_travel_images(
    travel_id: int,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload images for a travel listing"""
    travel = db.query(Travel).filter(Travel.id == travel_id).first()
    
    if not travel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel listing not found"
        )
    
    if travel.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this travel listing"
        )
    
    # Upload images
    uploaded_images = await upload_multiple_files(files, folder="travels")
    
    # Update travel images
    existing_images = json.loads(travel.images) if travel.images else []
    existing_images.extend([img["url"] for img in uploaded_images])
    travel.images = json.dumps(existing_images)
    
    db.commit()
    
    return {
        "success": True,
        "message": "Images uploaded successfully",
        "data": uploaded_images
    }


@router.get("/", response_model=List[TravelResponse])
async def get_travels(
    skip: int = 0,
    limit: int = 20,
    travel_type: Optional[TravelType] = None,
    status: Optional[TravelStatus] = None,
    from_location: Optional[str] = None,
    to_location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_date: Optional[datetime] = None,
    max_date: Optional[datetime] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = Query(None, regex="^(price|departure_time|created_at|views)$"),
    order: Optional[str] = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    """Get all travel listings with filters and pagination"""
    query = db.query(Travel)
    
    # Apply filters
    if travel_type:
        query = query.filter(Travel.travel_type == travel_type)
    if status:
        query = query.filter(Travel.status == status)
    if from_location:
        query = query.filter(Travel.from_location.contains(from_location))
    if to_location:
        query = query.filter(Travel.to_location.contains(to_location))
    if min_price is not None:
        query = query.filter(Travel.price >= min_price)
    if max_price is not None:
        query = query.filter(Travel.price <= max_price)
    if min_date:
        query = query.filter(Travel.departure_time >= min_date)
    if max_date:
        query = query.filter(Travel.departure_time <= max_date)
    if search:
        query = query.filter(
            (Travel.title.contains(search)) |
            (Travel.description.contains(search)) |
            (Travel.from_location.contains(search)) |
            (Travel.to_location.contains(search))
        )
    
    # Apply sorting
    if sort_by:
        order_column = getattr(Travel, sort_by)
        if order == "desc":
            query = query.order_by(order_column.desc())
        else:
            query = query.order_by(order_column.asc())
    else:
        query = query.order_by(Travel.departure_time.asc())
    
    travels = query.offset(skip).limit(limit).all()
    
    # Format response
    result = []
    for travel in travels:
        result.append({
            **travel.__dict__,
            "owner": {
                "id": travel.owner.id,
                "username": travel.owner.username,
                "profile_image": travel.owner.profile_image
            }
        })
    
    return result


@router.get("/{travel_id}", response_model=TravelResponse)
async def get_travel(travel_id: int, db: Session = Depends(get_db)):
    """Get travel listing by ID"""
    travel = db.query(Travel).filter(Travel.id == travel_id).first()
    
    if not travel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel listing not found"
        )
    
    # Increment views
    travel.views += 1
    db.commit()
    
    return {
        **travel.__dict__,
        "owner": {
            "id": travel.owner.id,
            "username": travel.owner.username,
            "profile_image": travel.owner.profile_image,
            "full_name": travel.owner.full_name,
            "phone": travel.owner.phone
        }
    }


@router.put("/{travel_id}", response_model=TravelResponse)
async def update_travel(
    travel_id: int,
    travel_data: TravelUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a travel listing"""
    travel = db.query(Travel).filter(Travel.id == travel_id).first()
    
    if not travel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel listing not found"
        )
    
    if travel.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this travel listing"
        )
    
    # Update fields
    if travel_data.title is not None:
        travel.title = travel_data.title
    if travel_data.description is not None:
        travel.description = travel_data.description
    if travel_data.travel_type is not None:
        travel.travel_type = travel_data.travel_type
    if travel_data.from_location is not None:
        travel.from_location = travel_data.from_location
    if travel_data.to_location is not None:
        travel.to_location = travel_data.to_location
    if travel_data.departure_time is not None:
        travel.departure_time = travel_data.departure_time
    if travel_data.arrival_time is not None:
        travel.arrival_time = travel_data.arrival_time
    if travel_data.price is not None:
        travel.price = travel_data.price
    if travel_data.available_seats is not None:
        travel.available_seats = travel_data.available_seats
    if travel_data.vehicle_type is not None:
        travel.vehicle_type = travel_data.vehicle_type
    if travel_data.vehicle_details is not None:
        travel.vehicle_details = travel_data.vehicle_details
    if travel_data.status is not None:
        travel.status = travel_data.status
    if travel_data.amenities is not None:
        travel.amenities = json.dumps(travel_data.amenities)
    
    db.commit()
    db.refresh(travel)
    
    return {
        **travel.__dict__,
        "owner": {
            "id": current_user.id,
            "username": current_user.username,
            "profile_image": current_user.profile_image
        }
    }


@router.delete("/{travel_id}")
async def delete_travel(
    travel_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a travel listing"""
    travel = db.query(Travel).filter(Travel.id == travel_id).first()
    
    if not travel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel listing not found"
        )
    
    if travel.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this travel listing"
        )
    
    db.delete(travel)
    db.commit()
    
    return {
        "success": True,
        "message": "Travel listing deleted successfully"
    }


@router.get("/user/{user_id}", response_model=List[TravelResponse])
async def get_user_travels(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get all travel listings by a specific user"""
    travels = db.query(Travel).filter(Travel.user_id == user_id).offset(skip).limit(limit).all()
    
    result = []
    for travel in travels:
        result.append({
            **travel.__dict__,
            "owner": {
                "id": travel.owner.id,
                "username": travel.owner.username,
                "profile_image": travel.owner.profile_image
            }
        })
    
    return result
