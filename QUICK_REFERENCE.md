# 🚀 Quick Reference - Backend Implementation

## 📝 Setup Checklist

### 1. One-Time Setup
```powershell
# Run the setup script
cd "d:\Web Project"
.\setup-backend.ps1
```

### 2. Configure API Keys

Edit `backend\.env`:
```env
# Get from https://dashboard.clerk.com/ → API Keys
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Get from https://cloudinary.com/ → Dashboard
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=123456
CLOUDINARY_API_SECRET=xxxxx
```

### 3. Start Backend
```powershell
cd "d:\Web Project\backend"
npm run dev
```

### 4. Test API
Open in browser: `d:\Web Project\api-test.html`

---

## 📚 Common Code Snippets

### Add to ALL HTML files (before `</body>`)
```html
<script src="js/api.js"></script>
<script src="js/auth.js"></script>
```

### Protect a Page (require login)
```javascript
window.addEventListener('authReady', () => {
  if (!authService.isAuthenticated()) {
    authService.requireAuth('Login.html');
  }
});
```

### Create Item (add.html)
```javascript
const formData = new FormData();
formData.append('title', 'Camera');
formData.append('description', 'Professional camera');
formData.append('category', 'Electronics');
formData.append('price', 50);
formData.append('priceUnit', 'day');
formData.append('images', fileInput.files[0]); // image file

const response = await api.items.create(formData);
```

### Get All Items (itemlisting.html)
```javascript
const response = await api.items.getAll({
  page: 1,
  limit: 20,
  category: 'Electronics',
  search: 'camera'
});

const items = response.data.items;
```

### Get Single Item (itemdetail.html)
```javascript
const itemId = new URLSearchParams(window.location.search).get('id');
const response = await api.items.getById(itemId);
const item = response.data.item;
```

### Create Booking
```javascript
const response = await api.bookings.create({
  type: 'item',
  itemId: '12345',
  dates: {
    startDate: '2025-12-10',
    endDate: '2025-12-15'
  }
});
```

### Search Items
```javascript
const response = await api.items.getAll({
  search: searchTerm,
  minPrice: 10,
  maxPrice: 100
});
```

### Get User's Items (userddash.html)
```javascript
const userId = authService.getUserId();
const response = await api.items.getByUser(userId);
```

### Add to Favorites
```javascript
await api.users.addFavorite(itemId);
```

### Get User Stats
```javascript
const response = await api.users.getStats();
const stats = response.data.stats;
```

---

## 🛠️ Troubleshooting

### Backend won't start
```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <process_id> /F
```

### CORS errors
Make sure in `backend\.env`:
```env
ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
```

### MongoDB not connected
```powershell
# Start MongoDB service
net start MongoDB

# Or use MongoDB Atlas (cloud):
# Update MONGODB_URI in .env to Atlas connection string
```

### Authentication not working
1. Check Clerk keys in `.env`
2. Update Login.html Clerk script URL
3. Clear browser cache and localStorage

---

## 📖 File Structure

```
d:\Web Project\
├── backend/                 # Backend API server
│   ├── config/             # Database & Cloudinary
│   ├── middleware/         # Auth, upload, errors
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── .env                # Configuration (you create this)
│   ├── server.js           # Main server file
│   └── package.json        # Dependencies
│
├── js/                     # Frontend JavaScript
│   ├── api.js              # API utility class
│   └── auth.js             # Auth service
│
├── *.html                  # Your HTML pages
├── api-test.html           # API testing page
├── setup-backend.ps1       # Setup script
└── INTEGRATION_GUIDE.md    # Full documentation
```

---

## 🔗 Important URLs

- **Backend Health**: http://localhost:5000/health
- **API Base**: http://localhost:5000/api/v1
- **API Test Page**: Open `api-test.html` in browser
- **Clerk Dashboard**: https://dashboard.clerk.com/
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Cloudinary**: https://cloudinary.com/

---

## ✅ Pages Already Updated

- ✅ `add.html` - Fully integrated with backend API
- ⏳ Other pages need script tags and API calls

---

## 🎯 Next Actions

1. **Run setup script**: `.\setup-backend.ps1`
2. **Configure .env file** with your API keys
3. **Start backend**: `cd backend; npm run dev`
4. **Test API**: Open `api-test.html`
5. **Add scripts to other pages**:
   ```html
   <script src="js/api.js"></script>
   <script src="js/auth.js"></script>
   ```
6. **Replace mock data with API calls** (see INTEGRATION_GUIDE.md)

---

## 💡 Pro Tips

- Use Chrome DevTools → Network tab to debug API calls
- Check browser console for errors
- Backend logs show in terminal where you ran `npm run dev`
- Use `api-test.html` to verify backend is working
- Read `INTEGRATION_GUIDE.md` for complete examples

---

Need help? Check the full guide: `INTEGRATION_GUIDE.md`
