from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from config.database import get_db
from models.user import User
from models.item import Item, ItemCategory, ItemStatus
from middleware.auth import get_current_user
from middleware.upload import upload_multiple_files
from pydantic import BaseModel, Field
import json

router = APIRouter(prefix="/api/items", tags=["items"])


# Schemas
class ItemCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    category: ItemCategory
    price: float = Field(..., gt=0)
    location: Optional[str] = None
    condition: Optional[str] = None
    tags: Optional[List[str]] = []


class ItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[ItemCategory] = None
    price: Optional[float] = None
    status: Optional[ItemStatus] = None
    location: Optional[str] = None
    condition: Optional[str] = None
    tags: Optional[List[str]] = None


class ItemResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    category: ItemCategory
    price: float
    status: ItemStatus
    location: Optional[str]
    condition: Optional[str]
    images: Optional[str]
    tags: Optional[str]
    views: int
    created_at: datetime
    updated_at: Optional[datetime]
    owner: dict
    
    class Config:
        from_attributes = True


@router.post("/", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(
    item_data: ItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new item"""
    new_item = Item(
        user_id=current_user.id,
        title=item_data.title,
        description=item_data.description,
        category=item_data.category,
        price=item_data.price,
        location=item_data.location,
        condition=item_data.condition,
        tags=json.dumps(item_data.tags) if item_data.tags else None
    )
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    return {
        **new_item.__dict__,
        "owner": {
            "id": current_user.id,
            "username": current_user.username,
            "profile_image": current_user.profile_image
        }
    }


@router.post("/{item_id}/images")
async def upload_item_images(
    item_id: int,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload images for an item"""
    item = db.query(Item).filter(Item.id == item_id).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    if item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this item"
        )
    
    # Upload images
    uploaded_images = await upload_multiple_files(files, folder="items")
    
    # Update item images
    existing_images = json.loads(item.images) if item.images else []
    existing_images.extend([img["url"] for img in uploaded_images])
    item.images = json.dumps(existing_images)
    
    db.commit()
    
    return {
        "success": True,
        "message": "Images uploaded successfully",
        "data": uploaded_images
    }


@router.get("/", response_model=List[ItemResponse])
async def get_items(
    skip: int = 0,
    limit: int = 20,
    category: Optional[ItemCategory] = None,
    status: Optional[ItemStatus] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = Query(None, regex="^(price|created_at|views)$"),
    order: Optional[str] = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    """Get all items with filters and pagination"""
    query = db.query(Item)
    
    # Apply filters
    if category:
        query = query.filter(Item.category == category)
    if status:
        query = query.filter(Item.status == status)
    if min_price is not None:
        query = query.filter(Item.price >= min_price)
    if max_price is not None:
        query = query.filter(Item.price <= max_price)
    if search:
        query = query.filter(
            (Item.title.contains(search)) |
            (Item.description.contains(search))
        )
    
    # Apply sorting
    if sort_by:
        order_column = getattr(Item, sort_by)
        if order == "desc":
            query = query.order_by(order_column.desc())
        else:
            query = query.order_by(order_column.asc())
    else:
        query = query.order_by(Item.created_at.desc())
    
    items = query.offset(skip).limit(limit).all()
    
    # Format response
    result = []
    for item in items:
        result.append({
            **item.__dict__,
            "owner": {
                "id": item.owner.id,
                "username": item.owner.username,
                "profile_image": item.owner.profile_image
            }
        })
    
    return result


@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(item_id: int, db: Session = Depends(get_db)):
    """Get item by ID"""
    item = db.query(Item).filter(Item.id == item_id).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    # Increment views
    item.views += 1
    db.commit()
    
    return {
        **item.__dict__,
        "owner": {
            "id": item.owner.id,
            "username": item.owner.username,
            "profile_image": item.owner.profile_image,
            "full_name": item.owner.full_name
        }
    }


@router.put("/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: int,
    item_data: ItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an item"""
    item = db.query(Item).filter(Item.id == item_id).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    if item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this item"
        )
    
    # Update fields
    if item_data.title is not None:
        item.title = item_data.title
    if item_data.description is not None:
        item.description = item_data.description
    if item_data.category is not None:
        item.category = item_data.category
    if item_data.price is not None:
        item.price = item_data.price
    if item_data.status is not None:
        item.status = item_data.status
    if item_data.location is not None:
        item.location = item_data.location
    if item_data.condition is not None:
        item.condition = item_data.condition
    if item_data.tags is not None:
        item.tags = json.dumps(item_data.tags)
    
    db.commit()
    db.refresh(item)
    
    return {
        **item.__dict__,
        "owner": {
            "id": current_user.id,
            "username": current_user.username,
            "profile_image": current_user.profile_image
        }
    }


@router.delete("/{item_id}")
async def delete_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an item"""
    item = db.query(Item).filter(Item.id == item_id).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    if item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this item"
        )
    
    db.delete(item)
    db.commit()
    
    return {
        "success": True,
        "message": "Item deleted successfully"
    }


@router.get("/user/{user_id}", response_model=List[ItemResponse])
async def get_user_items(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get all items by a specific user"""
    items = db.query(Item).filter(Item.user_id == user_id).offset(skip).limit(limit).all()
    
    result = []
    for item in items:
        result.append({
            **item.__dict__,
            "owner": {
                "id": item.owner.id,
                "username": item.owner.username,
                "profile_image": item.owner.profile_image
            }
        })
    
    return result
