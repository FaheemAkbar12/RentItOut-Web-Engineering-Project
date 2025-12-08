// Authentication Helper using Clerk
class AuthService {
  constructor() {
    this.clerk = null;
    this.user = null;
    this.isReady = false;
  }

  // Initialize Clerk
  async init() {
    if (this.isReady) return;

    try {
      // Wait for Clerk to load
      await this.waitForClerk();
      this.clerk = window.Clerk;
      
      // Check if user is already signed in
      if (this.clerk.user) {
        this.user = this.clerk.user;
        await this.syncUserWithBackend();
      }

      this.isReady = true;
      console.log('Auth Service initialized');
    } catch (error) {
      console.error('Failed to initialize Auth Service:', error);
    }
  }

  // Wait for Clerk to load
  waitForClerk() {
    return new Promise((resolve, reject) => {
      if (window.Clerk) {
        resolve(window.Clerk);
        return;
      }

      let attempts = 0;
      const maxAttempts = 50;

      const interval = setInterval(() => {
        attempts++;
        if (window.Clerk) {
          clearInterval(interval);
          resolve(window.Clerk);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error('Clerk failed to load'));
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
