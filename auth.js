// User Authentication System

const USERS_KEY = 'healthtracker_users';
const CURRENT_USER_KEY = 'healthtracker_current_user';

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
        // User is logged in, redirect to main app
        window.location.href = 'index.html';
    }
    
    initAuthForms();
});

function initAuthForms() {
    // Login Form
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });

    // Signup Form
    document.getElementById('signup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleSignup();
    });

    // Profile Setup Form
    document.getElementById('profile-setup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleProfileSetup();
    });
}

function showLogin() {
    hideAllSections();
    document.getElementById('login-section').classList.add('active');
}

function showSignup() {
    hideAllSections();
    document.getElementById('signup-section').classList.add('active');
}

function showProfileSetup() {
    hideAllSections();
    document.getElementById('profile-setup-section').classList.add('active');
}

function hideAllSections() {
    document.querySelectorAll('.auth-section').forEach(section => {
        section.classList.remove('active');
    });
}

// Get all users
function getAllUsers() {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
}

// Save users
function saveAllUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Get current logged in user
function getCurrentUser() {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
}

// Set current user
function setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

// Hash password (simple hash for demo - in production use proper encryption)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

// Handle Login
function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        showAlert('Please fill in all fields', 'error', 'login-section');
        return;
    }

    const users = getAllUsers();
    const user = users[username.toLowerCase()];

    if (!user) {
        showAlert('User not found. Please check your username or sign up.', 'error', 'login-section');
        return;
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
        showAlert('Incorrect password. Please try again.', 'error', 'login-section');
        return;
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    users[username.toLowerCase()] = user;
    saveAllUsers(users);

    // Set current user and redirect
    setCurrentUser(user);
    showAlert('Login successful! Redirecting...', 'success', 'login-section');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Handle Signup
function handleSignup() {
    const name = document.getElementById('signup-name').value.trim();
    const username = document.getElementById('signup-username').value.trim().toLowerCase();
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    const privacyConsent = document.getElementById('privacy-consent').checked;

    // Validation
    if (!name || !username || !email || !password || !confirmPassword) {
        showAlert('Please fill in all fields', 'error', 'signup-section');
        return;
    }

    if (!privacyConsent) {
        showAlert('Please accept the privacy policy to continue', 'error', 'signup-section');
        return;
    }

    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'error', 'signup-section');
        return;
    }

    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'error', 'signup-section');
        return;
    }

    // Check if username already exists
    const users = getAllUsers();
    if (users[username]) {
        showAlert('Username already exists. Please choose another one.', 'error', 'signup-section');
        return;
    }

    // Check if email already exists
    const emailExists = Object.values(users).some(u => u.email === email);
    if (emailExists) {
        showAlert('Email already registered. Please use another email or login.', 'error', 'signup-section');
        return;
    }

    // Create new user (without profile data yet)
    const newUser = {
        username: username,
        name: name,
        email: email,
        password: hashPassword(password),
        createdAt: new Date().toISOString(),
        profileComplete: false,
        privacyConsent: true,
        privacyConsentDate: new Date().toISOString()
    };

    // Save user
    users[username] = newUser;
    saveAllUsers(users);

    // Set as current user and show profile setup
    setCurrentUser(newUser);
    showAlert('Account created successfully! Please complete your profile.', 'success', 'signup-section');
    
    setTimeout(() => {
        showProfileSetup();
    }, 1500);
}

// Handle Profile Setup
function handleProfileSetup() {
    const age = document.getElementById('setup-age').value;
    const gender = document.getElementById('setup-gender').value;
    const avgSystolic = document.getElementById('setup-avg-systolic').value;
    const avgDiastolic = document.getElementById('setup-avg-diastolic').value;
    const avgSugar = document.getElementById('setup-avg-sugar').value;
    const conditions = document.getElementById('setup-conditions').value.trim();
    const medications = document.getElementById('setup-medications').value.trim();

    if (!age || !gender) {
        showAlert('Please fill in age and gender', 'error', 'profile-setup-section');
        return;
    }

    // Get current user
    const currentUser = getCurrentUser();
    const users = getAllUsers();

    // Update user profile
    currentUser.profile = {
        age: parseInt(age),
        gender: gender,
        avgSystolic: avgSystolic ? parseInt(avgSystolic) : null,
        avgDiastolic: avgDiastolic ? parseInt(avgDiastolic) : null,
        avgSugar: avgSugar ? parseInt(avgSugar) : null,
        conditions: conditions,
        medications: medications,
        setupDate: new Date().toISOString()
    };
    currentUser.profileComplete = true;

    // Save updated user
    users[currentUser.username] = currentUser;
    saveAllUsers(users);
    setCurrentUser(currentUser);

    showAlert('Profile setup complete! Redirecting to your dashboard...', 'success', 'profile-setup-section');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Show Alert
function showAlert(message, type, sectionId) {
    // Remove any existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    const section = document.getElementById(sectionId);
    section.insertBefore(alert, section.firstChild);

    // Auto remove after 5 seconds
    setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transition = 'opacity 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}
