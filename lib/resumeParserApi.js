/**
 * Resume Parser API Service
 * Frontend service to connect with backend resume parsing API
 */

import { publicFetch } from './public-api';
import { handleAuthError } from './authUtils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

/**
 * Resume Parser API endpoints
 */
const RESUME_PARSER_ENDPOINTS = {
  UPLOAD_AND_PARSE: (candidateId) => `/candidates/${candidateId}/resume/upload-and-parse`,
  PARSE_EXISTING: (candidateId) => `/candidates/${candidateId}/resume/parse`,
  GET_CONFIG: '/resume-parser/config',
  TOGGLE_PARSING: '/resume-parser/toggle',
};

/**
 * Wrapper for API calls with error handling
 */
const makeRequest = async (endpoint, options = {}) => {
  try {
    const response = await publicFetch(endpoint, options);
    if (!response.success) {
      throw new Error(response.error?.message || 'API request failed');
    }
    return response.data;
  } catch (error) {
    if (error.message === 'Session expired. Please login again.') {
      handleAuthError(401);
    }
    throw error;
  }
};

export const resumeParserApi = {
  /**
   * Upload and parse resume
   * Endpoint: POST /api/candidates/:candidateId/resume/upload-and-parse
   * @param {string} candidateId - Candidate ID
   * @param {File} file - Resume file
   * @param {boolean} updatePersonalInfo - Whether to update candidate's personal info from resume
   */
  async uploadAndParseResume(candidateId, file, updatePersonalInfo = false) {
    if (!candidateId) {
      throw new Error('Candidate ID is required');
    }
    if (!file) {
      throw new Error('Resume file is required');
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('updatePersonalInfo', updatePersonalInfo.toString());

    const endpoint = RESUME_PARSER_ENDPOINTS.UPLOAD_AND_PARSE(candidateId);
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });

      if (response.status === 401 || response.status === 403) {
        handleAuthError(response.status);
        throw new Error('Session expired. Please login again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload and parse resume');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Parse existing resume
   * Endpoint: POST /api/candidates/:candidateId/resume/parse
   * @param {string} candidateId - Candidate ID
   * @param {boolean} updatePersonalInfo - Whether to update candidate's personal info from resume
   */
  async parseExistingResume(candidateId, updatePersonalInfo = false) {
    if (!candidateId) {
      throw new Error('Candidate ID is required');
    }

    const endpoint = RESUME_PARSER_ENDPOINTS.PARSE_EXISTING(candidateId);
    return makeRequest(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updatePersonalInfo }),
    });
  },

  /**
   * Get resume parser configuration
   * Endpoint: GET /api/resume-parser/config
   */
  async getParserConfig() {
    const endpoint = RESUME_PARSER_ENDPOINTS.GET_CONFIG;
    return makeRequest(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Toggle resume parsing on/off (admin only)
   * Endpoint: PATCH /api/resume-parser/toggle
   * @param {boolean} enabled - Enable or disable parsing
   */
  async toggleParsing(enabled) {
    const endpoint = RESUME_PARSER_ENDPOINTS.TOGGLE_PARSING;
    return makeRequest(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
  },

  /**
   * Check if resume parsing is enabled
   * @returns {Promise<boolean>}
   */
  async isParsingEnabled() {
    try {
      const config = await this.getParserConfig();
      return config?.enabled === true;
    } catch (error) {
      console.warn('Failed to check resume parsing config:', error.message);
      return false;
    }
  },
};

export default resumeParserApi;
