from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from config.database import get_db
from models.user import User
from models.review import Review
from models.item import Item
from models.travel import Travel
from middleware.auth import get_current_user
from middleware.upload import upload_multiple_files
from pydantic import BaseModel, Field
import json

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


# Schemas
class ReviewCreate(BaseModel):
    item_id: Optional[int] = None
    travel_id: Optional[int] = None
    rating: float = Field(..., ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None


class ReviewUpdate(BaseModel):
    rating: Optional[float] = Field(None, ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    item_id: Optional[int]
    travel_id: Optional[int]
    rating: float
    title: Optional[str]
    comment: Optional[str]
    images: Optional[str]
    helpful_count: int
    created_at: datetime
    updated_at: Optional[datetime]
    user: dict
    
    class Config:
        from_attributes = True


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new review"""
    # Must review either an item or travel, not both or neither
    if (review_data.item_id is None and review_data.travel_id is None) or \
       (review_data.item_id is not None and review_data.travel_id is not None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must review either an item or travel, not both"
        )
    
    # Verify item or travel exists
    if review_data.item_id:
        item = db.query(Item).filter(Item.id == review_data.item_id).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )
    
    if review_data.travel_id:
        travel = db.query(Travel).filter(Travel.id == review_data.travel_id).first()
        if not travel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Travel listing not found"
            )
    
    # Create review
    new_review = Review(
        user_id=current_user.id,
        item_id=review_data.item_id,
        travel_id=review_data.travel_id,
        rating=review_data.rating,
        title=review_data.title,
        comment=review_data.comment
    )
    
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    return {
        **new_review.__dict__,
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "profile_image": current_user.profile_image
        }
    }


@router.post("/{review_id}/images")
async def upload_review_images(
    review_id: int,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload images for a review"""
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    if review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this review"
        )
    
    # Upload images
    uploaded_images = await upload_multiple_files(files, folder="reviews")
    
    # Update review images
    existing_images = json.loads(review.images) if review.images else []
    existing_images.extend([img["url"] for img in uploaded_images])
    review.images = json.dumps(existing_images)
    
    db.commit()
    
    return {
        "success": True,
        "message": "Images uploaded successfully",
        "data": uploaded_images
    }


@router.get("/item/{item_id}", response_model=List[ReviewResponse])
async def get_item_reviews(
    item_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get all reviews for an item"""
    reviews = db.query(Review).filter(
        Review.item_id == item_id
    ).order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for review in reviews:
        result.append({
            **review.__dict__,
            "user": {
                "id": review.user.id,
                "username": review.user.username,
                "profile_image": review.user.profile_image
            }
        })
    
    return result


@router.get("/travel/{travel_id}", response_model=List[ReviewResponse])
async def get_travel_reviews(
    travel_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get all reviews for a travel listing"""
    reviews = db.query(Review).filter(
        Review.travel_id == travel_id
    ).order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for review in reviews:
        result.append({
            **review.__dict__,
            "user": {
                "id": review.user.id,
                "username": review.user.username,
                "profile_image": review.user.profile_image
            }
        })
    
    return result


@router.get("/user/{user_id}", response_model=List[ReviewResponse])
async def get_user_reviews(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get all reviews by a user"""
    reviews = db.query(Review).filter(
        Review.user_id == user_id
    ).order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for review in reviews:
        result.append({
            **review.__dict__,
            "user": {
                "id": review.user.id,
                "username": review.user.username,
                "profile_image": review.user.profile_image
            }
        })
    
    return result


@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review(review_id: int, db: Session = Depends(get_db)):
    """Get review by ID"""
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    return {
        **review.__dict__,
        "user": {
            "id": review.user.id,
            "username": review.user.username,
            "profile_image": review.user.profile_image
        }
    }


@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: int,
    review_data: ReviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a review"""
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    if review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this review"
        )
    
    # Update fields
    if review_data.rating is not None:
        review.rating = review_data.rating
    if review_data.title is not None:
        review.title = review_data.title
    if review_data.comment is not None:
        review.comment = review_data.comment
    
    db.commit()
    db.refresh(review)
    
    return {
        **review.__dict__,
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "profile_image": current_user.profile_image
        }
    }


@router.delete("/{review_id}")
async def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a review"""
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    if review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this review"
        )
    
    db.delete(review)
    db.commit()
    
    return {
        "success": True,
        "message": "Review deleted successfully"
    }


@router.post("/{review_id}/helpful")
async def mark_helpful(
    review_id: int,
    db: Session = Depends(get_db)
):
    """Mark a review as helpful"""
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    review.helpful_count += 1
    db.commit()
    
    return {
        "success": True,
        "message": "Review marked as helpful",
        "helpful_count": review.helpful_count
    }
