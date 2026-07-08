// User Authentication System - Simplified (No Passwords)

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
    // Login/Signup Form
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleLoginOrSignup();
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

// Handle Login or Signup (Auto-detect)
function handleLoginOrSignup() {
    const name = document.getElementById('user-name').value.trim();
    const username = document.getElementById('user-username').value.trim().toLowerCase();

    // Validation
    if (!name || !username) {
        showAlert('Please fill in all required fields', 'error', 'login-section');
        return;
    }

    const users = getAllUsers();
    const existingUser = users[username];

    if (existingUser) {
        // User exists - Log them in
        existingUser.lastLogin = new Date().toISOString();
        users[username] = existingUser;
        saveAllUsers(users);
        setCurrentUser(existingUser);

        showAlert(`Welcome back, ${existingUser.name}! Redirecting...`, 'success', 'login-section');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        // New user - Create account and show profile setup
        const newUser = {
            username: username,
            name: name,
            createdAt: new Date().toISOString(),
            profileComplete: false
        };

        // Temporarily save user
        users[username] = newUser;
        saveAllUsers(users);
        setCurrentUser(newUser);

        showAlert('New user! Let\'s set up your profile.', 'success', 'login-section');
        
        setTimeout(() => {
            showProfileSetup();
        }, 1000);
    }
}

// Handle Profile Setup
function handleProfileSetup() {
    const age = document.getElementById('setup-age').value;
    const gender = document.getElementById('setup-gender').value;
    const height = document.getElementById('setup-height').value;
    const weight = document.getElementById('setup-weight').value;
    const avgSystolic = document.getElementById('setup-avg-systolic').value;
    const avgDiastolic = document.getElementById('setup-avg-diastolic').value;
    const avgSugar = document.getElementById('setup-avg-sugar').value;
    const conditions = document.getElementById('setup-conditions').value.trim();
    const medications = document.getElementById('setup-medications').value.trim();

    if (!age || !gender || !height || !weight) {
        showAlert('Please fill in all required fields (age, gender, height, weight)', 'error', 'profile-setup-section');
        return;
    }

    // Get current user
    const currentUser = getCurrentUser();
    const users = getAllUsers();

    // Update user profile
    currentUser.profile = {
        age: parseInt(age),
        gender: gender,
        height: parseFloat(height),
        weight: parseFloat(weight),
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
