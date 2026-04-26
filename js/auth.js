// Simplified Authentication - Frontend Only (No Backend Required)
// Uses localStorage for session management

class AuthService {
  constructor() {
    this.isReady = true;
    this.user = null;
    this.loadUser();
  }

  // Load user from localStorage
  loadUser() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      this.user = {
        email: localStorage.getItem('userEmail') || 'user@example.com',
        id: localStorage.getItem('userId') || 'user_' + Date.now(),
        name: localStorage.getItem('userName') || 'Guest User'
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  // Get current user
  getUser() {
    return this.user;
  }

  // Get user display name
  getDisplayName() {
    return this.user ? (this.user.name || this.user.email) : 'Guest';
  }

  // Get user email
  getEmail() {
    return this.user ? this.user.email : null;
  }

  // Sign in user (stores in localStorage)
  signIn(email, password) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userId', 'user_' + Date.now());
    localStorage.setItem('userName', email.split('@')[0]);
    this.loadUser();
    return true;
  }

  // Sign out user
  signOut() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    this.user = null;
    window.location.href = 'Login.html';
  }

  // Get auth token (returns dummy token)
  getToken() {
    return this.isAuthenticated() ? 'dummy_token_' + Date.now() : null;
  }
}

// Create global auth service instance
const authService = new AuthService();

// Dispatch ready event
setTimeout(() => {
  window.dispatchEvent(new CustomEvent('authReady'));
}, 100);

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = authService;
}

      }, 100);
    });
  }

  // Sync user with backend (create/update user profile)
  async syncUserWithBackend() {
    try {
      const response = await api.users.getProfile();
      console.log('User synced with backend:', response);
      return response.data.user;
    } catch (error) {
      console.error('Failed to sync user:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.clerk && this.clerk.user !== null;
  }

  // Get current user
  getCurrentUser() {
    return this.clerk?.user || null;
  }

  // Get user ID
  getUserId() {
    return this.clerk?.user?.id || null;
  }

  // Get user email
  getUserEmail() {
    return this.clerk?.user?.primaryEmailAddress?.emailAddress || null;
  }

  // Get session token
  async getToken() {
    if (!this.clerk || !this.clerk.session) {
      return null;
    }
    return await this.clerk.session.getToken();
  }

  // Sign out
  async signOut() {
    if (!this.clerk) return;
    
    try {
      await this.clerk.signOut();
      localStorage.clear();
      window.location.href = 'Login.html';
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }

  // Redirect to login if not authenticated
  requireAuth(redirectUrl = 'Login.html') {
    if (!this.isAuthenticated()) {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }

  // Get user display name
  getDisplayName() {
    const user = this.getCurrentUser();
    if (!user) return 'Guest';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.username) return user.username;
    return user.primaryEmailAddress?.emailAddress || 'User';
  }

  // Get user avatar URL
  getAvatarUrl() {
    return this.getCurrentUser()?.imageUrl || '';
  }
}

// Create global auth service instance
const authService = new AuthService();

// Initialize on page load
window.addEventListener('load', async () => {
  try {
    await authService.init();
    
    // Trigger custom event when auth is ready
    window.dispatchEvent(new CustomEvent('authReady', { 
      detail: { 
        isAuthenticated: authService.isAuthenticated(),
        user: authService.getCurrentUser()
      }
    }));
  } catch (error) {
    console.error('Auth initialization error:', error);
  }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthService, authService };
}
