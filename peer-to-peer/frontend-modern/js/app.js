// Peer Learning Platform - Modern JavaScript File

// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';
// AI service is now accessed through Spring Boot backend, not directly
// const AI_BASE_URL = 'http://127.0.0.1:8000';  // No longer needed - using Spring Boot gateway

// Global Variables
let currentVideoId = null;
let currentUser = null;
let currentRole = null;
let loginRole = 'student';

function apiFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = options.headers || {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (options.body instanceof FormData && headers['Content-Type']) {
        delete headers['Content-Type'];
    }
    return fetch(url, { ...options, headers });
}

// All stored videos for filtering
let allLoadedVideos = [];
let currentTab = 'all';

// Initialize the application
document.addEventListener('DOMContentLoaded', async function () {
    console.log('Peer Learning Platform Modern UI initialized');

    // Protect page - redirect if not authenticated
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
        return;
    }

    // Load/restore user from localStorage (or from token via /auth/me)
    const ok = await ensureCurrentUser();
    if (!ok) return;

    // Load all videos on page load
    loadAllVideos();

    // Load platform statistics
    loadPlatformStatistics();

    // Add event listeners
    setupEventListeners();

    // Initialize upload tabs
    switchUploadTab('link');

    // AI Chatbot
    function setupChatbot() {
        const button = document.getElementById('ai-chatbot-button');
        const windowEl = document.getElementById('ai-chatbot-window');
        const closeBtn = document.getElementById('ai-chatbot-close');
        const resizeLeft = document.getElementById('ai-chatbot-resize-left');
        const promptChips = document.querySelectorAll('.ai-prompt-chip');
        const sendBtn = document.getElementById('ai-send-btn');
        const input = document.getElementById('ai-user-input');
        const fileInput = document.getElementById('ai-file-input');
        const fileName = document.getElementById('ai-file-name');

        if (!button || !windowEl) return;

        const minWidth = 300;
        const maxWidth = () => Math.min(720, Math.floor(window.innerWidth * 0.85));

        const clampWidth = (value) => Math.max(minWidth, Math.min(maxWidth(), value));

        const savedWidth = Number(localStorage.getItem('chatbotDrawerWidth') || 420);
        if (Number.isFinite(savedWidth)) {
            windowEl.style.width = `${clampWidth(savedWidth)}px`;
        }

        const openChat = () => {
            windowEl.classList.add('active');
            button.setAttribute('aria-expanded', 'true');
            if (input) input.focus();
        };

        const closeChat = () => {
            windowEl.classList.remove('active');
            button.setAttribute('aria-expanded', 'false');
        };

        const initResize = (handle) => {
            if (!handle) return;

            handle.addEventListener('pointerdown', (event) => {
                event.preventDefault();

                const startX = event.clientX;
                const startWidth = windowEl.getBoundingClientRect().width;
                handle.setPointerCapture(event.pointerId);

                const onMove = (moveEvent) => {
                    const dx = moveEvent.clientX - startX;
                    // Resize from right edge with right-to-left drag behavior.
                    const nextWidth = startWidth - dx;

                    windowEl.style.width = `${clampWidth(nextWidth)}px`;
                };

                const onUp = () => {
                    const current = Math.round(windowEl.getBoundingClientRect().width);
                    localStorage.setItem('chatbotDrawerWidth', String(clampWidth(current)));
                    handle.removeEventListener('pointermove', onMove);
                    handle.removeEventListener('pointerup', onUp);
                    handle.removeEventListener('pointercancel', onUp);
                };

                handle.addEventListener('pointermove', onMove);
                handle.addEventListener('pointerup', onUp);
                handle.addEventListener('pointercancel', onUp);
            });
        };

        initResize(resizeLeft);

        window.addEventListener('resize', () => {
            const current = Math.round(windowEl.getBoundingClientRect().width || savedWidth || 420);
            windowEl.style.width = `${clampWidth(current)}px`;
        });

        button.addEventListener('click', openChat);
        button.setAttribute('aria-expanded', 'false');
        if (closeBtn) closeBtn.addEventListener('click', closeChat);
        if (sendBtn) sendBtn.addEventListener('click', sendChatMessage);

        if (promptChips.length && input) {
            promptChips.forEach((chip) => {
                chip.addEventListener('click', () => {
                    const prompt = chip.getAttribute('data-prompt') || chip.textContent || '';
                    input.value = prompt.trim();
                    input.focus();
                });
            });
        }

        if (input) {
            input.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    sendChatMessage();
                }
            });
        }

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && windowEl.classList.contains('active')) {
                closeChat();
            }
        });

        if (fileInput) {
            fileInput.addEventListener('change', (event) => {
                const selected = event.target.files && event.target.files[0];
                if (fileName) {
                    fileName.textContent = selected ? selected.name : 'No file selected';
                }
                handleAiFileUpload(event);
            });
        }
    }

    function getAiMeta() {
        const userId = (
            currentUser && (
                currentUser.studentId ||
                currentUser.id ||
                currentUser.rollNumber
            )
        ) || null;
        // Try to get subject from a dropdown if it exists, otherwise use 'General'
        const subjectSelect = document.getElementById('subject-select');
        const subject = subjectSelect ? subjectSelect.value : 'General';

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
        const sendBtn = document.getElementById('ai-send-btn');
        if (!input) return;

        const question = input.value.trim();
        if (!question) return;

        const { userId, subject } = getAiMeta();
        addChatMessage('user', question);
        input.value = '';

        const thinking = addChatMessage('bot', 'Thinking...');
        if (sendBtn) sendBtn.disabled = true;

        try {
            // Call Spring Boot backend instead of FastAPI directly
            const aiHeaders = { 'Content-Type': 'application/json' };
            const token = localStorage.getItem('token');
            if (token) aiHeaders['Authorization'] = `Bearer ${token}`;
            
            const response = await fetch(`${API_BASE_URL}/ai/chat`, {
                method: 'POST',
                headers: aiHeaders,
                body: JSON.stringify({ 
                    userId: userId || 1,
                    question: question,
                    subject: subject || 'General',
                    videoTitle: document.getElementById('videoModalTitle')?.textContent || null,
                    videoDescription: document.getElementById('videoDescriptionText')?.textContent || null
                })

            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Server error: ${response.status}`);
            }

            const result = await response.json();
            
            // Enhanced response with adaptive learning metadata
            let messageText = result.answer || 'No response from AI service.';
            
            // Add learning level indicator if detected
            if (result.detectedLevel) {
                messageText += `\n\n📊 Your Learning Level: ${result.detectedLevel}`;
            }
            
            // Add question complexity indicator
            if (result.questionComplexity) {
                const complexity = (result.questionComplexity * 100).toFixed(0);
                messageText += `\n📈 Question Complexity: ${complexity}%`;
            }
            
            if (thinking) thinking.textContent = messageText;
            
        } catch (error) {
            console.error('AI chat error:', error);
            const errorMessage = error.message || 'AI service error. Please check the server.';
            if (thinking) {
                thinking.textContent = `❌ ${errorMessage}`;
                thinking.style.color = '#f44336';
            }
        } finally {
            if (sendBtn) sendBtn.disabled = false;
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

        // Use Spring Boot backend gateway for file uploads
        const endpoint = isPdf
            ? `${API_BASE_URL}/ai/upload/pdf`
            : `${API_BASE_URL}/ai/upload/image`;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', String(userId || '1'));
        formData.append('subject', subject || 'General');

        const statusMessage = addChatMessage('bot', '📤 Uploading file...');

        try {
            const uploadHeaders = {};
            const tkn = localStorage.getItem('token');
            if (tkn) uploadHeaders['Authorization'] = `Bearer ${tkn}`;
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: uploadHeaders,
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Upload error: ${response.status}`);
            }

            const result = await response.json();
            if (statusMessage) {
                statusMessage.textContent = result.message || '✅ File uploaded successfully!';
            }
        } catch (error) {
            console.error('AI upload error:', error);
            if (statusMessage) {
                statusMessage.textContent = `❌ File upload failed: ${error.message}`;
                statusMessage.style.color = '#f44336';
            }
        } finally {
            event.target.value = '';
            const fileName = document.getElementById('ai-file-name');
            if (fileName) fileName.textContent = 'No file selected';
        }
    }

    // Initialize AI chatbot
    setupChatbot();
});

