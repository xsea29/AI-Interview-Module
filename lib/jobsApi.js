// src/lib/jobsApi.js
const API_BASE_URL = "http://localhost:5000/api/v1";

export const JOBS_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/jobs`,
  GET_ALL: `${API_BASE_URL}/jobs`,
  GET_ONE: (id) => `${API_BASE_URL}/jobs/${id}`,
  UPDATE: (id) => `${API_BASE_URL}/jobs/${id}`,
  UPDATE_STATUS: (id) => `${API_BASE_URL}/jobs/${id}/status`,
  DELETE: (id) => `${API_BASE_URL}/jobs/${id}`,
  STATS: (id) => `${API_BASE_URL}/jobs/${id}/stats`,
  DUPLICATE: (id) => `${API_BASE_URL}/jobs/${id}/duplicate`,
};