from fastapi import UploadFile, HTTPException, status
from typing import List
import os
from config.settings import settings
from config.cloudinary import upload_image
import io


def validate_file_size(file: UploadFile):
    """Validate file size"""
    file.file.seek(0, 2)  # Move to end of file
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE} bytes"
        )


def validate_file_extension(filename: str):
    """Validate file extension"""
    extension = filename.split('.')[-1].lower()
    if extension not in settings.allowed_extensions_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(settings.allowed_extensions_list)}"
        )


async def upload_file(file: UploadFile, folder: str = "uploads") -> dict:
    """Upload a single file to Cloudinary"""
    # Validate file
    validate_file_size(file)
    validate_file_extension(file.filename)
    
    # Read file content
    content = await file.read()
    
    # Upload to Cloudinary
    try:
        result = upload_image(content, folder=folder)
        return {
            "url": result.get("secure_url"),
            "public_id": result.get("public_id"),
            "format": result.get("format"),
            "width": result.get("width"),
            "height": result.get("height")
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )


async def upload_multiple_files(files: List[UploadFile], folder: str = "uploads") -> List[dict]:
    """Upload multiple files to Cloudinary"""
    uploaded_files = []
    
    for file in files:
        result = await upload_file(file, folder)
        uploaded_files.append(result)
    
    return uploaded_files