async function ensureCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
        loadCurrentUser();
        return true;
    }

    try {
        const response = await apiFetch(`${API_BASE_URL}/auth/me`);
        const data = await response.json().catch(() => ({}));
        const principal = data && data.user ? data.user : null;

        if (!principal) {
            // Token exists but no principal -> treat as logged out
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
            return false;
        }

        const normalized = {
            role: principal.role,
            studentId: principal.studentId ?? null,
            rollNumber: principal.rollNumber ?? null,
            fullName: principal.name ?? null,
            department: principal.department ?? null,
            email: principal.email ?? null,
        };
        localStorage.setItem('user', JSON.stringify(normalized));
        setCurrentUser(normalized);
        return true;
    } catch (e) {
        console.error('ensureCurrentUser error:', e);
        window.location.href = 'login.html';
        return false;
    }
}

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

        if (modalId === 'videoModal') {
            const frame = document.getElementById('videoFrame');
            const player = document.getElementById('videoPlayer');
            if (frame) {
                frame.src = '';
                frame.style.display = 'none';
            }
            if (player) {
                player.pause();
                player.removeAttribute('src');
                player.load();
                player.style.display = 'none';
            }
        }
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
    // Auto-fill department and roll number from user profile
    const deptSelect = document.getElementById('videoDepartment');
    if (deptSelect && currentUser.department) deptSelect.value = currentUser.department;
    const rollInput = document.getElementById('uploaderRollNumber');
    if (rollInput) {
        rollInput.value = currentUser.rollNumber || '';
        rollInput.readOnly = true;
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

function loadCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            setCurrentUser(user);
        } catch (e) {
            console.error('Failed to parse user from localStorage');
            setCurrentUser(null);
        }
    } else {
        window.location.href = 'login.html';
    }
}

