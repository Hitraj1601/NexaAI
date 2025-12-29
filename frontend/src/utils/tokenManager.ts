// Token management utilities
export const tokenManager = {
  // Check if token exists and is not expired
  isTokenValid(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;
    
    try {
      // Basic JWT payload check (without verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  },

  // Clear expired tokens
  clearExpiredToken(): void {
    if (!this.isTokenValid()) {
      localStorage.removeItem('accessToken');
    }
  },

  // Get token with validation
  getValidToken(): string | null {
    this.clearExpiredToken();
    return localStorage.getItem('accessToken');
  },

  // Set token with expiry tracking
  setToken(token: string): void {
    localStorage.setItem('accessToken', token);
  },

  // Clear token and redirect to login
  logout(): void {
    localStorage.removeItem('accessToken');
    window.location.href = '/signin';
  }
};

export default tokenManager;