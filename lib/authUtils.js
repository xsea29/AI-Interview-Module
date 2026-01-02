/**
 * Authentication Utility Functions
 * Handles token expiration, logout, and session management
 */

/**
 * Logout user immediately - clears all auth data and redirects to login
 * Called when token is expired or invalid
 */
export const performLogout = () => {
  if (typeof window === 'undefined') return;

  // Clear all authentication data
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('interviewSessionToken');

  // Redirect to login page
  window.location.href = '/recruiter/login';
};

/**
 * Check if token is expired
 * Returns true if token is not found or is expired
 */
export const isTokenExpired = () => {
  if (typeof window === 'undefined') return true;

  const token = localStorage.getItem('accessToken');
  if (!token) return true;

  try {
    // Decode JWT to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Treat as expired if can't decode
  }
};

/**
 * Get authorization header with current token
 * Returns object with Authorization header or empty object if no token
 */
export const getAuthHeader = () => {
  if (typeof window === 'undefined') return {};

  const token = localStorage.getItem('accessToken');
  if (!token) return {};

  return {
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Handle API errors that might be related to authentication
 * Returns true if it was an auth error and handled, false otherwise
 */
export const handleAuthError = (statusCode, errorMessage = '') => {
  // 401 Unauthorized - Token expired or invalid
  // 403 Forbidden - User doesn't have permission (also treated as auth error)
  if (statusCode === 401 || statusCode === 403) {
    console.warn('Authentication error detected:', statusCode, errorMessage);
    performLogout();
    return true;
  }
  return false;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;

  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');

  return !!(token && user && !isTokenExpired());
};

/**
 * Get current user from storage
 */
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;

  const user = localStorage.getItem('user');
  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Refresh token if possible
 * This should be called before making API requests if token is close to expiring
 */
export const refreshAccessToken = async () => {
  if (typeof window === 'undefined') return false;

  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      performLogout();
      return false;
    }

    const response = await fetch('http://localhost:5000/api/v1/auth/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      performLogout();
      return false;
    }

    const data = await response.json();
    
    if (data.success && data.data?.tokens?.accessToken) {
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      if (data.data.tokens.refreshToken) {
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      }
      return true;
    }

    performLogout();
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    performLogout();
    return false;
  }
};
