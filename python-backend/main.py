from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from config.settings import settings
from config.database import init_db
from middleware.error_handler import (
    validation_exception_handler,
    sqlalchemy_exception_handler,
    general_exception_handler
)
from routes import users, items, travels, bookings, reviews
import uvicorn

# Create FastAPI app
app = FastAPI(
    title="Web Application API",
    description="Professional Python backend for web application with items, travels, bookings, and reviews",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Include routers
app.include_router(users.router)
app.include_router(items.router)
app.include_router(travels.router)
app.include_router(bookings.router)
app.include_router(reviews.router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()
    print("✓ Database initialized")
    print(f"✓ Server running on http://{settings.HOST}:{settings.PORT}")
    print(f"✓ API Documentation: http://{settings.HOST}:{settings.PORT}/api/docs")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Web Application API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/api/docs"
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "API is running"
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
