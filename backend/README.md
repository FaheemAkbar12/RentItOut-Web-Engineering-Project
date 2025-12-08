# RentItOut Backend API

Complete backend API for the RentItOut rental and travel sharing platform.

## 🚀 Features

- **Authentication**: Clerk integration for secure user authentication
- **Items Management**: CRUD operations for rental items
- **Travel Listings**: Ride-sharing and travel booking system
- **Bookings**: Complete booking lifecycle management
- **Reviews**: Rating and review system for items, travels, and users
- **User Profiles**: User management with stats and preferences
- **Image Upload**: Cloudinary integration for image storage
- **Search & Filters**: Advanced search with pagination
- **Geolocation**: Location-based search for items and travels

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Clerk account (for authentication)
- Cloudinary account (for image uploads)

## 🔧 Installation

1. **Clone and navigate to backend folder**:
```bash
cd "d:\Web Project\backend"
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create environment file**:
```bash
copy .env.example .env
```

4. **Configure environment variables** in `.env`:
```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/rentitout

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_FRONTEND_API=your-frontend-api.clerk.accounts.dev

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:5500
```

5. **Start MongoDB** (if running locally):
```bash
mongod
```

6. **Start the server**:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js       # MongoDB connection
│   └── cloudinary.js     # Cloudinary setup
├── middleware/
│   ├── auth.js           # Clerk authentication
│   ├── errorHandler.js   # Global error handler
│   └── upload.js         # Multer file upload
├── models/
│   ├── Item.js           # Item schema
│   ├── Travel.js         # Travel schema
│   ├── Booking.js        # Booking schema
│   ├── Review.js         # Review schema
│   └── User.js           # User schema
├── routes/
│   ├── items.js          # Item endpoints
│   ├── travel.js         # Travel endpoints
│   ├── bookings.js       # Booking endpoints
│   ├── reviews.js        # Review endpoints
│   └── users.js          # User endpoints
├── .env.example          # Environment template
├── .gitignore
├── package.json
└── server.js             # Express app entry point
```

## 🔌 API Endpoints

### Authentication
All protected routes require `Authorization: Bearer <clerk_token>` header.

### Items (`/api/v1/items`)
- `GET /` - Get all items (with filters)
- `GET /:id` - Get single item
- `POST /` - Create new item (auth required)
- `PUT /:id` - Update item (auth required)
- `DELETE /:id` - Delete item (auth required)
- `GET /user/:userId` - Get user's items

### Travel (`/api/v1/travel`)
- `GET /` - Get all travel listings
- `GET /:id` - Get single travel
- `POST /` - Create travel listing (auth required)
- `PUT /:id` - Update travel (auth required)
- `POST /:id/book` - Book a seat (auth required)
- `DELETE /:id` - Cancel travel (auth required)

### Bookings (`/api/v1/bookings`)
- `GET /my-bookings` - Get user's bookings (auth required)
- `GET /:id` - Get single booking (auth required)
- `POST /` - Create booking (auth required)
- `PATCH /:id/status` - Update booking status (auth required)
- `POST /:id/cancel` - Cancel booking (auth required)

### Reviews (`/api/v1/reviews`)
- `GET /` - Get reviews (with filters)
- `POST /` - Create review (auth required)
- `POST /:id/helpful` - Mark review as helpful (auth required)
- `POST /:id/response` - Add owner response (auth required)

### Users (`/api/v1/users`)
- `GET /profile` - Get current user profile (auth required)
- `PUT /profile` - Update profile (auth required)
- `GET /stats` - Get user statistics (auth required)
- `GET /favorites` - Get user favorites (auth required)
- `POST /favorites/items/:itemId` - Add to favorites (auth required)
- `DELETE /favorites/items/:itemId` - Remove from favorites (auth required)
- `GET /:userId` - Get public user profile

### Health Check
- `GET /health` - Server health status

## 🔍 Query Parameters

### Items & Travel Listings
```
?page=1&limit=20          # Pagination
&category=Electronics      # Filter by category
&search=camera            # Text search
&minPrice=10&maxPrice=100 # Price range
&availability=available   # Availability status
&sortBy=createdAt         # Sort field
&order=desc               # Sort order
&city=NewYork            # Location filter
```

## 🛠️ Error Handling

All errors return JSON in this format:
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

Status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## 🔐 Security Features

- Helmet.js for security headers
- CORS protection
- Rate limiting (100 requests per 15 minutes)
- Input validation with express-validator
- File upload restrictions (5MB, images only)
- Clerk authentication integration

## 📝 Database Models

### Item
- Title, description, category, price
- Owner information
- Images (Cloudinary URLs)
- Location with geospatial indexing
- Availability tracking
- Rating system

### Travel
- Driver information
- Route (origin/destination)
- Departure/arrival times
- Seating management
- Vehicle details
- Amenities and rules

### Booking
- Item or travel reference
- Renter and owner info
- Date range
- Pricing breakdown
- Status tracking
- Payment information

### Review
- Rating (1-5 stars)
- Comment and title
- Aspect ratings
- Helpful votes
- Owner response
- Verification status

### User
- Clerk integration
- Profile information
- Verification status
- Statistics and ratings
- Favorites
- Preferences

## 🧪 Testing

The API can be tested using:
- Postman/Thunder Client
- cURL commands
- Frontend integration

Example cURL:
```bash
curl http://localhost:5000/health
```

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ORM
- **@clerk/clerk-sdk-node**: Authentication
- **cloudinary**: Image hosting
- **multer**: File uploads
- **helmet**: Security headers
- **cors**: Cross-origin requests
- **compression**: Response compression
- **morgan**: Request logging
- **express-rate-limit**: Rate limiting

## 🚀 Deployment

1. Set `NODE_ENV=production` in environment
2. Use MongoDB Atlas for database
3. Configure production Clerk keys
4. Set up Cloudinary production account
5. Deploy to:
   - Heroku
   - AWS EC2
   - DigitalOcean
   - Render
   - Railway

## 📞 Support

For issues or questions, check the documentation or create an issue in the project repository.

## 📄 License

ISC
