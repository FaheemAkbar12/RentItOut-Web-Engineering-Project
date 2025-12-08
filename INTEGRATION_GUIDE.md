# Backend Integration Guide for RentItOut

## 📋 Setup Checklist

### 1. Backend Setup
- [x] Created backend folder with all files
- [x] Installed npm dependencies
- [x] Created .env file
- [ ] Install MongoDB (choose one):
  - Local: Download from https://www.mongodb.com/try/download/community
  - Cloud: Sign up at https://www.mongodb.com/cloud/atlas
- [ ] Get Clerk API keys from https://dashboard.clerk.com/
- [ ] Get Cloudinary credentials from https://cloudinary.com/
- [ ] Update .env file with your keys
- [ ] Start backend server: `npm run dev`

### 2. Frontend Integration
- [x] Created API utility (`js/api.js`)
- [x] Created Auth service (`js/auth.js`)
- [ ] Include scripts in HTML pages
- [ ] Update forms to use API
- [ ] Test authentication flow

## 🚀 Quick Start

### Step 1: Start MongoDB
```powershell
# If installed locally, start MongoDB service
net start MongoDB

# Or use MongoDB Atlas (cloud) - no installation needed
```

### Step 2: Configure Environment
Edit `backend\.env` with your credentials:
```env
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Step 3: Start Backend Server
```powershell
cd "d:\Web Project\backend"
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running on port 5000
📍 Environment: development
```

### Step 4: Include Scripts in HTML
Add to ALL HTML pages (before closing `</body>` tag):
```html
<!-- API and Auth Scripts -->
<script src="js/api.js"></script>
<script src="js/auth.js"></script>
```

## 📚 API Usage Examples

### Example 1: Create an Item (add.html)
```javascript
// When user submits the form
async function handleItemSubmit(event) {
  event.preventDefault();
  
  // Get form data
  const formData = new FormData();
  formData.append('title', document.getElementById('title').value);
  formData.append('description', document.getElementById('description').value);
  formData.append('category', document.getElementById('category').value);
  formData.append('price', document.getElementById('price').value);
  formData.append('priceUnit', 'day');
  
  // Add images
  const fileInput = document.getElementById('images');
  for (let i = 0; i < fileInput.files.length; i++) {
    formData.append('images', fileInput.files[i]);
  }
  
  try {
    const response = await api.items.create(formData);
    console.log('Item created:', response);
    alert('Item listed successfully!');
    window.location.href = 'itemlisting.html';
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to create item: ' + error.message);
  }
}
```

### Example 2: Get All Items (itemlisting.html)
```javascript
async function loadItems() {
  try {
    const response = await api.items.getAll({
      page: 1,
      limit: 20,
      category: 'Electronics', // optional filter
      availability: 'available'
    });
    
    const items = response.data.items;
    displayItems(items); // Your function to render items
  } catch (error) {
    console.error('Error loading items:', error);
  }
}

