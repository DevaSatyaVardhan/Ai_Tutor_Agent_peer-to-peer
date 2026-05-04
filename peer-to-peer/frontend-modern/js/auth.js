// Authentication utility functions
const API_BASE = 'http://localhost:8080/api';

// Get the JWT token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Get the current user from localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Check if user is authenticated
function isAuthenticated() {
    return !!getToken();
}

// Check if user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'ROLE_ADMIN';
}

// Check if user is student
function isStudent() {
    const user = getCurrentUser();
    return user && user.role === 'ROLE_STUDENT';
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'landing.html';
}

// Make an authenticated API request
async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, mergedOptions);
        
        // If unauthorized, redirect to login
        if (response.status === 401 || response.status === 403) {
            logout();
            return null;
        }

        return response;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

// Restore user profile from token if localStorage user is missing.
// NOTE: For security, we never store passwords. Only token + non-sensitive profile fields.
async function restoreSessionFromToken() {
    const token = getToken();
    if (!token) return null;

    const existing = getCurrentUser();
    if (existing) return existing;

    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        });

        const data = await response.json().catch(() => ({}));
        const principal = data && data.user ? data.user : null;

        if (!principal) {
            // Token exists but no principal -> treat as logged out
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return null;
        }

        // Normalize to the same shape as backend AuthResponse used across the UI
        const normalized = {
            role: principal.role,
            studentId: principal.studentId ?? null,
            rollNumber: principal.rollNumber ?? null,
            fullName: principal.name ?? null,
            department: principal.department ?? null,
            email: principal.email ?? null,
        };

        localStorage.setItem('user', JSON.stringify(normalized));
        return normalized;
    } catch (error) {
        console.error('restoreSessionFromToken error:', error);
        return null;
    }
}

// Protect a page (redirect if not authenticated)
function protectPage(requiredRole = null) {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }

    if (requiredRole) {
        const user = getCurrentUser();
        if (user.role !== requiredRole) {
            window.location.href = 'landing.html';
            return false;
        }
    }

    return true;
}

// Display user info in UI
function displayUserInfo(elementId) {
    const user = getCurrentUser();
    if (user && elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = user.fullName || user.email;
            element.style.display = 'inline-block';
        }
    }
}
