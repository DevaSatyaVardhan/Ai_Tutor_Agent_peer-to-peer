// Peer Learning Platform - Modern JavaScript File

// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';
const AI_BASE_URL = 'http://127.0.0.1:8000';

// Global Variables
let currentVideoId = null;
let currentUser = null;
let currentRole = null;
let loginRole = 'student';

function apiFetch(url, options = {}) {
    return fetch(url, { credentials: 'include', ...options });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    console.log('Peer Learning Platform Modern UI initialized');

    // Load all videos on page load
    loadAllVideos();

    // Load platform statistics
    loadPlatformStatistics();

    // Check existing session
    loadCurrentUser();

    // Show login modal on first load
    showLoginModal();

    // Add event listeners
    setupEventListeners();

    // Initialize upload tabs
    switchUploadTab('link');

    // AI Chatbot
    function setupChatbot() {
        const button = document.getElementById('ai-chatbot-button');
        const windowEl = document.getElementById('ai-chatbot-window');
        const closeBtn = document.getElementById('ai-chatbot-close');
        const sendBtn = document.getElementById('ai-send-btn');
        const input = document.getElementById('ai-user-input');
        const fileInput = document.getElementById('ai-file-input');

        if (!button || !windowEl) return;

        const openChat = () => windowEl.classList.add('active');
        const closeChat = () => windowEl.classList.remove('active');

        button.addEventListener('click', openChat);
        if (closeBtn) closeBtn.addEventListener('click', closeChat);
        if (sendBtn) sendBtn.addEventListener('click', sendChatMessage);
        if (input) {
            input.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    sendChatMessage();
                }
            });
        }
        if (fileInput) {
            fileInput.addEventListener('change', handleAiFileUpload);
        }
    }

    function getAiMeta() {
        const userId = currentUser && currentUser.rollNumber ? currentUser.rollNumber : 'guest';
        const subject = 'general';

        return { userId, subject };
    }

    function addChatMessage(role, text) {
        const messages = document.getElementById('ai-chatbot-messages');
        if (!messages) return null;

        const message = document.createElement('div');
        message.className = `ai-message ${role}`.trim();
        message.textContent = text;
        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;

        return message;
    }

    async function sendChatMessage() {
        const input = document.getElementById('ai-user-input');
        if (!input) return;

        const question = input.value.trim();
        if (!question) return;

        const { userId } = getAiMeta();
        addChatMessage('user', question);
        input.value = '';

        const thinking = addChatMessage('bot', 'Thinking...');

        try {
            const response = await fetch(`${AI_BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: userId, question })
            });

            if (!response.ok) {
                throw new Error(`AI error: ${response.status}`);
            }

            const result = await response.json();
            if (thinking) thinking.textContent = result.answer || 'No response from AI service.';
        } catch (error) {
            console.error('AI chat error:', error);
            if (thinking) thinking.textContent = 'AI service error. Please check the server.';
        }
    }

    async function handleAiFileUpload(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        const { userId, subject } = getAiMeta();
        const name = file.name.toLowerCase();
        const isPdf = name.endsWith('.pdf');
        const isImage = file.type.startsWith('image/');

        if (!isPdf && !isImage) {
            addChatMessage('bot', 'Unsupported file type. Please upload a PDF or image.');
            event.target.value = '';
            return;
        }

        const endpoint = isPdf
            ? `${AI_BASE_URL}/upload/pdf/${encodeURIComponent(userId)}/${encodeURIComponent(subject)}`
            : `${AI_BASE_URL}/upload/image/${encodeURIComponent(userId)}/${encodeURIComponent(subject)}`;

        const formData = new FormData();
        formData.append('file', file);

        const statusMessage = addChatMessage('bot', 'Uploading file...');

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload error: ${response.status}`);
            }

            const result = await response.json();
            if (statusMessage) statusMessage.textContent = result.message || 'File uploaded.';
        } catch (error) {
            console.error('AI upload error:', error);
            if (statusMessage) statusMessage.textContent = 'File upload failed. Check the AI server.';
        } finally {
            event.target.value = '';
        }
    }

    // Initialize AI chatbot
    setupChatbot();
});

let currentUploadType = 'link';