function updateAuthUI() {
    if (currentUser) {
        // Populate navbar user info
        const avatar = document.getElementById('userAvatar');
        const nameEl = document.getElementById('navUserName');
        const deptEl = document.getElementById('navUserDept');
        const welcomeEl = document.getElementById('welcomeText');

        if (avatar) {
            const initials = (currentUser.fullName || 'S')
                .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
            avatar.textContent = initials;
        }
        if (nameEl) nameEl.textContent = currentUser.fullName || 'Student';
        if (deptEl) deptEl.textContent = currentUser.department || 'Student';
        if (welcomeEl) welcomeEl.textContent = `Welcome back, ${(currentUser.fullName || 'Student').split(' ')[0]}!`;

        // Auto-fill roll numbers
        const uploaderInput = document.getElementById('uploaderRollNumber');
        const commenterInput = document.getElementById('commenterRollNumber');
        if (uploaderInput) {
            uploaderInput.value = currentUser.rollNumber || '';
            uploaderInput.readOnly = true;
        }
        if (commenterInput) {
            commenterInput.value = currentUser.rollNumber || '';
            commenterInput.readOnly = true;
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

function logoutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'landing.html';
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

        allLoadedVideos = allVideos;
        displayVideos(allVideos);
    } catch (error) {
        console.error('Load videos error:', error);
        showAlert('Failed to load videos', 'error');
    } finally {
        hideLoading();
    }
}

function switchContentTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.content-tab').forEach(t => {
        t.classList.toggle('active', t.getAttribute('data-tab') === tab);
    });

    if (tab === 'my') {
        loadMyVideos();
    } else {
        displayVideos(allLoadedVideos);
    }
}

