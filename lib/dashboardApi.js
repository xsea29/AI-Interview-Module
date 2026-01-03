import { DASHBOARD_ENDPOINTS } from "./api";

/**
 * Fetch recruiter dashboard data from backend
 * @returns {Promise<{stats, upcomingInterviews, recentReports}>}
 */
export const getRecruiterDashboard = async () => {
  try {
    // Get JWT token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(DASHBOARD_ENDPOINTS.GET_RECRUITER_DASHBOARD, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      throw new Error(`Dashboard fetch failed: ${response.status} ${response.statusText}`);
    }

    const response_data = await response.json();
    console.log('Dashboard API Response:', response_data); // Debug logging
    
    // Handle nested data structure from backend
    const data = response_data.data || response_data;
    
    // Validate response structure
    if (!data || !data.stats) {
      console.warn('Dashboard response missing stats:', data);
      throw new Error('Invalid dashboard response structure: missing stats object');
    }
    
    console.log('Dashboard data extracted:', data);
    return data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};

/**
 * Format a date string to readable format (e.g., "Jan 15")
 * @param {string} dateString - ISO date string
 * @returns {string}
 */
export const formatReportDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

/**
 * Format an interview scheduled time to readable format
 * @param {string} scheduledAtString - ISO date string
 * @returns {string}
 */
export const formatInterviewTime = (scheduledAtString) => {
  try {
    const date = new Date(scheduledAtString);
    const now = new Date();
    const diffInHours = (date - now) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    } else if (diffInHours < 48) {
      return `Tomorrow, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    }
  } catch {
    return scheduledAtString;
  }
};