// Call on page load
window.addEventListener('load', loadItems);
```

### Example 3: Get Single Item (itemdetail.html)
```javascript
async function loadItemDetails() {
  // Get item ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('id');
  
  if (!itemId) {
    alert('Item not found');
    return;
  }
  
  try {
    const response = await api.items.getById(itemId);
    const item = response.data.item;
    
    // Update page with item data
    document.getElementById('itemTitle').textContent = item.title;
    document.getElementById('itemPrice').textContent = `$${item.price}`;
    document.getElementById('itemDescription').textContent = item.description;
    // ... update other fields
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Example 4: Create a Booking
```javascript
async function bookItem(itemId) {
  const bookingData = {
    type: 'item',
    itemId: itemId,
    dates: {
      startDate: '2025-12-10',
      endDate: '2025-12-15'
    },
    notes: 'Need this for a project'
  };
  
  try {
    const response = await api.bookings.create(bookingData);
    console.log('Booking created:', response);
    alert('Booking successful!');
  } catch (error) {
    console.error('Error:', error);
    alert('Booking failed: ' + error.message);
  }
}
```

### Example 5: Get User's Items (userddash.html)
```javascript
async function loadMyItems() {
  const userId = authService.getUserId();
  
  try {
    const response = await api.items.getByUser(userId);
    const items = response.data.items;
    
    // Display user's items
    displayItems(items);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Example 6: Add to Favorites
```javascript
async function toggleFavorite(itemId) {
  try {
    const response = await api.users.addFavorite(itemId);
    console.log('Added to favorites:', response);
    alert('Added to favorites!');
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Example 7: Search Items
```javascript
async function searchItems(searchTerm) {
  try {
    const response = await api.items.getAll({
      search: searchTerm,
      page: 1,
      limit: 20
    });
    
    const items = response.data.items;
    displayItems(items);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Example 8: Get User Stats (userddash.html)
```javascript
async function loadUserStats() {
  try {
    const response = await api.users.getStats();
    const stats = response.data.stats;
    
    document.getElementById('activeItems').textContent = stats.activeItems;
    document.getElementById('totalEarnings').textContent = `$${stats.totalEarnings}`;
    document.getElementById('totalRentals').textContent = stats.itemsRented;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## 🔐 Authentication Examples

### Check if User is Logged In
```javascript
// Wait for auth to be ready
window.addEventListener('authReady', (event) => {
  if (event.detail.isAuthenticated) {
    console.log('User is logged in:', event.detail.user);
    loadUserData();
  } else {
    console.log('User not logged in');
    // Redirect to login if needed
    authService.requireAuth();
  }
});
```

### Protect a Page (require login)
```javascript
// At the top of your page script
window.addEventListener('authReady', () => {
  if (!authService.isAuthenticated()) {
    authService.requireAuth('Login.html');
  }
});
```

### Display User Info
```javascript
window.addEventListener('authReady', () => {
  if (authService.isAuthenticated()) {
    const userName = authService.getDisplayName();
    const userEmail = authService.getUserEmail();
    const userAvatar = authService.getAvatarUrl();
    
    document.getElementById('userName').textContent = userName;
    document.getElementById('userEmail').textContent = userEmail;
    document.getElementById('userAvatar').src = userAvatar;
  }
});
```

### Logout
```javascript
async function logout() {
  await authService.signOut();
  // Will redirect to login page automatically
}
```

## 🎨 Updated Page Templates

### home.html - Load Items
```javascript
async function loadTrendingItems() {
  try {
    const response = await api.items.getAll({
      page: 1,
      limit: 6,
      sortBy: 'views',
      order: 'desc'
    });
    
    const items = response.data.items;
    // Update your existing displayItems() function to use real data
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### itemlisting.html - Search & Filter
```javascript
async function handleSearch() {
  const searchTerm = document.getElementById('searchInput').value;
  const category = document.getElementById('categorySelect').value;
  
  try {
    const response = await api.items.getAll({
      search: searchTerm,
      category: category !== 'all' ? category : undefined,
      page: 1,
      limit: 20
    });
    
    displayItems(response.data.items);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### travel.html - Search Rides
```javascript
async function searchRides() {
  const origin = document.getElementById('origin').value;
  const destination = document.getElementById('destination').value;
  const date = document.getElementById('date').value;
  const seats = document.getElementById('seats').value;
  
  try {
    const response = await api.travel.getAll({
      origin,
      destination,
      date,
      seats
    });
    
    displayRides(response.data.travels);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## 🐛 Troubleshooting

### CORS Errors
If you see CORS errors in console:
1. Check backend is running on port 5000
2. Verify `ALLOWED_ORIGINS` in `.env` includes your frontend URL
3. Restart backend after changing .env

### Authentication Errors
1. Verify Clerk keys in both frontend and backend
2. Check Clerk script is loading in browser console
3. Make sure authService.init() is called

### API Not Found
1. Check backend server is running
2. Verify API_CONFIG.BASE_URL in `js/api.js` matches your backend
3. Check network tab in browser DevTools

### MongoDB Connection Errors
1. Make sure MongoDB is running: `net start MongoDB`
2. Check MONGODB_URI in `.env`
3. Try MongoDB Atlas (cloud) instead of local

## 📖 Next Steps

1. **Add scripts to each HTML page**
2. **Replace mock data with API calls**
3. **Test each feature**
4. **Add loading states and error handling**
5. **Deploy backend to production** (Heroku, Railway, etc.)

## 🔗 Useful Links

- Backend API: http://localhost:5000/health
- Clerk Dashboard: https://dashboard.clerk.com/
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Cloudinary: https://cloudinary.com/