function switchUploadTab(type) {
    currentUploadType = type;

    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(type === 'link' ? 'tabLink' : 'tabFile').classList.add('active');

    // Update inputs
    if (type === 'link') {
        document.getElementById('linkInputSection').style.display = 'block';
        document.getElementById('fileInputSection').style.display = 'none';
        document.getElementById('videoUrl').required = true;
        document.getElementById('videoFile').required = false;
    } else {
        document.getElementById('linkInputSection').style.display = 'none';
        document.getElementById('fileInputSection').style.display = 'block';
        document.getElementById('videoUrl').required = false;
        document.getElementById('videoFile').required = true;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search input enter key
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                searchVideos();
            }
        });
    }

    // Comment input enter key
    const commentInput = document.getElementById('commentInput');
    if (commentInput) {
        commentInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                addComment();
            }
        });
    }

    // Close modals on overlay click
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.addEventListener('click', function () {
            closeAllModals();
        });
    }
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modalOverlay');
    if (modal && overlay) {
        modal.classList.add('active');
        overlay.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modalOverlay');
    if (modal && overlay) {
        modal.classList.remove('active');
        overlay.classList.remove('active');
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    const overlay = document.getElementById('modalOverlay');
    modals.forEach(modal => modal.classList.remove('active'));
    if (overlay) overlay.classList.remove('active');
}

function showRegisterModal() {
    openModal('registerModal');
}

function showUploadModal() {
    if (!currentUser) {
        showAlert('Please login to upload videos.', 'warning');
        return;
    }
    openModal('uploadModal');
}

function showLoginModal() {
    openModal('loginModal');
}

function switchToRegister() {
    closeModal('loginModal');
    showRegisterModal();
}

function setLoginRole(role) {
    loginRole = role;
    const studentFields = document.getElementById('studentLoginFields');
    const adminFields = document.getElementById('adminLoginFields');
    const forgotBtn = document.getElementById('forgotPasswordBtn');
    const roleButtons = document.querySelectorAll('.role-btn');

    roleButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-role') === role);
    });

    if (studentFields) studentFields.style.display = role === 'student' ? 'block' : 'none';
    if (adminFields) adminFields.style.display = role === 'admin' ? 'block' : 'none';
    if (forgotBtn) forgotBtn.style.display = role === 'student' ? 'inline-flex' : 'none';
}

function showForgotPasswordModal() {
    openModal('forgotPasswordModal');
}

function setCurrentUser(user) {
    currentUser = user || null;
    currentRole = user ? user.role : null;
    updateAuthUI();
}

async function loadCurrentUser() {
    try {
        const response = await apiFetch(`${API_BASE_URL}/auth/me`);
        const result = await response.json();
        console.log('Auth /me response:', result);
        
        if (result.success && result.user) {
            console.log('User loaded:', result.user);
            setCurrentUser(result.user);
            closeModal('loginModal');
        } else {
            console.log('No user found in response');
            setCurrentUser(null);
        }
    } catch (error) {
        console.error('Load current user error:', error);
        setCurrentUser(null);
    }
}

function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userBadge = document.getElementById('currentUserBadge');
    const uploaderInput = document.getElementById('uploaderRollNumber');
    const commenterInput = document.getElementById('commenterRollNumber');

    if (currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-flex';
        if (userBadge) {
            userBadge.style.display = 'inline-flex';
            userBadge.textContent = `${currentUser.fullName || 'Student'} (${currentUser.rollNumber || currentUser.email})`;
        }
        if (uploaderInput) {
            uploaderInput.value = currentUser.rollNumber || '';
            uploaderInput.readOnly = true;
        }
        if (commenterInput) {
            commenterInput.value = currentUser.rollNumber || '';
            commenterInput.readOnly = true;
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userBadge) userBadge.style.display = 'none';
        if (uploaderInput) {
            uploaderInput.value = '';
            uploaderInput.readOnly = false;
        }
        if (commenterInput) {
            commenterInput.value = '';
            commenterInput.readOnly = false;
        }
    }
}