function loadMyVideos() {
    if (!currentUser || !currentUser.rollNumber) {
        displayVideos([]);
        return;
    }
    const myVideos = allLoadedVideos.filter(v => v.uploaderRollNumber === currentUser.rollNumber);
    displayVideos(myVideos);
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
            const videoPlayer = document.getElementById('videoPlayer');

            const rawUrl = (video.videoUrl || '').trim();
            const lowerUrl = rawUrl.toLowerCase();
            const isDirectVideo = /\.(mp4|webm|ogg)(\?|#|$)/i.test(lowerUrl) || lowerUrl.includes('/uploads/');
            const looksLikeHomepage = /^(https?:\/\/)(localhost|127\.0\.0\.1):8080(\/api)?\/?$/.test(lowerUrl);

            const showIframe = (src) => {
                if (videoPlayer) {
                    videoPlayer.pause();
                    videoPlayer.removeAttribute('src');
                    videoPlayer.load();
                    videoPlayer.style.display = 'none';
                }
                if (videoFrame) {
                    videoFrame.src = src || '';
                    videoFrame.style.display = 'block';
                }
            };

            const showVideo = (src) => {
                if (videoFrame) {
                    videoFrame.src = '';
                    videoFrame.style.display = 'none';
                }
                if (videoPlayer) {
                    videoPlayer.preload = 'metadata';
                    videoPlayer.setAttribute('playsinline', 'playsinline');
                    videoPlayer.src = src || '';
                    videoPlayer.style.display = 'block';
                    // Skip exact first frame (often black for uploaded videos)
                    videoPlayer.onloadedmetadata = () => {
                        try {
                            if (!Number.isNaN(videoPlayer.duration) && videoPlayer.duration > 1) {
                                videoPlayer.currentTime = 0.2;
                            }
                        } catch (e) {
                            // ignore seek issues
                        }
                    };
                }
            };

            if (!rawUrl || looksLikeHomepage) {
                showIframe('');
                showAlert('This video link looks invalid (not a playable URL). Please re-upload or use a proper YouTube/Drive/video file URL.', 'warning');
            } else if (embedInfo.type === 'youtube' || embedInfo.type === 'gdrive') {
                showIframe(embedInfo.embedUrl);
            } else if (isDirectVideo) {
                // Uploaded/local video: avoid iframe embedding restrictions (X-Frame-Options)
                showVideo(rawUrl);
            } else {
                // Fallback: try iframe; some sites may block framing.
                showIframe(rawUrl);
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

    if (!currentUser.rollNumber) {
        showAlert('Only student accounts can like videos', 'warning');
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

    if (!currentUser.rollNumber) {
        showAlert('Only student accounts can comment', 'warning');
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
            <div class="empty-state">
                <i class="fas fa-video-slash"></i>
                <h3>No videos found</h3>
                <p>Be the first to upload a video!</p>
            </div>
        `;
        return;
    }

    const userRoll = currentUser ? currentUser.rollNumber : null;

    container.innerHTML = videos.map(video => {
        const embedInfo = convertToEmbedUrl(video.videoUrl);
        const isOwn = userRoll && video.uploaderRollNumber === userRoll;
        const thumbnailMarkup = embedInfo.thumbnailUrl
            ? `<img src="${embedInfo.thumbnailUrl}" alt="${video.title}">`
            : embedInfo.type === 'direct'
                ? `<video class="video-preview" muted preload="metadata" playsinline src="${embedInfo.previewUrl || video.videoUrl}"></video>`
                : `<div style="width:100%; height:100%; background:linear-gradient(135deg,#4f46e5,#6d28d9); display:flex; align-items:center; justify-content:center;"><i class="fas fa-play" style="color:#fff; font-size:2rem;"></i></div>`;

        return `
        <div class="video-card" onclick="showVideoModal(${video.id})">
            <div class="video-thumbnail">
                ${thumbnailMarkup}
                <div class="play-overlay">
                    <i class="fas fa-play-circle"></i>
                </div>
            </div>
            <div class="video-body">
                <div class="video-tags">
                    <span class="badge badge-dept">${video.department}</span>
                    <span class="badge badge-subject">${video.subject}</span>
                    ${isOwn ? '<span class="badge badge-own">My Upload</span>' : ''}
                </div>
                <h4 class="video-title">${video.title}</h4>
                <div class="video-meta">
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
    const safeUrl = (url || '').trim();

    if (!safeUrl) {
        return {
            embedUrl: '',
            thumbnailUrl: null,
            previewUrl: null,
            type: 'other'
        };
    }

    // Handle YouTube URLs
    const ytMatch = safeUrl.match(/(?:https?:\/\/(?:www\.)?youtube\.com\/watch\?v=|https?:\/\/(?:www\.)?youtu\.be\/)([\w-]{11})/);
    if (ytMatch) {
        const videoId = ytMatch[1];
        return {
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            previewUrl: null,
            type: 'youtube'
        };
    }

    // Handle Google Drive URLs
    const gdMatch = safeUrl.match(/https?:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (gdMatch) {
        const fileId = gdMatch[1];
        return {
            embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
            thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,
            previewUrl: null,
            type: 'gdrive'
        };
    }

    const isDirectVideo = /\.(mp4|webm|ogg|m4v|mov)(\?|#|$)/i.test(safeUrl) || safeUrl.toLowerCase().includes('/uploads/');
    if (isDirectVideo) {
        return {
            embedUrl: safeUrl,
            thumbnailUrl: null,
            previewUrl: safeUrl.includes('#') ? safeUrl : `${safeUrl}#t=0.8`,
            type: 'direct'
        };
    }

    return {
        embedUrl: safeUrl,
        thumbnailUrl: null,
        previewUrl: null,
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
        font-family: 'Inter', sans-serif;
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
window.showUploadModal = showUploadModal;
window.showVideoModal = showVideoModal;
window.closeModal = closeModal;
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
window.switchContentTab = switchContentTab;
