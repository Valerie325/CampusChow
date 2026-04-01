/**
 * Authentication utility functions for CampusChow
 * Provides user authentication checks and session management
 */

/**
 * Check if user is currently authenticated
 * @returns {boolean} True if user has a valid token
 */
function isAuthenticated() {
  const token = localStorage.getItem("campusChowToken");
  return !!token;
}

/**
 * Get current logged-in user
 * @returns {Object|null} User object or null if not authenticated
 */
function getLoggedInUser() {
  try {
    const userStr = localStorage.getItem("campusChowUser");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
}

/**
 * Get authentication token
 * @returns {string|null} JWT token or null if not authenticated
 */
function getAuthToken() {
  return localStorage.getItem("campusChowToken");
}

/**
 * Log out current user
 */
function logout() {
  localStorage.removeItem("campusChowToken");
  localStorage.removeItem("campusChowUser");
  window.location.href = "signin.html";
}

/**
 * Require authentication - redirect to signin if not logged in
 * @returns {boolean} True if authenticated, false otherwise
 */
function requireAuth() {
  if (!isAuthenticated()) {
    alert("Please sign in first to access this page.");
    window.location.href = "signin.html";
    return false;
  }
  return true;
}