async function loginStudent() {
    const password = document.getElementById('loginPassword').value.trim();

    if (!password) {
        showAlert('Please enter your password', 'warning');
        return;
    }

    try {
        let response;

        if (loginRole === 'admin') {
            const email = document.getElementById('loginAdminEmail').value.trim();
            if (!email) {
                showAlert('Please enter admin email', 'warning');
                return;
            }
            response = await apiFetch(`${API_BASE_URL}/auth/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
        } else {
            const rollNumber = document.getElementById('loginRollNumber').value.trim();
            if (!rollNumber) {
                showAlert('Please enter roll number', 'warning');
                return;
            }
            response = await apiFetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rollNumber, password })
            });
        }

        const result = await response.json();
        if (result.success) {
            setCurrentUser(result.user);
            closeModal('loginModal');
            showAlert('Login successful', 'success');
            if (loginRole === 'admin') {
                window.location.href = 'admin.html';
            }
        } else {
            showAlert(result.message || 'Login failed', 'error');
        }
    } catch (error) {
        showAlert('Login failed. Please try again.', 'error');
    }
}

async function logoutUser() {
    await apiFetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    setCurrentUser(null);
    showAlert('Logged out', 'success');
}

function showVideoModal(videoId) {
    currentVideoId = videoId;
    openModal('videoModal');

    // Load video details
    loadVideoDetails(videoId);
    loadComments(videoId);
}

// API Functions
async function registerStudent() {
    const formData = {
        fullName: document.getElementById('fullName').value,
        department: document.getElementById('department').value,
        rollNumber: document.getElementById('rollNumber').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        securityQuestion: document.getElementById('securityQuestion').value,
        securityAnswer: document.getElementById('securityAnswer').value
    };

    try {
        // showLoading(); // Optional: implement global loading if needed

        const response = await apiFetch(`${API_BASE_URL}/students/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Registration successful! You can now upload videos.', 'success');
            closeModal('registerModal');
            document.getElementById('registrationForm').reset();

            // Refresh statistics
            loadPlatformStatistics();
        } else {
            showAlert(result.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAlert('Registration failed. Please try again.', 'error');
    }
}

async function startForgotPassword() {
    const rollNumber = document.getElementById('forgotRollNumber').value.trim();
    if (!rollNumber) {
        showAlert('Please enter your roll number', 'warning');
        return;
    }

    try {
        const response = await apiFetch(`${API_BASE_URL}/auth/security-question`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rollNumber })
        });

        const result = await response.json();
        if (result.success) {
            document.getElementById('forgotSecurityQuestion').value = result.question;
            showAlert('Security question loaded', 'success');
        } else {
            showAlert(result.message || 'Failed to load question', 'error');
        }
    } catch (error) {
        showAlert('Failed to load question', 'error');
    }
}

async function resetPasswordWithSecurity() {
    const rollNumber = document.getElementById('forgotRollNumber').value.trim();
    const answer = document.getElementById('forgotSecurityAnswer').value.trim();
    const newPassword = document.getElementById('forgotNewPassword').value.trim();

    if (!rollNumber || !answer || !newPassword) {
        showAlert('Please fill in all fields', 'warning');
        return;
    }

    try {
        const verifyResponse = await apiFetch(`${API_BASE_URL}/auth/verify-security`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rollNumber, securityAnswer: answer })
        });

        const verifyResult = await verifyResponse.json();
        if (!verifyResult.success) {
            showAlert(verifyResult.message || 'Invalid security answer', 'error');
            return;
        }

        const resetResponse = await apiFetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resetToken: verifyResult.resetToken, newPassword })
        });

        const resetResult = await resetResponse.json();
        if (resetResult.success) {
            showAlert('Password reset successful. Please login.', 'success');
            closeModal('forgotPasswordModal');
            document.getElementById('forgotPasswordForm').reset();
        } else {
            showAlert(resetResult.message || 'Reset failed', 'error');
        }
    } catch (error) {
        showAlert('Reset failed', 'error');
    }
}

