/**
 * Centralized API Configuration
 * All API endpoints and configurations in one place
 */

// Base Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1',
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'AI Interview Platform',
};

// Auth Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh-token',
  VERIFY_TOKEN: '/auth/verify',
  ME: '/auth/me',
  PROFILE: '/auth/profile',
  CHANGE_PASSWORD: '/auth/change-password',
};

// Reports Endpoints
export const REPORTS_ENDPOINTS = {
  // List and Get
  LIST: '/reports',
  GET_BY_ID: (id) => `/reports/${id}`,
  
  // Create and Update
  CREATE: '/reports',
  CREATE_FROM_INTERVIEW: (interviewId) => `/reports/from-interview/${interviewId}`,
  UPDATE_STATUS: (id) => `/reports/${id}/status`,
  UPDATE_RECOMMENDATION: (id) => `/reports/${id}/recommendation`,
  REGENERATE_AI: (id) => `/reports/${id}/regenerate-ai`,
  
  // Comments, Reviews, Notes
  ADD_COMMENT: (id) => `/reports/${id}/comments`,
  GET_COMMENTS: (id) => `/reports/${id}/comments`,
  ADD_REVIEW: (id) => `/reports/${id}/reviews`,
  GET_REVIEWS: (id) => `/reports/${id}/reviews`,
  ADD_NOTE: (id) => `/reports/${id}/notes`,
  GET_NOTES: (id) => `/reports/${id}/notes`,
  
  // Analytics and Export
  ANALYTICS: '/reports/analytics',
  EXPORT_PDF: (id) => `/reports/${id}/export/pdf`,
  EXPORT_CSV: (id) => `/reports/${id}/export/csv`,
  
  // Sharing and Management
  SHARE: (id) => `/reports/${id}/share`,
  DELETE: (id) => `/reports/${id}`,
  
  // Bulk Operations
  BULK_UPDATE: '/reports/bulk-update',
  BULK_DELETE: '/reports/bulk-delete',
};

// Interview Endpoints
export const INTERVIEW_ENDPOINTS = {
  LIST: '/interviews',
  GET: (id) => `/interviews/${id}`,
  CREATE: '/interviews',
  UPDATE: (id) => `/interviews/${id}`,
  DELETE: (id) => `/interviews/${id}`,
  GET_QUESTIONS: (id) => `/interviews/${id}/questions`,
  UPDATE_QUESTIONS: (id) => `/interviews/${id}/questions`,
  GENERATE_QUESTIONS: (id) => `/interviews/${id}/generate-questions`,
  MARK_READY: (id) => `/interviews/${id}/mark-ready`,
  SCHEDULE: (id) => `/interviews/${id}/schedule`,
  SEND_INVITE: (id) => `/interviews/${id}/send-invite`,
  CANCEL: (id) => `/interviews/${id}/cancel`,
  STATS: '/interviews/stats',
};

// Public Interview Endpoints (for candidates taking interviews)
export const PUBLIC_INTERVIEW_ENDPOINTS = {
  VALIDATE: (token) => `/interviews/public/validate/${token}`,
  GET_QUESTIONS: (token) => `/interviews/public/questions/${token}`,
  SUBMIT_ANSWERS: (token) => `/interviews/public/submit/${token}`,
  COMPLETE: (token) => `/interviews/public/complete/${token}`,
};

// Candidate Endpoints
export const CANDIDATE_ENDPOINTS = {
  LIST: '/candidates',
  GET: (id) => `/candidates/${id}`,
  CREATE: '/candidates',
  UPDATE: (id) => `/candidates/${id}`,
  DELETE: (id) => `/candidates/${id}`,
  SEND_EMAIL: (id) => `/candidates/${id}/email`,
  UPLOAD_RESUME: (id) => `/candidates/${id}/resume`,
};

// Job Endpoints
export const JOB_ENDPOINTS = {
  LIST: '/jobs',
  GET: (id) => `/jobs/${id}`,
  CREATE: '/jobs',
  UPDATE: (id) => `/jobs/${id}`,
  DELETE: (id) => `/jobs/${id}`,
  PUBLISH: (id) => `/jobs/${id}/publish`,
  CLOSE: (id) => `/jobs/${id}/close`,
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

// Response Status Codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error: Unable to reach the server. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  INVALID_REQUEST: 'Invalid request. Please check your input.',
  DUPLICATE: 'This resource already exists.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

// Request Headers
export const getDefaultHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Timeout Configuration
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// Retry Configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

// Rate Limiting
export const RATE_LIMIT_CONFIG = {
  windowMs: 60000, // 1 minute
  maxRequests: 100,
};

/**
 * Build full API URL from endpoint
 * @param {string} endpoint - The API endpoint
 * @returns {string} Full API URL
 */
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.baseUrl}${endpoint}`;
};

/**
 * Get Report-specific endpoint
 * @param {string} key - Endpoint key from REPORTS_ENDPOINTS
 * @param {*} params - Parameters for dynamic endpoints
 * @returns {string} Full endpoint URL
 */
export const getReportEndpoint = (key, ...params) => {
  const endpoint = REPORTS_ENDPOINTS[key];
  if (typeof endpoint === 'function') {
    return buildApiUrl(endpoint(...params));
  }
  return buildApiUrl(endpoint);
};

/**
 * Check if API is in development mode
 * @returns {boolean}
 */
export const isDevelopment = () => API_CONFIG.environment === 'development';

/**
 * Get API timeout based on environment
 * @returns {number} Timeout in milliseconds
 */
export const getTimeout = () => {
  return isDevelopment() ? 60000 : REQUEST_TIMEOUT;
};
