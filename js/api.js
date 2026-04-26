// Simplified API - Frontend Only (No Backend Required)
// All data operations use localStorage

class API {
  constructor() {
    this.storage = {
      items: 'rentitout_items',
      travel: 'rentitout_travel',
      bookings: 'rentitout_bookings',
      reviews: 'rentitout_reviews',
      users: 'rentitout_users'
    };
  }

  // Initialize sample data if not exists
  initSampleData() {
    if (!localStorage.getItem(this.storage.items)) {
      localStorage.setItem(this.storage.items, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.storage.travel)) {
      localStorage.setItem(this.storage.travel, JSON.stringify([]));
    }
  }

  // Generic storage methods
  getFromStorage(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  }

  saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Items API
  items = {
    getAll: async () => {
      return this.getFromStorage(this.storage.items);
    },
    getById: async (id) => {
      const items = this.getFromStorage(this.storage.items);
      return items.find(item => item.id === id);
    },
    create: async (itemData) => {
      const items = this.getFromStorage(this.storage.items);
      const newItem = { ...itemData, id: Date.now().toString() };
      items.push(newItem);
      this.saveToStorage(this.storage.items, items);
      return newItem;
    }
  };

  // Travel API
  travel = {
    getAll: async () => {
      return this.getFromStorage(this.storage.travel);
    },
    getById: async (id) => {
      const travels = this.getFromStorage(this.storage.travel);
      return travels.find(travel => travel.id === id);
    },
    create: async (travelData) => {
      const travels = this.getFromStorage(this.storage.travel);
      const newTravel = { ...travelData, id: Date.now().toString() };
      travels.push(newTravel);
      this.saveToStorage(this.storage.travel, travels);
      return newTravel;
    }
  };

  // Bookings API
  bookings = {
    getAll: async () => {
      return this.getFromStorage(this.storage.bookings);
    },
    create: async (bookingData) => {
      const bookings = this.getFromStorage(this.storage.bookings);
      const newBooking = { ...bookingData, id: Date.now().toString() };
      bookings.push(newBooking);
      this.saveToStorage(this.storage.bookings, bookings);
      return newBooking;
    }
  };
}

// Create global API instance
const api = new API();
api.initSampleData();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}

    return null;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = await this.getAuthToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
      timeout: this.timeout
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  async post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  // PUT request
  async put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  // PATCH request
  async patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Upload file (multipart/form-data)
  async uploadFile(endpoint, formData) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = await this.getAuthToken();

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData // Don't set Content-Type, let browser handle it
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }

  // Items API
  items = {
    getAll: (params) => this.get(API_CONFIG.ENDPOINTS.ITEMS, params),
    getById: (id) => this.get(API_CONFIG.ENDPOINTS.ITEM_BY_ID(id)),
    create: (formData) => this.uploadFile(API_CONFIG.ENDPOINTS.ITEMS, formData),
    update: (id, data) => this.put(API_CONFIG.ENDPOINTS.ITEM_BY_ID(id), data),
    delete: (id) => this.delete(API_CONFIG.ENDPOINTS.ITEM_BY_ID(id)),
    getByUser: (userId) => this.get(API_CONFIG.ENDPOINTS.USER_ITEMS(userId))
  };

  // Travel API
  travel = {
    getAll: (params) => this.get(API_CONFIG.ENDPOINTS.TRAVEL, params),
    getById: (id) => this.get(API_CONFIG.ENDPOINTS.TRAVEL_BY_ID(id)),
    create: (data) => this.post(API_CONFIG.ENDPOINTS.TRAVEL, data),
    update: (id, data) => this.put(API_CONFIG.ENDPOINTS.TRAVEL_BY_ID(id), data),
    book: (id) => this.post(API_CONFIG.ENDPOINTS.BOOK_TRAVEL(id)),
    cancel: (id) => this.delete(API_CONFIG.ENDPOINTS.TRAVEL_BY_ID(id))
  };

  // Bookings API
  bookings = {
    create: (data) => this.post(API_CONFIG.ENDPOINTS.BOOKINGS, data),
    getMy: (params) => this.get(API_CONFIG.ENDPOINTS.MY_BOOKINGS, params),
    getById: (id) => this.get(API_CONFIG.ENDPOINTS.BOOKING_BY_ID(id)),
    updateStatus: (id, status) => this.patch(API_CONFIG.ENDPOINTS.BOOKING_STATUS(id), { status }),
    cancel: (id, reason) => this.post(API_CONFIG.ENDPOINTS.CANCEL_BOOKING(id), { reason })
  };

  // Reviews API
  reviews = {
    create: (data) => this.post(API_CONFIG.ENDPOINTS.REVIEWS, data),
    getAll: (params) => this.get(API_CONFIG.ENDPOINTS.REVIEWS, params),
    markHelpful: (id) => this.post(API_CONFIG.ENDPOINTS.REVIEW_HELPFUL(id)),
    addResponse: (id, comment) => this.post(API_CONFIG.ENDPOINTS.REVIEW_RESPONSE(id), { comment })
  };

  // Users API
  users = {
    getProfile: () => this.get(API_CONFIG.ENDPOINTS.USER_PROFILE),
    updateProfile: (data) => this.put(API_CONFIG.ENDPOINTS.USER_PROFILE, data),
    getStats: () => this.get(API_CONFIG.ENDPOINTS.USER_STATS),
    getFavorites: () => this.get(API_CONFIG.ENDPOINTS.USER_FAVORITES),
    addFavorite: (itemId) => this.post(API_CONFIG.ENDPOINTS.ADD_FAVORITE(itemId)),
    removeFavorite: (itemId) => this.delete(API_CONFIG.ENDPOINTS.REMOVE_FAVORITE(itemId)),
    getPublicProfile: (userId) => this.get(API_CONFIG.ENDPOINTS.PUBLIC_PROFILE(userId))
  };
}

// Create global API instance
const api = new API();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API, api, API_CONFIG };
}
