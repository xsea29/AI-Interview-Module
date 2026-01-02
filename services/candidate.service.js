/**
 * Candidate Service
 * Handles all candidate-related API calls
 */

import { publicFetch } from '@/lib/public-api';
import { handleAuthError } from '@/lib/authUtils';
import resumeParserApi from '@/lib/resumeParserApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

const CANDIDATE_ENDPOINTS = {
  LIST: '/candidates',
  GET: (id) => `/candidates/${id}`,
  CREATE: '/candidates',
  UPDATE: (id) => `/candidates/${id}`,
  DELETE: (id) => `/candidates/${id}`,
  UPDATE_STATUS: (id) => `/candidates/${id}/status`,
  ADD_NOTE: (id) => `/candidates/${id}/notes`,
  UPLOAD_RESUME: (id) => `/candidates/${id}/resume/upload`,
  PARSE_RESUME: (id) => `/candidates/${id}/resume/parse`,
  GET_TIMELINE: (id) => `/candidates/${id}/timeline`,
  SEND_EMAIL: (id) => `/candidates/${id}/email`,
  UPDATE_RATING: (id) => `/candidates/${id}/rating`,
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

export const candidateService = {
  /**
   * Get all candidates
   * Endpoint: GET /api/candidates
   */
  async getCandidates(filters = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      jobId = '',
      source = '',
      minMatchScore = '',
      maxMatchScore = '',
    } = filters;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
      ...(jobId && { jobId }),
      ...(source && { source }),
      ...(minMatchScore && { minMatchScore }),
      ...(maxMatchScore && { maxMatchScore }),
    });

    const endpoint = `${CANDIDATE_ENDPOINTS.LIST}?${params.toString()}`;
    return makeRequest(endpoint);
  },

  /**
   * Get candidate by ID
   * Endpoint: GET /api/candidates/:id
   */
  async getCandidateById(candidateId) {
    if (!candidateId) {
      throw new Error('Candidate ID is required');
    }
    const endpoint = CANDIDATE_ENDPOINTS.GET(candidateId);
    return makeRequest(endpoint);
  },

  /**
   * Create new candidate
   * Endpoint: POST /api/candidates
   */
  async createCandidate(data) {
    const endpoint = CANDIDATE_ENDPOINTS.CREATE;
    return makeRequest(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  /**
   * Update candidate
   * Endpoint: PATCH /api/candidates/:id
   */
  async updateCandidate(candidateId, data) {
    if (!candidateId) {
      throw new Error('Candidate ID is required');
    }
    const endpoint = CANDIDATE_ENDPOINTS.UPDATE(candidateId);
    return makeRequest(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete candidate
   * Endpoint: DELETE /api/candidates/:id
   */
  async deleteCandidate(candidateId) {
    if (!candidateId) {
      throw new Error('Candidate ID is required');
    }
    const endpoint = CANDIDATE_ENDPOINTS.DELETE(candidateId);
    return makeRequest(endpoint, {
      method: 'DELETE',
    });
  },

  /**
   * Update candidate status
   * Endpoint: PATCH /api/candidates/:id/status
   */
  async updateCandidateStatus(candidateId, status, note = '') {
    if (!candidateId) {
      throw new Error('Candidate ID is required');
    }
    const endpoint = CANDIDATE_ENDPOINTS.UPDATE_STATUS(candidateId);
    return makeRequest(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    });
  },

  /**
   * Add note to candidate
   * Endpoint: POST /api/candidates/:id/notes
   */
  async addNote(candidateId, text) {
    if (!candidateId) {
      throw new Error('Candidate ID is required');
    }
    const endpoint = CANDIDATE_ENDPOINTS.ADD_NOTE(candidateId);
    return makeRequest(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  },

  /**
   * Upload and parse resume
   * Endpoint: POST /api/candidates/:id/resume/upload-and-parse
   */
  async uploadAndParseResume(candidateId, file, updatePersonalInfo = false) {
    if (!candidateId) {
      throw new Error('Candidate ID is required');
    }
    return resumeParserApi.uploadAndParseResume(candidateId, file, updatePersonalInfo);
  },

  /**
   * Parse existing resume
   * Endpoint: POST /api/candidates/:id/resume/parse
   */
  async parseExistingResume(candidateId, updatePersonalInfo = false) {
    if (!candidateId) {
      throw new Error('Candidate ID is required');
    }
    return resumeParserApi.parseExistingResume(candidateId, updatePersonalInfo);
  },

  /**
   * Get candidate timeline
   * Endpoint: GET /api/candidates/:id/timeline
   */
  async getCandidateTimeline(candidateId) {
    if (!candidateId) {
      throw new Error('Candidate ID is required');
    }
    const endpoint = CANDIDATE_ENDPOINTS.GET_TIMELINE(candidateId);
    return makeRequest(endpoint);
  },

  /**
   * Send email to candidate
   * Endpoint: POST /api/candidates/:id/email
   */
  async sendEmail(candidateId, emailData) {
    if (!candidateId) {
      throw new Error('Candidate ID is required');
    }
    const endpoint = CANDIDATE_ENDPOINTS.SEND_EMAIL(candidateId);
    return makeRequest(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });
  },

  /**
   * Update candidate rating
   * Endpoint: PATCH /api/candidates/:id/rating
   */
  async updateCandidateRating(candidateId, rating, notes = '') {
    if (!candidateId) {
      throw new Error('Candidate ID is required');
    }
    const endpoint = CANDIDATE_ENDPOINTS.UPDATE_RATING(candidateId);
    return makeRequest(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, notes }),
    });
  },

  /**
   * Check if resume parsing is enabled
   */
  async isResumeParsingEnabled() {
    return resumeParserApi.isParsingEnabled();
  },
};

export default candidateService;
