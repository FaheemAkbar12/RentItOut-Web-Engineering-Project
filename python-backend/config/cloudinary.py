import cloudinary
import cloudinary.uploader
from config.settings import settings

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)


def upload_image(file_bytes, folder: str = "uploads", public_id: str = None):
    """Upload image to Cloudinary"""
    try:
        result = cloudinary.uploader.upload(
            file_bytes,
            folder=folder,
            public_id=public_id,
            resource_type="image"
        )
        return result
    except Exception as e:
        raise Exception(f"Failed to upload image: {str(e)}")


def delete_image(public_id: str):
    """Delete image from Cloudinary"""
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result
    except Exception as e:
        raise Exception(f"Failed to delete image: {str(e)}")
