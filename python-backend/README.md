# Python Backend for Web Application

A professional, production-ready Python backend built with FastAPI for managing items, travel/rides, bookings, and reviews.

## Features

- **User Management**: Registration, login, profile management with JWT authentication
- **Items Management**: Create, update, delete, and browse items with categories and filters
- **Travel/Rides Management**: Manage ride-sharing, delivery, and moving services
- **Bookings System**: Book travels, manage bookings, and track status
- **Reviews System**: Rate and review items and travel services
- **Image Upload**: Cloudinary integration for image storage
- **Advanced Filtering**: Search, filter, sort, and paginate all resources
- **Security**: JWT token authentication, password hashing, role-based access

## Tech Stack

- **Framework**: FastAPI
- **Database**: MySQL with SQLAlchemy ORM
- **Authentication**: JWT with python-jose
- **Password Hashing**: bcrypt via passlib
- **Image Storage**: Cloudinary
- **Validation**: Pydantic
- **Server**: Uvicorn

## Installation

### Prerequisites

- Python 3.8+
- MySQL 5.7+
- Cloudinary account (for image uploads)

### Setup Steps

1. **Navigate to the backend directory:**
   ```powershell
   cd python-backend
   ```

2. **Create a virtual environment:**
   ```powershell
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```

4. **Install dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

5. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Update the configuration with your values:
     ```env
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=webapp_db
     
     SECRET_KEY=your-secret-key-here
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     ```

6. **Create the database:**
   ```sql
   CREATE DATABASE webapp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

7. **Run the server:**
   ```powershell
   python main.py
   ```

   Or with uvicorn directly:
   ```powershell
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Documentation

Once the server is running, access the interactive API documentation at:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## API Endpoints

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `POST /api/users/me/avatar` - Upload user avatar
- `GET /api/users/{user_id}` - Get user by ID
- `GET /api/users/` - Get all users (with search)
- `DELETE /api/users/me` - Delete account

### Items
- `POST /api/items/` - Create new item
- `POST /api/items/{item_id}/images` - Upload item images
- `GET /api/items/` - Get all items (with filters)
- `GET /api/items/{item_id}` - Get item by ID
- `PUT /api/items/{item_id}` - Update item
- `DELETE /api/items/{item_id}` - Delete item
- `GET /api/items/user/{user_id}` - Get user's items

### Travels
- `POST /api/travels/` - Create new travel listing
- `POST /api/travels/{travel_id}/images` - Upload travel images
- `GET /api/travels/` - Get all travels (with filters)
- `GET /api/travels/{travel_id}` - Get travel by ID
- `PUT /api/travels/{travel_id}` - Update travel
- `DELETE /api/travels/{travel_id}` - Delete travel
- `GET /api/travels/user/{user_id}` - Get user's travels

### Bookings
- `POST /api/bookings/` - Create new booking
- `GET /api/bookings/` - Get current user's bookings
- `GET /api/bookings/travel/{travel_id}` - Get travel's bookings (owner only)
- `GET /api/bookings/{booking_id}` - Get booking by ID
- `PUT /api/bookings/{booking_id}` - Update booking
- `DELETE /api/bookings/{booking_id}` - Cancel booking

### Reviews
- `POST /api/reviews/` - Create new review
- `POST /api/reviews/{review_id}/images` - Upload review images
- `GET /api/reviews/item/{item_id}` - Get item reviews
- `GET /api/reviews/travel/{travel_id}` - Get travel reviews
- `GET /api/reviews/user/{user_id}` - Get user reviews
- `GET /api/reviews/{review_id}` - Get review by ID
- `PUT /api/reviews/{review_id}` - Update review
- `DELETE /api/reviews/{review_id}` - Delete review
- `POST /api/reviews/{review_id}/helpful` - Mark review as helpful

## Database Schema

### Users Table
- id, username, email, password, full_name, phone, role, profile_image, bio, location, timestamps

### Items Table
- id, user_id, title, description, category, price, status, location, condition, images, tags, views, timestamps

### Travels Table
- id, user_id, title, description, travel_type, from_location, to_location, departure_time, arrival_time, price, available_seats, vehicle_type, vehicle_details, status, images, amenities, views, timestamps

### Bookings Table
- id, user_id, travel_id, seats_booked, total_price, status, pickup_location, dropoff_location, special_requests, payment_method, payment_status, timestamps

### Reviews Table
- id, user_id, item_id, travel_id, rating, title, comment, images, helpful_count, timestamps

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After logging in or registering, include the token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

## Error Handling

All errors return a consistent JSON format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Development

### Running Tests
```powershell
pytest tests/
```

### Database Migrations
The database is automatically initialized on server startup. For manual initialization:
```python
from config.database import init_db
init_db()
```

## Production Deployment

1. Set `reload=False` in uvicorn configuration
2. Use a production-grade server like gunicorn with uvicorn workers
3. Set up proper environment variables
4. Enable HTTPS
5. Configure proper CORS origins
6. Set up database connection pooling
7. Implement rate limiting
8. Enable logging and monitoring

## Environment Variables

See `.env.example` for all available configuration options.

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