async function uploadVideo() {
    const title = document.getElementById('videoTitle').value;
    const description = document.getElementById('videoDescription').value;
    const department = document.getElementById('videoDepartment').value;
    const subject = document.getElementById('videoSubject').value;
    const studentRollNumber = currentUser && currentUser.rollNumber
        ? currentUser.rollNumber
        : document.getElementById('uploaderRollNumber').value;

    if (!title || !department || !subject) {
        showAlert('Please fill in all required fields', 'warning');
        return;
    }

    if (!studentRollNumber) {
        showAlert('Please login to upload videos', 'warning');
        return;
    }

    try {
        let response;

        if (currentUploadType === 'link') {
            const videoUrl = document.getElementById('videoUrl').value;
            if (!videoUrl) {
                showAlert('Please enter a video URL', 'warning');
                return;
            }

            const formData = {
                title, description, department, subject, videoUrl, studentRollNumber
            };

            response = await apiFetch(`${API_BASE_URL}/videos/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        } else {
            const videoFile = document.getElementById('videoFile').files[0];
            if (!videoFile) {
                showAlert('Please select a video file', 'warning');
                return;
            }

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('department', department);
            formData.append('subject', subject);
            formData.append('studentRollNumber', studentRollNumber);
            formData.append('file', videoFile);

            response = await apiFetch(`${API_BASE_URL}/videos/upload-file`, {
                method: 'POST',
                body: formData
            });
        }

        const result = await response.json();

        if (result.success) {
            showAlert('Video uploaded successfully!', 'success');
            closeModal('uploadModal');
            document.getElementById('uploadForm').reset();
            switchUploadTab('link'); // Reset tab

            // Reload videos and refresh statistics
            loadAllVideos();
            loadPlatformStatistics();
        } else {
            showAlert(result.message || 'Upload failed', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showAlert('Upload failed. Please try again.', 'error');
    }
}

async function loadAllVideos() {
    try {
        showLoading();

        // Load videos from all departments
        const departments = ['CSE', 'ECE', 'EIE', 'Civil', 'Mechanical'];
        let allVideos = [];

        for (const dept of departments) {
            const response = await apiFetch(`${API_BASE_URL}/videos/department/${dept}`);
            const result = await response.json();

            if (result.success && result.videos) {
                allVideos = allVideos.concat(result.videos);
            }
        }

        // Sort by upload date (newest first)
        allVideos.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

        displayVideos(allVideos);
    } catch (error) {
        console.error('Load videos error:', error);
        showAlert('Failed to load videos', 'error');
    } finally {
        hideLoading();
    }
}

async function loadVideosByDepartment(department) {
    // Update active filter chip
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
        if (chip.getAttribute('data-dept') === department) {
            chip.classList.add('active');
        }
    });

    if (department === 'all') { // Handle 'all' case from button
        loadAllVideos();
        return;
    }

    try {
        showLoading();

        const response = await apiFetch(`${API_BASE_URL}/videos/department/${department}`);
        const result = await response.json();

        if (result.success) {
            displayVideos(result.videos);
        } else {
            showAlert(result.message || 'Failed to load videos', 'error');
        }
    } catch (error) {
        console.error('Load videos error:', error);
        showAlert('Failed to load videos', 'error');
    } finally {
        hideLoading();
    }
}

async function searchVideos() {
    const searchTerm = document.getElementById('searchInput').value.trim();

    if (!searchTerm) {
        loadAllVideos();
        return;
    }

    try {
        showLoading();

        const response = await apiFetch(`${API_BASE_URL}/videos/search?subject=${encodeURIComponent(searchTerm)}`);
        const result = await response.json();

        if (result.success) {
            displayVideos(result.videos);
        } else {
            showAlert(result.message || 'Search failed', 'error');
        }
    } catch (error) {
        console.error('Search error:', error);
        showAlert('Search failed', 'error');
    } finally {
        hideLoading();
    }
}

async function loadVideoDetails(videoId) {
    try {
        const response = await apiFetch(`${API_BASE_URL}/videos/${videoId}`);
        const result = await response.json();

        if (result.success) {
            const video = result.video;
            document.getElementById('videoModalTitle').textContent = video.title;

            // Convert URL to embed format
            const embedInfo = convertToEmbedUrl(video.videoUrl);
            const videoFrame = document.getElementById('videoFrame');

            if (embedInfo.type === 'youtube' || embedInfo.type === 'gdrive') {
                videoFrame.src = embedInfo.embedUrl;
                // If it was a video tag before, we might need to recreate iframe if we want to be robust, 
                // but here we assume iframe is always there or we replace parent content.
                // In index.html it is an iframe.
            } else {
                // For direct video files, we might need to replace iframe with video tag.
                // For simplicity, let's assume iframe works or we'd need to swap elements.
                // Given the original code swapped outerHTML, let's do similar if needed.
                // But for now, let's stick to iframe src if possible or just warn.
                videoFrame.src = video.videoUrl;
            }

            document.getElementById('videoDepartmentBadge').textContent = video.department;
            document.getElementById('videoSubjectBadge').textContent = video.subject;
            document.getElementById('videoDescriptionText').textContent = video.description || 'No description available';
            document.getElementById('uploaderName').textContent = video.uploaderName;
            document.getElementById('uploadDate').textContent = formatDate(video.uploadDate);
            document.getElementById('viewCount').textContent = video.viewCount || 0;

            const deleteBtn = document.getElementById('videoDeleteBtn');
            if (deleteBtn) {
                const isAdmin = currentUser && currentUser.role === 'ROLE_ADMIN';
                const isOwner = currentUser && 
                    video.uploaderId && 
                    currentUser.studentId && 
                    Number(currentUser.studentId) === Number(video.uploaderId);
                
                console.log('Delete button check:', {
                    hasCurrentUser: !!currentUser,
                    isAdmin,
                    isOwner,
                    currentUserId: currentUser?.studentId,
                    videoUploaderId: video.uploaderId,
                    userRole: currentUser?.role
                });
                
                deleteBtn.style.display = (isAdmin || isOwner) ? 'inline-flex' : 'none';
            }

            loadLikeCount(videoId);

            // Check if liked (requires roll number input in comment section or stored)
            // We'll skip auto-check for now unless we have a stored user.
        }
    } catch (error) {
        console.error('Load video details error:', error);
    }
}

async function loadLikeCount(videoId) {
    try {
        const response = await apiFetch(`${API_BASE_URL}/videos/${videoId}/likes`);
        const result = await response.json();

        if (result.success) {
            document.getElementById('likeCount').textContent = result.count;
        }
    } catch (error) {
        console.error('Load like count error:', error);
    }
}

async function likeVideo() {
    if (!currentUser) {
        showAlert('Please login to like videos', 'warning');
        return;
    }

    try {
        const response = await apiFetch(`${API_BASE_URL}/videos/${currentVideoId}/likes`, {
            method: 'POST'
        });

        const result = await response.json();

        if (result.success) {
            loadLikeCount(currentVideoId);
            showAlert('Video liked!', 'success');
        } else {
            showAlert(result.message || 'Failed to like video', 'error');
        }
    } catch (error) {
        console.error('Like video error:', error);
        showAlert('Failed to like video', 'error');
    }
}

async function loadComments(videoId) {
    try {
        const response = await apiFetch(`${API_BASE_URL}/videos/${videoId}/comments`);
        const result = await response.json();

        const commentsContainer = document.getElementById('commentsContainer');

        if (result.success && result.comments && result.comments.length > 0) {
            commentsContainer.innerHTML = result.comments.map(comment => `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-author">${comment.uploaderName || (comment.student ? comment.student.fullName : 'Unknown')}</span>
                        <span class="comment-date">${formatDate(comment.commentDate)}</span>
                    </div>
                    <div class="comment-text">${comment.commentText}</div>
                </div>
            `).join('');
        } else {
            commentsContainer.innerHTML = '<p class="text-muted" style="text-align:center; padding: 1rem;">No comments yet. Be the first!</p>';
        }
    } catch (error) {
        console.error('Load comments error:', error);
        document.getElementById('commentsContainer').innerHTML = '<p class="text-danger">Failed to load comments</p>';
    }
}

async function addComment() {
    const commentText = document.getElementById('commentInput').value.trim();

    if (!commentText) {
        showAlert('Please enter a comment', 'warning');
        return;
    }

    if (!currentUser) {
        showAlert('Please login to comment', 'warning');
        return;
    }

    try {
        const formData = {
            commentText: commentText,
            studentRollNumber: currentUser.rollNumber
        };

        const response = await apiFetch(`${API_BASE_URL}/videos/${currentVideoId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById('commentInput').value = '';
            loadComments(currentVideoId);
            showAlert('Comment added!', 'success');
        } else {
            showAlert(result.message || 'Failed to add comment', 'error');
        }
    } catch (error) {
        console.error('Add comment error:', error);
        showAlert('Failed to add comment', 'error');
    }
}

async function deleteCurrentVideo() {
    if (!currentVideoId) {
        showAlert('No video selected', 'warning');
        return;
    }

    if (!currentUser) {
        showAlert('Please login to delete videos', 'warning');
        return;
    }

    try {
        const response = await apiFetch(`${API_BASE_URL}/videos/${currentVideoId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            showAlert('Video deleted successfully', 'success');
            closeModal('videoModal');
            loadAllVideos();
            loadPlatformStatistics();
        } else {
            showAlert(result.message || 'Failed to delete video', 'error');
        }
    } catch (error) {
        console.error('Delete video error:', error);
        showAlert('Failed to delete video', 'error');
    }
}

// Display Functions
function displayVideos(videos) {
    const container = document.getElementById('videosContainer');

    if (!videos || videos.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
                <i class="fas fa-video-slash fa-3x" style="margin-bottom: 1rem; display: block;"></i>
                <h3>No videos found</h3>
                <p>Be the first to upload a video!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = videos.map(video => {
        const embedInfo = convertToEmbedUrl(video.videoUrl);

        return `
        <div class="video-card" onclick="showVideoModal(${video.id})">
            <div class="video-thumbnail">
                ${embedInfo.thumbnailUrl ?
                `<img src="${embedInfo.thumbnailUrl}" alt="${video.title}">` :
                `<div style="width:100%; height:100%; background:#000; display:flex; align-items:center; justify-content:center;"><i class="fas fa-play fa-2x"></i></div>`
            }
                <div class="play-icon">
                    <i class="fas fa-play-circle"></i>
                </div>
            </div>
            <div class="video-info">
                <div class="video-tags">
                    <span class="badge badge-primary">${video.department}</span>
                    <span class="badge badge-secondary">${video.subject}</span>
                </div>
                <h4 class="video-title">${video.title}</h4>
                <div class="video-meta-footer">
                    <span><i class="fas fa-user"></i> ${video.uploaderName}</span>
                    <span><i class="fas fa-clock"></i> ${formatDate(video.uploadDate)}</span>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Utility Functions
function convertToEmbedUrl(url) {
    // Handle YouTube URLs
    const ytMatch = url.match(/(?:https?:\/\/(?:www\.)?youtube\.com\/watch\?v=|https?:\/\/(?:www\.)?youtu\.be\/)([\w-]{11})/);
    if (ytMatch) {
        const videoId = ytMatch[1];
        return {
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            type: 'youtube'
        };
    }

    // Handle Google Drive URLs
    const gdMatch = url.match(/https?:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (gdMatch) {
        const fileId = gdMatch[1];
        return {
            embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
            thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,
            type: 'gdrive'
        };
    }

    return {
        embedUrl: url,
        thumbnailUrl: null,
        type: 'other'
    };
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    const container = document.getElementById('videosContainer');
    if (spinner) spinner.style.display = 'block';
    if (container) container.style.display = 'none';
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    const container = document.getElementById('videosContainer');
    if (spinner) spinner.style.display = 'none';
    if (container) container.style.display = 'grid'; // Changed to grid
}

function showAlert(message, type) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        font-family: var(--font-main);
        animation: slideIn 0.3s ease-out;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;

    const icon = type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'times-circle';

    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    // Add animation keyframes if not exists
    if (!document.getElementById('toast-animation')) {
        const style = document.createElement('style');
        style.id = 'toast-animation';
        style.innerHTML = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Statistics Functions
async function loadPlatformStatistics() {
    try {
        const studentResponse = await apiFetch(`${API_BASE_URL}/students/count`);
        const studentResult = await studentResponse.json();

        if (studentResult.success) {
            document.getElementById('studentCount').textContent = studentResult.totalStudents;
        }

        // Load video count
        const departments = ['CSE', 'ECE', 'EIE', 'Civil', 'Mechanical'];
        let totalVideos = 0;

        for (const dept of departments) {
            const videoResponse = await apiFetch(`${API_BASE_URL}/videos/department/${dept}`);
            const videoResult = await videoResponse.json();

            if (videoResult.success && videoResult.videos) {
                totalVideos += videoResult.videos.length;
            }
        }

        document.getElementById('videoCount').textContent = totalVideos;

    } catch (error) {
        console.error('Load statistics error:', error);
    }
}

// Export functions for global access (HTML onclick handlers)
window.switchUploadTab = switchUploadTab;
window.showRegisterModal = showRegisterModal;
window.showLoginModal = showLoginModal;
window.showForgotPasswordModal = showForgotPasswordModal;
window.switchToRegister = switchToRegister;
window.setLoginRole = setLoginRole;
window.showUploadModal = showUploadModal;
window.showVideoModal = showVideoModal;
window.closeModal = closeModal;
window.registerStudent = registerStudent;
window.loginStudent = loginStudent;
window.logoutUser = logoutUser;
window.startForgotPassword = startForgotPassword;
window.resetPasswordWithSecurity = resetPasswordWithSecurity;
window.uploadVideo = uploadVideo;
window.loadVideosByDepartment = loadVideosByDepartment;
window.loadAllVideos = loadAllVideos;
window.searchVideos = searchVideos;
window.likeVideo = likeVideo;
window.addComment = addComment;
window.deleteCurrentVideo = deleteCurrentVideo;
