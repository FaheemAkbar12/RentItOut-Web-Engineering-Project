# RentItOut - Backend Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Browser)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Login    │  │ Signup   │  │  Add     │  │ Listing  │  ...  │
│  │ .html    │  │ .html    │  │ .html    │  │ .html    │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │             │             │               │
│       └─────────────┴─────────────┴─────────────┘               │
│                          │                                       │
│              ┌───────────▼────────────┐                         │
│              │   js/api.js            │  API Helper             │
│              │   js/auth.js           │  Auth Helper            │
│              └───────────┬────────────┘                         │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           │ HTTP Requests (fetch)
                           │ Bearer Token Authentication
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    CLERK AUTHENTICATION                          │
│              (handles user login/signup/sessions)                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                  BACKEND API SERVER (Express.js)                 │
│                    http://localhost:5000                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Middleware Layer                         │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  • CORS          • Helmet (Security)   • Rate Limiting     │ │
│  │  • Auth Check    • File Upload         • Error Handler    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │                   API Routes (v1)                         │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │  /api/v1/items     - Items CRUD, Search, Filter          │  │
│  │  /api/v1/travel    - Travel listings, Booking            │  │
│  │  /api/v1/bookings  - Create, Update, Cancel bookings     │  │
│  │  /api/v1/reviews   - Reviews, Ratings, Responses         │  │
│  │  /api/v1/users     - Profile, Stats, Favorites           │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                      │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │                   Business Logic                          │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │  • Validation      • Price calculation                    │  │
│  │  • Authorization   • Availability checking                │  │
│  │  • Data Transform  • Rating updates                       │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                      │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │                    Database Models                        │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │  Item      Travel     Booking     Review     User         │  │
│  └────────────────────────┬─────────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      MONGODB DATABASE                            │
│                   mongodb://localhost:27017                      │
├──────────────────────────────────────────────────────────────────┤
│  Collections:                                                    │
│  • items       - Rental items                                    │
│  • travels     - Ride sharing trips                              │
│  • bookings    - Reservations                                    │
│  • reviews     - Ratings & feedback                              │
│  • users       - User profiles & stats                           │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    CLOUDINARY (Image Storage)                     │
│                      https://cloudinary.com                       │
├──────────────────────────────────────────────────────────────────┤
│  Stores:                                                         │
│  • Item photos                                                   │
│  • User avatars                                                  │
│  • Review images                                                 │
└──────────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow Example: Creating an Item

```
1. User fills form in add.html
         │
         ▼
2. JavaScript creates FormData with item details + images
         │
         ▼
3. api.items.create(formData) called
         │
         ▼
4. authService gets Clerk session token
         │
         ▼
5. POST request to: http://localhost:5000/api/v1/items
   Headers: { Authorization: "Bearer <token>" }
   Body: FormData (multipart/form-data)
         │
         ▼
6. Backend middleware checks authentication
         │
         ▼
7. Multer processes file uploads
         │
         ▼
8. Images uploaded to Cloudinary
         │
         ▼
9. Item saved to MongoDB with:
   - Item details
   - Owner info (from Clerk token)
   - Image URLs (from Cloudinary)
         │
         ▼
10. Response sent back to frontend
         │
         ▼
11. Frontend redirects to itemlisting.html
```

## 📊 Data Flow Diagram

```
Frontend                API                 Database
  ┌─┐                  ┌─┐                   ┌─┐
  │ │                  │ │                   │ │
  │ │──GET /items──────▶│ │                   │ │
  │ │                  │ │──Query Items────▶│ │
  │ │                  │ │◀─Items Data──────│ │
  │ │◀─Items JSON──────│ │                   │ │
  │ │                  │ │                   │ │
  │ │──POST /items─────▶│ │                   │ │
  │ │  (with token)    │ │──Verify Token──▶Clerk
  │ │                  │ │──Upload Image───▶Cloudinary
  │ │                  │ │──Save Item───────▶│ │
  │ │                  │ │◀─Created Item────│ │
  │ │◀─Success─────────│ │                   │ │
  └─┘                  └─┘                   └─┘
```

## 🔐 Authentication Flow

```
1. User enters email/password in Login.html
         │
         ▼
2. Clerk.client.signIn.create() called
         │
         ▼
3. Clerk verifies credentials
         │
         ▼
4. Session created, token generated
         │
         ▼
5. authService stores user info
         │
         ▼
6. Backend API call to sync user profile
   POST /api/v1/users/profile
         │
         ▼
7. MongoDB creates/updates user record
         │
         ▼
8. User redirected to home.html
```

## 📁 File Relationships

```
add.html
  │
  ├─ Uses: js/api.js (API calls)
  ├─ Uses: js/auth.js (Authentication)
  └─ Calls: api.items.create()
              │
              ▼
          backend/routes/items.js
              │
              ├─ Uses: backend/middleware/auth.js
              ├─ Uses: backend/middleware/upload.js
              ├─ Uses: backend/models/Item.js
              └─ Uses: backend/config/cloudinary.js
```

## 🌐 API Endpoints Map

```
/api/v1/
│
├── /items
│   ├── GET    /              → Get all items (filtered, paginated)
│   ├── GET    /:id           → Get single item
│   ├── POST   /              → Create item (auth required)
│   ├── PUT    /:id           → Update item (auth required)
│   ├── DELETE /:id           → Delete item (auth required)
│   └── GET    /user/:userId  → Get user's items
│
├── /travel
│   ├── GET    /              → Get all trips
│   ├── GET    /:id           → Get single trip
│   ├── POST   /              → Create trip (auth required)
│   ├── PUT    /:id           → Update trip (auth required)
│   ├── POST   /:id/book      → Book seat (auth required)
│   └── DELETE /:id           → Cancel trip (auth required)
│
├── /bookings
│   ├── GET    /my-bookings   → Get user's bookings (auth)
│   ├── GET    /:id           → Get single booking (auth)
│   ├── POST   /              → Create booking (auth)
│   ├── PATCH  /:id/status    → Update status (auth)
│   └── POST   /:id/cancel    → Cancel booking (auth)
│
├── /reviews
│   ├── GET    /              → Get reviews (filtered)
│   ├── POST   /              → Create review (auth)
│   ├── POST   /:id/helpful   → Mark helpful (auth)
│   └── POST   /:id/response  → Add response (auth)
│
└── /users
    ├── GET    /profile       → Get profile (auth)
    ├── PUT    /profile       → Update profile (auth)
    ├── GET    /stats         → Get stats (auth)
    ├── GET    /favorites     → Get favorites (auth)
    ├── POST   /favorites/items/:id   → Add favorite (auth)
    ├── DELETE /favorites/items/:id   → Remove favorite (auth)
    └── GET    /:userId       → Get public profile
```

## 💾 Database Schema Relationships

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│   User   │◀───────▶│   Item   │◀───────▶│ Booking  │
│ (Clerk)  │  owns   │          │ creates │          │
└──────────┘         └─────┬────┘         └────┬─────┘
     ▲                     │                   │
     │                     ▼                   ▼
     │               ┌──────────┐         ┌──────────┐
     └──────────────▶│  Review  │         │ Payment  │
        creates      │          │         │  (TBD)   │
                     └──────────┘         └──────────┘

┌──────────┐         ┌──────────┐
│   User   │◀───────▶│  Travel  │
│ (Driver) │  offers │          │
└──────────┘         └──────────┘
```

---

This architecture provides:
- ✅ Scalable REST API
- ✅ Secure authentication
- ✅ File upload handling
- ✅ Database persistence
- ✅ Error handling
- ✅ Rate limiting
- ✅ CORS protection
