// Public API calls - NO JWT needed for candidates
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

  try {
    const response = await fetch(`http://localhost:5000/api/v1${endpoint}`, finalOptions);

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch {
        error = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      const errorMessage = error.message || error.error || 'API request failed';
      console.error(`API Error [${response.status}]:`, errorMessage);
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('Network Error:', error.message);
      throw new Error('Network error: Unable to reach the server. Please check your connection.');
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