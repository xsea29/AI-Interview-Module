import { API_CONFIG, ERROR_MESSAGES } from './apiConfig';

/**
 * Handle authentication errors (token expiration)
 * Automatically logs out user if token is expired/invalid
 */
function handleAuthError(statusCode) {
  if (statusCode === 401 || statusCode === 403) {
    // Clear all auth data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');
      
      // Redirect to login
      window.location.href = '/recruiter/login';
    }
    return true;
  }
  return false;
}

/**
 * Public API calls with centralized configuration
 * Automatically handles token expiration and authorization
 */
export async function publicFetch(endpoint, options = {}) {
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  // Add authorization token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token && !finalOptions.headers.Authorization) {
    finalOptions.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const apiUrl = `${API_CONFIG.baseUrl}${endpoint}`;
    console.log(`[API] ${finalOptions.method} ${endpoint}`);
    
    const response = await fetch(apiUrl, finalOptions);

    // Handle token expiration/unauthorized access
    if (response.status === 401 || response.status === 403) {
      const authError = handleAuthError(response.status);
      if (authError) {
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      }
    }

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch {
        error = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      const errorMessage = error.message || error.error || 'API request failed';
      console.error(`[API Error] ${response.status}: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`[API Success] ${finalOptions.method} ${endpoint}`, data);
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('[Network Error]', error.message);
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
    throw error;
  }
}

// Email masking utility
export function maskEmail(email) {
  if (!email || !email.includes('@')) return '****@****.***';
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) return `${localPart[0]}*@${domain}`;
  const masked = localPart.slice(0, 1) + '*'.repeat(localPart.length - 2) + localPart.slice(-1);
  return `${masked}@${domain}`;
}

// Session token management
export const sessionTokenUtils = {
  get: () => typeof window !== 'undefined' ? sessionStorage.getItem('interviewSessionToken') : null,
  set: (token) => typeof window !== 'undefined' ? sessionStorage.setItem('interviewSessionToken', token) : null,
  clear: () => typeof window !== 'undefined' ? sessionStorage.removeItem('interviewSessionToken') : null,
  isValid: () => typeof window !== 'undefined' ? !!sessionStorage.getItem('interviewSessionToken') : false
};

// Authentication error handler - exported for use in other services
export { handleAuthError };