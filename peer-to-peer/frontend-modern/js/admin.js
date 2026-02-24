const API_BASE_URL = 'http://localhost:8080/api';

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Admin page loading...');
    await checkAdminSession();
});

async function checkAdminSession() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();
        console.log('Auth check result:', result);

        if (result.success && result.user && result.user.role === 'ROLE_ADMIN') {
            // User is already authenticated as admin
            console.log('Admin already authenticated');
            document.getElementById('adminLoginSection').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';
            document.getElementById('adminLogoutBtn').style.display = 'inline-flex';
            loadAdminStudents();
        } else {
            // No valid admin session, show login form
            console.log('No admin session found, showing login form');
            document.getElementById('adminLoginSection').style.display = 'block';
            document.getElementById('adminDashboard').style.display = 'none';
            document.getElementById('adminLogoutBtn').style.display = 'none';
        }
    } catch (error) {
        console.error('Session check error:', error);
        document.getElementById('adminLoginSection').style.display = 'block';
        document.getElementById('adminDashboard').style.display = 'none';
        document.getElementById('adminLogoutBtn').style.display = 'none';
    }
}
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    const status = document.getElementById('adminLoginStatus');

    if (!email || !password) {
        if (status) status.textContent = 'Email and password are required.';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Admin login failed');
        }

        document.getElementById('adminLoginSection').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        document.getElementById('adminLogoutBtn').style.display = 'inline-flex';
        if (status) status.textContent = '';

        loadAdminStudents();
    } catch (error) {
        if (status) status.textContent = error.message;
    }
}

async function loadAdminStudents() {
    const tableBody = document.querySelector('#adminStudentsTable tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="8" class="table-placeholder">Loading data...</td></tr>';

    try {
        const response = await fetch(`${API_BASE_URL}/admin/students`, {
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to load students');
        }

        const students = result.students || [];
        if (!students.length) {
            tableBody.innerHTML = '<tr><td colspan="8" class="table-placeholder">No students found.</td></tr>';
            return;
        }

        tableBody.innerHTML = students.map(student => {
            return `<tr>
                <td>
                    <div class="table-student">
                        <div class="student-avatar">${(student.fullName || 'S')[0]}</div>
                        <div>
                            <div class="student-name">${student.fullName || '-'}</div>
                            <div class="student-email">${student.email || '-'}</div>
                        </div>
                    </div>
                </td>
                <td>${student.department || '-'}</td>
                <td>${student.rollNumber || '-'}</td>
                <td>${student.videoCount}</td>
                <td>${student.likeCount}</td>
                <td>${student.commentCount}</td>
                <td>${student.activityCount}</td>
                <td>${formatDate(student.registrationDate)}</td>
            </tr>`;
        }).join('');
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="8" class="table-placeholder">${error.message}</td></tr>`;
    }
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

async function adminLogout() {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
        console.log('Logged out successfully');
        // Clear the current session and redirect to home
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = 'index.html';
    }
}
