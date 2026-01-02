/**
 * Report API Service
 * Handles all API calls to the backend Report endpoints
 * Uses centralized API configuration with automatic token expiration handling
 */

import { publicFetch } from './public-api';
import { handleAuthError } from './authUtils';
import { REPORTS_ENDPOINTS, getReportEndpoint, API_CONFIG } from './apiConfig';

/**
 * Wrapper for API calls that handles authentication errors
 */
const makeRequest = async (endpoint, options = {}) => {
  try {
    const response = await publicFetch(endpoint, options);
    if (!response.success) {
      throw new Error(response.error?.message || 'API request failed');
    }
    return response.data;
  } catch (error) {
    // Check if it's an auth error message
    if (error.message === 'Session expired. Please login again.') {
      handleAuthError(401);
    }
    throw error;
  }
};

export const reportService = {
  /**
   * Get all reports with filtering and pagination
   * Endpoint: GET /api/reports?search=...&recommendation=...&lifecycleStatus=...&skip=...&limit=...
   */
  async getReports(filters = {}) {
    const {
      search = '',
      recommendation = 'all',
      lifecycleStatus = 'all',
      role = '',
      skip = 0,
      limit = 20,
      sortBy = 'completedAt',
      sortOrder = 'desc',
    } = filters;

    const params = new URLSearchParams({
      ...(search && { search }),
      ...(recommendation !== 'all' && { recommendation }),
      ...(lifecycleStatus !== 'all' && { lifecycleStatus }),
      ...(role && { role }),
      skip: skip.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });

    const endpoint = `${REPORTS_ENDPOINTS.LIST}?${params.toString()}`;
    return makeRequest(endpoint);
  },

  /**
   * Get single report by ID
   * Endpoint: GET /api/reports/:id
   */
  async getReportById(reportId) {
    if (!reportId) {
      throw new Error('Report ID is required');
    }
    const endpoint = REPORTS_ENDPOINTS.GET_BY_ID(reportId);
    return makeRequest(endpoint);
  },

  /**
   * Create report from interview
   * Endpoint: POST /api/reports/from-interview/:interviewId
   */
  async createReportFromInterview(interviewId) {
    const endpoint = REPORTS_ENDPOINTS.CREATE_FROM_INTERVIEW(interviewId);
    return makeRequest(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interviewId }),
    });
  },

  /**
   * Update lifecycle status
   * Endpoint: PATCH /api/reports/:id/status
   * Status values: draft, in_review, reviewed, actioned, archived
   */
  async updateLifecycleStatus(reportId, newStatus) {
    if (!reportId) {
      throw new Error('Report ID is required');
    }
    const endpoint = REPORTS_ENDPOINTS.UPDATE_STATUS(reportId);
    return makeRequest(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lifecycleStatus: newStatus }),
    });
  },

  /**
   * Update recommendation
   * Endpoint: PATCH /api/reports/:id/recommendation
   * Recommendations: strong_hire, hire, borderline, no_hire, to_be_discussed
   */
  async updateRecommendation(reportId, recommendation) {
    if (!reportId) {
      throw new Error('Report ID is required');
    }
    const endpoint = REPORTS_ENDPOINTS.UPDATE_RECOMMENDATION(reportId);
    return makeRequest(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recommendation }),
    });
  },

  /**
   * Add comment to report
   * Endpoint: POST /api/reports/:id/comments
   */
  async addComment(reportId, content, authorRole) {
    if (!reportId) {
      throw new Error('Report ID is required');
    }
    const endpoint = REPORTS_ENDPOINTS.ADD_COMMENT(reportId);
    return makeRequest(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, authorRole }),
    });
  },

  /**
   * Add review/decision to report
   * Endpoint: POST /api/reports/:id/reviews
   * Decision values: shortlist, schedule_human_interview, next_round, on_hold, re_interview, rejected, hired
   */
  async addReview(reportId, decision, notes, reviewerRole) {
    if (!reportId) {
      throw new Error('Report ID is required');
    }
    const endpoint = REPORTS_ENDPOINTS.ADD_REVIEW(reportId);
    return makeRequest(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, notes, reviewerRole }),
    });
  },

  /**
   * Add private note to report
   * Endpoint: POST /api/reports/:id/notes
   */
  async addPrivateNote(reportId, content) {
    if (!reportId) {
      throw new Error('Report ID is required');
    }
    const endpoint = REPORTS_ENDPOINTS.ADD_NOTE(reportId);
    return makeRequest(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
  },

  /**
   * Get analytics data
   * Endpoint: GET /api/reports/analytics?startDate=...&endDate=...&role=...&recruiterId=...
   */
  async getAnalytics(filters = {}) {
    const { startDate = '', endDate = '', role = '', recruiterId = '' } = filters;

    const params = new URLSearchParams({
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(role && { role }),
      ...(recruiterId && { recruiterId }),
    });

    const endpoint = `${REPORTS_ENDPOINTS.ANALYTICS}?${params.toString()}`;
    return makeRequest(endpoint);
  },

  /**
   * Regenerate report with AI evaluation
   * Endpoint: POST /api/reports/:id/regenerate-ai
   */
  async regenerateWithAI(reportId) {
    if (!reportId) {
      throw new Error('Report ID is required');
    }
    const endpoint = REPORTS_ENDPOINTS.REGENERATE_AI(reportId);
    return makeRequest(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  },

  /**
   * Delete report (soft delete)
   * Endpoint: DELETE /api/reports/:id
   */
  async deleteReport(reportId) {
    if (!reportId) {
      throw new Error('Report ID is required');
    }
    const endpoint = REPORTS_ENDPOINTS.DELETE(reportId);
    return makeRequest(endpoint, {
      method: 'DELETE',
    });
  },

  /**
   * Export report as PDF
   * Endpoint: GET /api/reports/:id/export/pdf
   * Returns: Binary PDF file (blob)
   */
  async exportReportPDF(reportId) {
    if (!reportId) {
      throw new Error('Report ID is required');
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    try {
      const endpoint = REPORTS_ENDPOINTS.EXPORT_PDF(reportId);
      const apiUrl = `${API_CONFIG.baseUrl}${endpoint}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      // Handle auth errors
      if (response.status === 401 || response.status === 403) {
        handleAuthError(response.status);
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error('Failed to export PDF');
      }

      return response.blob();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Share report with limited-time link
   * Endpoint: POST /api/reports/:id/share
   */
  async generateShareLink(reportId, expiryHours = 24) {
    if (!reportId) {
      throw new Error('Report ID is required');
    }
    const endpoint = REPORTS_ENDPOINTS.SHARE(reportId);
    return makeRequest(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expiryHours }),
    });
  },

  /**
   * Export report as CSV
   * Endpoint: GET /api/reports/:id/export/csv
   */
  async exportReportCSV(reportId) {
    if (!reportId) {
      throw new Error('Report ID is required');
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    try {
      const endpoint = REPORTS_ENDPOINTS.EXPORT_CSV(reportId);
      const apiUrl = `${API_CONFIG.baseUrl}${endpoint}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.status === 401 || response.status === 403) {
        handleAuthError(response.status);
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error('Failed to export CSV');
      }

      return response.blob();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Bulk update reports
   * Endpoint: PATCH /api/reports/bulk-update
   */
  async bulkUpdate(reportIds, updates) {
    const endpoint = REPORTS_ENDPOINTS.BULK_UPDATE;
    return makeRequest(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportIds, updates }),
    });
  },

  /**
   * Bulk delete reports
   * Endpoint: DELETE /api/reports/bulk-delete
   */
  async bulkDelete(reportIds) {
    const endpoint = REPORTS_ENDPOINTS.BULK_DELETE;
    return makeRequest(endpoint, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportIds }),
    });
  },
};

export default reportService;
