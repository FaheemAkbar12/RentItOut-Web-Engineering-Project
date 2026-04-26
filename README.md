# RentItOut - Rental & Travel Sharing Platform

A comprehensive web platform for renting items and sharing rides, built with vanilla JavaScript, Node.js, Express, and MongoDB.

![RentItOut Platform](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 Features

### Rental System
- **Browse Items**: Search and filter rental items by category, location, and price
- **Item Details**: View comprehensive item information with image gallery
- **Book Items**: Interactive booking system with date selection and pricing
- **Add Listings**: Post your items for rent with images and details
- **Reviews & Ratings**: Rate and review rental experiences

### Travel Sharing
- **Find Rides**: Search for ride shares between Pakistani cities
- **Ride Details**: View driver information, amenities, and pricing
- **Book Seats**: Select seats and confirm bookings
- **Post Rides**: List your available rides with vehicle details
- **Real-time Chat**: Message drivers directly through the platform

### User Features
- **User Dashboard**: Manage your listings and bookings
- **Authentication**: Secure login with Clerk integration
- **Notifications**: Real-time notification system
- **Dark Mode**: Full dark mode support
- **Responsive Design**: Works seamlessly on all devices

## 🚀 Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **TailwindCSS** - Utility-first styling
- **Vanilla JavaScript** - No framework dependencies
- **Material Symbols** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Clerk** - Authentication
- **Cloudinary** - Image storage

## 📋 Prerequisites

- Node.js v14 or higher
- MongoDB (local or Atlas)
- Clerk account (optional for auth)
- Cloudinary account (optional for image uploads)

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/rentitout.git
cd rentitout
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/rentitout

# Clerk Authentication (optional)
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:5500
```

Start the backend:
```bash
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Frontend Setup

Open `index.html` or any page with a local server:

**Using Live Server (VS Code extension):**
- Right-click on `home.html` → Open with Live Server

**Using Python:**
```bash
python -m http.server 8000
```

**Using Node.js:**
```bash
npx http-server -p 8000
```

Frontend runs on: `http://localhost:8000`

## 📁 Project Structure

```
rentitout/
├── backend/
│   ├── config/          # Database & Cloudinary config
│   ├── middleware/      # Auth, upload, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── server.js        # Entry point
│   └── package.json
├── js/
│   ├── api.js           # API wrapper
│   ├── auth.js          # Authentication
│   ├── sidebar.js       # Sidebar component
│   ├── utils.js         # Utility functions
│   └── notifications.js # Notification system
├── css/
│   └── custom.css       # Custom styles
├── components/
│   └── sidebar.html     # Reusable components
├── *.html               # Frontend pages
└── README.md
```

## 🎯 Main Pages

- **home.html** - Landing page with featured items and rides
- **itemlisting.html** - Browse all rental items
- **itemdetail.html** - Item details with booking
- **add.html** - Add new rental items
- **travel.html** - Browse ride shares
- **traveldetail.html** - Ride details with booking
- **addride.html** - Post new rides
- **userddash.html** - User dashboard
- **Login.html** - User authentication
- **signup.html** - New user registration

## 🔌 API Endpoints

### Items
- `GET /api/v1/items` - Get all items
- `POST /api/v1/items` - Create item
- `GET /api/v1/items/:id` - Get item by ID
- `PUT /api/v1/items/:id` - Update item
- `DELETE /api/v1/items/:id` - Delete item

### Travel
- `GET /api/v1/travel` - Get all rides
- `POST /api/v1/travel` - Create ride
- `GET /api/v1/travel/:id` - Get ride by ID
- `POST /api/v1/travel/:id/book` - Book ride

### Bookings
- `GET /api/v1/bookings` - Get all bookings
- `POST /api/v1/bookings` - Create booking
- `PATCH /api/v1/bookings/:id/status` - Update booking status
- `POST /api/v1/bookings/:id/cancel` - Cancel booking

### Reviews
- `GET /api/v1/reviews` - Get reviews
- `POST /api/v1/reviews` - Create review
- `POST /api/v1/reviews/:id/helpful` - Mark review helpful

## 🌍 Localization

The platform is localized for **Pakistan**:
- 15 major Pakistani cities
- USD currency
- Pakistani phone number validation
- Local date/time formats

## 🎨 Features Showcase

### Interactive Modals
- Booking confirmation with date selection
- Real-time pricing calculation
- Chat interface with simulated responses

### Dynamic Content
- Items and rides loaded from backend API
- LocalStorage fallback for offline functionality
- Click-to-detail navigation

### Responsive Design
- Mobile-first approach
- Animated sidebar for mobile
- Touch-friendly interfaces

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- Backend server must be running for full functionality
- Some features require authentication setup with Clerk
- Image uploads require Cloudinary configuration

## 🔮 Future Enhancements

- [ ] Real-time messaging system
- [ ] Payment integration
- [ ] Push notifications
- [ ] Advanced search filters
- [ ] User verification system
- [ ] Mobile app version

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for the sharing economy**
