// Protect admin page - require ROLE_ADMIN
(async () => {
    try {
        await restoreSessionFromToken();
    } catch (e) {
        // ignore
    }
    protectPage('ROLE_ADMIN');
    displayUserInfo('adminUserBadge');
})();

// Switch between tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.tab-btn').classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + 'Tab').classList.add('active');

    // Load data for the active tab
    if (tabName === 'students') {
        loadStudents();
    } else if (tabName === 'videos') {
        loadVideos();
    }
}

// Load all students
async function loadStudents() {
    try {
        const response = await apiRequest('/admin/students');
        if (!response) return;

        const data = await response.json();
        
        if (data.success && data.students) {
            displayStudents(data.students);
        } else {
            showError('Failed to load students');
        }
    } catch (error) {
        console.error('Error loading students:', error);
        showError('An error occurred while loading students');
    }
}

// Display students in table
function displayStudents(students) {
    const tbody = document.querySelector('#studentsTable tbody');
    
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="table-placeholder">No students registered yet</td></tr>';
        return;
    }

    tbody.innerHTML = students.map(student => `
        <tr>
            <td>
                <div class="student-info">
                    <div class="student-avatar">${student.fullName.charAt(0)}</div>
                    <div>
                        <div class="student-name">${escapeHtml(student.fullName)}</div>
                    </div>
                </div>
            </td>
            <td>${escapeHtml(student.rollNumber)}</td>
            <td><span class="badge badge-${student.department}">${escapeHtml(student.department)}</span></td>
            <td>${escapeHtml(student.email || 'N/A')}</td>
            <td>
                <span class="stat-badge">
                    <i class="fas fa-video"></i> ${student.videoCount}
                </span>
            </td>
            <td>${formatDate(student.registrationDate)}</td>
            <td>
                <button class="btn-icon btn-danger" onclick="deleteStudent(${student.id}, '${escapeHtml(student.fullName)}')" title="Delete student">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Delete student
async function deleteStudent(studentId, studentName) {
    if (!confirm(`Are you sure you want to delete "${studentName}"? This will also delete all their videos, likes, and comments.`)) {
        return;
    }

    try {
        const response = await apiRequest(`/admin/students/${studentId}`, {
            method: 'DELETE'
        });

        if (!response) return;

        const data = await response.json();
        
        if (data.success) {
            alert('Student deleted successfully');
            loadStudents();
        } else {
            alert(data.message || 'Failed to delete student');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        alert('An error occurred while deleting the student');
    }
}

// Load all videos
async function loadVideos() {
    try {
        const response = await apiRequest('/admin/videos');
        if (!response) return;

        const data = await response.json();
        
        if (data.success && data.videos) {
            displayVideos(data.videos);
        } else {
            showError('Failed to load videos');
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        showError('An error occurred while loading videos');
    }
}

// Display videos in grid
function displayVideos(videos) {
    const grid = document.getElementById('videosGrid');
    
    if (videos.length === 0) {
        grid.innerHTML = '<p class="loading-text">No videos uploaded yet</p>';
        return;
    }

    grid.innerHTML = videos.map(video => `
        <div class="video-card">
            <div class="video-thumbnail">
                <i class="fas fa-play-circle"></i>
            </div>
            <div class="video-info">
                <h4 class="video-title">${escapeHtml(video.title)}</h4>
                <p class="video-meta">
                    <span><i class="fas fa-user"></i> ${escapeHtml(video.uploadedByName || 'Unknown')}</span>
                    <span><i class="fas fa-building"></i> ${escapeHtml(video.department)}</span>
                </p>
                <p class="video-meta">
                    <span><i class="fas fa-eye"></i> ${video.viewCount} views</span>
                    <span><i class="fas fa-calendar"></i> ${formatDate(video.uploadDate)}</span>
                </p>
                <div class="video-actions">
                    <button class="btn btn-danger btn-sm" onclick="deleteVideo(${video.id}, '${escapeHtml(video.title)}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Delete video
async function deleteVideo(videoId, videoTitle) {
    if (!confirm(`Are you sure you want to delete "${videoTitle}"?`)) {
        return;
    }

    try {
        const response = await apiRequest(`/admin/videos/${videoId}`, {
            method: 'DELETE'
        });

        if (!response) return;

        const data = await response.json();
        
        if (data.success) {
            alert('Video deleted successfully');
            loadVideos();
        } else {
            alert(data.message || 'Failed to delete video');
        }
    } catch (error) {
        console.error('Error deleting video:', error);
        alert('An error occurred while deleting the video');
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function showError(message) {
    alert(message);
}

// Load initial data
loadStudents();
