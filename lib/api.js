// src/lib/api.js
export const API_BASE_URL = "http://localhost:5000/api/v1";

export const INTERVIEW_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/interviews`,
  GET_ALL: `${API_BASE_URL}/interviews`,
  GET_ONE: (id) => `${API_BASE_URL}/interviews/${id}`,
  GENERATE_QUESTIONS: (id) => `${API_BASE_URL}/interviews/${id}/generate-questions`,
  GET_QUESTIONS: (id) => `${API_BASE_URL}/interviews/${id}/questions`,
  UPDATE_QUESTIONS: (id) => `${API_BASE_URL}/interviews/${id}/questions`,
  APPROVE_QUESTION: (id, questionId) => `${API_BASE_URL}/interviews/${id}/questions/${questionId}/approve`,
  MARK_READY: (id) => `${API_BASE_URL}/interviews/${id}/mark-ready`,
  SCHEDULE: (id) => `${API_BASE_URL}/interviews/${id}/schedule`,
  SEND_INVITE: (id) => `${API_BASE_URL}/interviews/${id}/send-invite`,
  CANCEL: (id) => `${API_BASE_URL}/interviews/${id}/cancel`,
  STATS: `${API_BASE_URL}/interviews/stats`,
  CONFIG_OPTIONS: `${API_BASE_URL}/interviews/config-options`,
  CUSTOM_QUESTION: (id) => `${API_BASE_URL}/interviews/${id}/questions/custom`,
};