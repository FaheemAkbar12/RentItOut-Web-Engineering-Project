// API Configuration for RentItOut Frontend
const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api/v1',
  TIMEOUT: 10000,
  ENDPOINTS: {
    // Items
    ITEMS: '/items',
    ITEM_BY_ID: (id) => `/items/${id}`,
    USER_ITEMS: (userId) => `/items/user/${userId}`,
    
    // Travel
    TRAVEL: '/travel',
    TRAVEL_BY_ID: (id) => `/travel/${id}`,
    BOOK_TRAVEL: (id) => `/travel/${id}/book`,
    
    // Bookings
    BOOKINGS: '/bookings',
    MY_BOOKINGS: '/bookings/my-bookings',
    BOOKING_BY_ID: (id) => `/bookings/${id}`,
    BOOKING_STATUS: (id) => `/bookings/${id}/status`,
    CANCEL_BOOKING: (id) => `/bookings/${id}/cancel`,
    
    // Reviews
    REVIEWS: '/reviews',
    REVIEW_HELPFUL: (id) => `/reviews/${id}/helpful`,
    REVIEW_RESPONSE: (id) => `/reviews/${id}/response`,
    
    // Users
    USER_PROFILE: '/users/profile',
    USER_STATS: '/users/stats',
    USER_FAVORITES: '/users/favorites',
    ADD_FAVORITE: (itemId) => `/users/favorites/items/${itemId}`,
    REMOVE_FAVORITE: (itemId) => `/users/favorites/items/${itemId}`,
    PUBLIC_PROFILE: (userId) => `/users/${userId}`
  }
};

// API Helper Class
class API {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Get Clerk session token
  async getAuthToken() {
    if (window.Clerk && window.Clerk.session) {
      const token = await window.Clerk.session.getToken();
      return token;
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
