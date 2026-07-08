// Configuration helper for environment variables
const ENV_CONFIG = {
    // For Vercel deployment, these will be injected at build time
    // For local development, they can be accessed directly
    MESH_API_KEY: typeof process !== 'undefined' && process.env?.VITE_MESH_API_KEY 
        ? process.env.VITE_MESH_API_KEY 
        : 'rsk_01KWYMTF1PY1HE7EAZ2BK8CPTW', // Fallback for local development
    
    MESH_API_URL: typeof process !== 'undefined' && process.env?.VITE_MESH_API_URL
        ? process.env.VITE_MESH_API_URL
        : 'https://api.meshconnect.com/v1/chat/completions'
};

// Note: For static sites on Vercel, we need to inject env vars at build time
// This is a workaround since we can't access process.env in browser JavaScript
// The actual API key should be set in Vercel environment variables

// User Authentication System
const CURRENT_USER_KEY = 'healthtracker_current_user';
const USERS_KEY = 'healthtracker_users';

// Check authentication on page load
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    currentUser = getCurrentUser();
    
    if (!currentUser) {
        // Not logged in, redirect to login
        window.location.href = 'auth.html';
        return;
    }

    // User is logged in, load the app
    displayUserInfo();
    initTabs();
    initForms();
    setDefaultDateTimes();
    loadDashboard();
    loadVitalsHistory();
    loadFoodHistory();
    loadMedicineHistory();
    loadProfile();
});

// Get current logged in user
function getCurrentUser() {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
}

// Display user info in header
function displayUserInfo() {
    if (currentUser) {
        document.getElementById('user-name').textContent = `👋 ${currentUser.name}`;
    }
}

// Logout function
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem(CURRENT_USER_KEY);
        window.location.href = 'auth.html';
    }
}

// Get user-specific storage key
function getUserKey(baseKey) {
    return `${baseKey}_${currentUser.username}`;
}

// MESH API Configuration - Use from ENV_CONFIG
const MESH_API_KEY = ENV_CONFIG.MESH_API_KEY;
const MESH_API_URL = ENV_CONFIG.MESH_API_URL;

// Tab Navigation
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            if (targetTab === 'dashboard') {
                loadDashboard();
            } else if (targetTab === 'vitals') {
                loadVitalsHistory();
            } else if (targetTab === 'food') {
                loadFoodHistory();
            } else if (targetTab === 'medicine') {
                loadMedicineHistory();
            } else if (targetTab === 'profile') {
                loadProfile();
            }
        });
    });
}

// Set default date/time to current
function setDefaultDateTimes() {
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    
    const dateTimeInputs = [
        'bp-datetime',
        'sugar-datetime',
        'food-datetime',
        'medicine-datetime'
    ];
    
    dateTimeInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = localDateTime;
    });
}

// Initialize Forms
function initForms() {
    document.getElementById('bp-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveBPReading();
    });

    document.getElementById('sugar-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveSugarReading();
    });

    document.getElementById('food-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveFoodEntry();
    });

    document.getElementById('medicine-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveMedicineEntry();
    });

    document.getElementById('chat-form').addEventListener('submit', (e) => {
        e.preventDefault();
        sendChatMessage();
    });

    document.getElementById('profile-update-form').addEventListener('submit', (e) => {
        e.preventDefault();
        updateProfile();
    });
}

// Update Profile Function
function updateProfile() {
    const height = document.getElementById('profile-height').value;
    const weight = document.getElementById('profile-weight').value;

    if (!height && !weight) {
        showAlert('Please enter at least one value to update', 'error');
        return;
    }

    // Get all users
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    
    // Update current user's profile
    if (!currentUser.profile) {
        currentUser.profile = {};
    }

    if (height) {
        currentUser.profile.height = parseFloat(height);
    }
    if (weight) {
        currentUser.profile.weight = parseFloat(weight);
    }

    // Save to users storage
    users[currentUser.username] = currentUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Update current user storage
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

    showAlert('Profile updated successfully!', 'success');
    loadProfile();
}

// Local Storage Functions (User-Specific)
function getData(baseKey) {
    const key = getUserKey(baseKey);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function saveData(baseKey, data) {
    const key = getUserKey(baseKey);
    localStorage.setItem(key, JSON.stringify(data));
}

function addEntry(baseKey, entry) {
    const data = getData(baseKey);
    data.unshift(entry);
    saveData(baseKey, data);
}

function deleteEntry(baseKey, id) {
    const data = getData(baseKey);
    const filtered = data.filter(item => item.id !== id);
    saveData(baseKey, filtered);
}

// BP Functions
function saveBPReading() {
    const systolic = document.getElementById('bp-systolic').value;
    const diastolic = document.getElementById('bp-diastolic').value;
    const datetime = document.getElementById('bp-datetime').value;
    const notes = document.getElementById('bp-notes').value;

    const entry = {
        id: Date.now(),
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        datetime: datetime,
        notes: notes,
        type: 'bp'
    };

    addEntry('bp', entry);
    showAlert('Blood pressure reading saved successfully!', 'success');
    document.getElementById('bp-form').reset();
    setDefaultDateTimes();
    loadDashboard();
    loadVitalsHistory();
}

// Sugar Functions
function saveSugarReading() {
    const value = document.getElementById('sugar-value').value;
    const type = document.getElementById('sugar-type').value;
    const datetime = document.getElementById('sugar-datetime').value;
    const notes = document.getElementById('sugar-notes').value;

    const entry = {
        id: Date.now(),
        value: parseInt(value),
        measurementType: type,
        datetime: datetime,
        notes: notes,
        type: 'sugar'
    };

    addEntry('sugar', entry);
    showAlert('Blood sugar reading saved successfully!', 'success');
    document.getElementById('sugar-form').reset();
    setDefaultDateTimes();
    loadDashboard();
    loadVitalsHistory();
}

// Food Functions
function saveFoodEntry() {
    const mealType = document.getElementById('meal-type').value;
    const description = document.getElementById('food-description').value;
    const datetime = document.getElementById('food-datetime').value;
    const calories = document.getElementById('food-calories').value;

    const entry = {
        id: Date.now(),
        mealType: mealType,
        description: description,
        datetime: datetime,
        calories: calories ? parseInt(calories) : null
    };

    addEntry('food', entry);
    showAlert('Food entry logged successfully!', 'success');
    document.getElementById('food-form').reset();
    setDefaultDateTimes();
    loadFoodHistory();
}

// Medicine Functions
function saveMedicineEntry() {
    const name = document.getElementById('medicine-name').value;
    const dosage = document.getElementById('medicine-dosage').value;
    const frequency = document.getElementById('medicine-frequency').value;
    const datetime = document.getElementById('medicine-datetime').value;
    const notes = document.getElementById('medicine-notes').value;

    const entry = {
        id: Date.now(),
        name: name,
        dosage: dosage,
        frequency: frequency,
        datetime: datetime,
        notes: notes
    };

    addEntry('medicine', entry);
    showAlert('Medicine logged successfully!', 'success');
    document.getElementById('medicine-form').reset();
    setDefaultDateTimes();
    loadDashboard();
    loadMedicineHistory();
}

// Load Dashboard
function loadDashboard() {
    const bpData = getData('bp');
    const sugarData = getData('sugar');
    const medicineData = getData('medicine');

    // Update stats
    if (bpData.length > 0) {
        const latest = bpData[0];
        document.getElementById('latest-bp').textContent = `${latest.systolic}/${latest.diastolic}`;
    } else {
        document.getElementById('latest-bp').textContent = '--/--';
    }

    if (sugarData.length > 0) {
        const latest = sugarData[0];
        document.getElementById('latest-sugar').textContent = latest.value;
    } else {
        document.getElementById('latest-sugar').textContent = '--';
    }

    document.getElementById('total-records').textContent = bpData.length + sugarData.length;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentMeds = medicineData.filter(med => new Date(med.datetime) >= sevenDaysAgo);
    const uniqueMeds = new Set(recentMeds.map(med => med.name));
    document.getElementById('active-meds').textContent = uniqueMeds.size;

    loadCharts();
    generateInsights();
}

// Load Charts
let bpChart, sugarChart;

function loadCharts() {
    const bpData = getData('bp').slice(0, 10).reverse();
    const sugarData = getData('sugar').slice(0, 10).reverse();

    const bpCtx = document.getElementById('bpChart');
    if (bpChart) bpChart.destroy();
    
    bpChart = new Chart(bpCtx, {
        type: 'line',
        data: {
            labels: bpData.map(item => formatDateTime(item.datetime)),
            datasets: [
                {
                    label: 'Systolic',
                    data: bpData.map(item => item.systolic),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Diastolic',
                    data: bpData.map(item => item.diastolic),
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 60,
                    max: 180
                }
            }
        }
    });

    const sugarCtx = document.getElementById('sugarChart');
    if (sugarChart) sugarChart.destroy();
    
    sugarChart = new Chart(sugarCtx, {
        type: 'line',
        data: {
            labels: sugarData.map(item => formatDateTime(item.datetime)),
            datasets: [{
                label: 'Blood Sugar (mg/dL)',
                data: sugarData.map(item => item.value),
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 70,
                    max: 300
                }
            }
        }
    });
}

// Generate Insights
function generateInsights() {
    const bpData = getData('bp');
    const sugarData = getData('sugar');
    const insightsContent = document.getElementById('insights-content');
    
    if (bpData.length === 0 && sugarData.length === 0) {
        insightsContent.innerHTML = '<p class="insight-placeholder">Record your vitals to see personalized insights</p>';
        return;
    }

    let insights = [];

    // BP Insights
    if (bpData.length > 0) {
        const latest = bpData[0];
        const avgSystolic = bpData.slice(0, 5).reduce((sum, item) => sum + item.systolic, 0) / Math.min(5, bpData.length);
        const avgDiastolic = bpData.slice(0, 5).reduce((sum, item) => sum + item.diastolic, 0) / Math.min(5, bpData.length);

        // Compare with user's baseline if available
        if (currentUser.profile && currentUser.profile.avgSystolic) {
            const baseline = currentUser.profile.avgSystolic;
            if (Math.abs(latest.systolic - baseline) > 20) {
                insights.push({
                    type: 'warning',
                    message: `📊 Your latest systolic BP (${latest.systolic}) differs significantly from your baseline (${baseline}). Monitor closely.`
                });
            }
        }

        if (latest.systolic >= 140 || latest.diastolic >= 90) {
            insights.push({
                type: 'danger',
                message: `⚠️ Latest BP reading (${latest.systolic}/${latest.diastolic}) is elevated. Consider consulting your doctor.`
            });
        } else if (latest.systolic >= 120 || latest.diastolic >= 80) {
            insights.push({
                type: 'warning',
                message: `📊 Latest BP (${latest.systolic}/${latest.diastolic}) is in prehypertension range. Monitor regularly.`
            });
        } else {
            insights.push({
                type: 'success',
                message: `✅ Latest BP (${latest.systolic}/${latest.diastolic}) is in normal range. Great job!`
            });
        }

        insights.push({
            type: 'info',
            message: `📈 Your average BP over last 5 readings: ${Math.round(avgSystolic)}/${Math.round(avgDiastolic)} mmHg`
        });
    }

    // Sugar Insights
    if (sugarData.length > 0) {
        const latest = sugarData[0];
        const avgSugar = sugarData.slice(0, 5).reduce((sum, item) => sum + item.value, 0) / Math.min(5, sugarData.length);

        // Compare with user's baseline if available
        if (currentUser.profile && currentUser.profile.avgSugar) {
            const baseline = currentUser.profile.avgSugar;
            if (Math.abs(latest.value - baseline) > 30) {
                insights.push({
                    type: 'warning',
                    message: `📊 Your latest blood sugar (${latest.value}) differs significantly from your baseline (${baseline}). Keep monitoring.`
                });
            }
        }

        if (latest.measurementType === 'fasting') {
            if (latest.value >= 126) {
                insights.push({
                    type: 'danger',
                    message: `⚠️ Fasting blood sugar (${latest.value} mg/dL) is high. Consult your doctor.`
                });
            } else if (latest.value >= 100) {
                insights.push({
                    type: 'warning',
                    message: `📊 Fasting blood sugar (${latest.value} mg/dL) is in prediabetes range.`
                });
            } else {
                insights.push({
                    type: 'success',
                    message: `✅ Fasting blood sugar (${latest.value} mg/dL) is normal!`
                });
            }
        } else if (latest.measurementType === 'post-meal') {
            if (latest.value >= 200) {
                insights.push({
                    type: 'danger',
                    message: `⚠️ Post-meal blood sugar (${latest.value} mg/dL) is very high.`
                });
            } else if (latest.value >= 140) {
                insights.push({
                    type: 'warning',
                    message: `📊 Post-meal blood sugar (${latest.value} mg/dL) is elevated.`
                });
            } else {
                insights.push({
                    type: 'success',
                    message: `✅ Post-meal blood sugar (${latest.value} mg/dL) is good!`
                });
            }
        }

        insights.push({
            type: 'info',
            message: `📈 Your average blood sugar over last 5 readings: ${Math.round(avgSugar)} mg/dL`
        });
    }

    insightsContent.innerHTML = insights.map(insight => 
        `<div class="insight-item ${insight.type}">${insight.message}</div>`
    ).join('');
}

// Load Vitals History
function loadVitalsHistory() {
    const bpData = getData('bp');
    const sugarData = getData('sugar');
    const combined = [...bpData, ...sugarData].sort((a, b) => 
        new Date(b.datetime) - new Date(a.datetime)
    );

    const historyContainer = document.getElementById('vitals-history');
    
    if (combined.length === 0) {
        historyContainer.innerHTML = '<div class="empty-state">No vitals recorded yet. Start tracking your health!</div>';
        return;
    }

    historyContainer.innerHTML = combined.map(item => {
        if (item.type === 'bp') {
            return `
                <div class="history-item">
                    <div class="history-item-header">
                        <div class="history-item-title">Blood Pressure: ${item.systolic}/${item.diastolic} mmHg</div>
                        <div class="history-item-time">${formatDateTime(item.datetime)}</div>
                    </div>
                    <div class="history-item-content">
                        ${item.notes ? `<p><strong>Notes:</strong> ${item.notes}</p>` : ''}
                        <button class="history-item-delete" onclick="deleteBPEntry(${item.id})">Delete</button>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="history-item">
                    <div class="history-item-header">
                        <div class="history-item-title">Blood Sugar: ${item.value} mg/dL (${formatType(item.measurementType)})</div>
                        <div class="history-item-time">${formatDateTime(item.datetime)}</div>
                    </div>
                    <div class="history-item-content">
                        ${item.notes ? `<p><strong>Notes:</strong> ${item.notes}</p>` : ''}
                        <button class="history-item-delete" onclick="deleteSugarEntry(${item.id})">Delete</button>
                    </div>
                </div>
            `;
        }
    }).join('');
}

// Load Food History
function loadFoodHistory() {
    const foodData = getData('food');
    const historyContainer = document.getElementById('food-history');
    
    if (foodData.length === 0) {
        historyContainer.innerHTML = '<div class="empty-state">No food entries yet. Start tracking your meals!</div>';
        return;
    }

    historyContainer.innerHTML = foodData.map(item => `
        <div class="history-item">
            <div class="history-item-header">
                <div class="history-item-title">🍽️ ${formatType(item.mealType)}</div>
                <div class="history-item-time">${formatDateTime(item.datetime)}</div>
            </div>
            <div class="history-item-content">
                <p>${item.description}</p>
                ${item.calories ? `<p><strong>Calories:</strong> ${item.calories} kcal</p>` : ''}
                <button class="history-item-delete" onclick="deleteFoodEntry(${item.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Load Medicine History
function loadMedicineHistory() {
    const medicineData = getData('medicine');
    const historyContainer = document.getElementById('medicine-history');
    
    if (medicineData.length === 0) {
        historyContainer.innerHTML = '<div class="empty-state">No medicine logs yet. Start tracking your medications!</div>';
        return;
    }

    historyContainer.innerHTML = medicineData.map(item => `
        <div class="history-item">
            <div class="history-item-header">
                <div class="history-item-title">💊 ${item.name} - ${item.dosage}</div>
                <div class="history-item-time">${formatDateTime(item.datetime)}</div>
            </div>
            <div class="history-item-content">
                <p><strong>Frequency:</strong> ${formatType(item.frequency)}</p>
                ${item.notes ? `<p><strong>Notes:</strong> ${item.notes}</p>` : ''}
                <button class="history-item-delete" onclick="deleteMedicineEntry(${item.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Load Profile
function loadProfile() {
    const profileInfo = document.getElementById('profile-info');
    
    let html = `
        <div class="profile-row">
            <span class="profile-label">Name:</span>
            <span class="profile-value">${currentUser.name}</span>
        </div>
        <div class="profile-row">
            <span class="profile-label">Username:</span>
            <span class="profile-value">${currentUser.username}</span>
        </div>
        <div class="profile-row">
            <span class="profile-label">Email:</span>
            <span class="profile-value">${currentUser.email}</span>
        </div>
        <div class="profile-row">
            <span class="profile-label">Member Since:</span>
            <span class="profile-value">${new Date(currentUser.createdAt).toLocaleDateString()}</span>
        </div>
    `;

    if (currentUser.profile) {
        html += `
            <div class="profile-row">
                <span class="profile-label">Age:</span>
                <span class="profile-value">${currentUser.profile.age}</span>
            </div>
            <div class="profile-row">
                <span class="profile-label">Gender:</span>
                <span class="profile-value">${formatType(currentUser.profile.gender)}</span>
            </div>
        `;

        if (currentUser.profile.height) {
            html += `
                <div class="profile-row">
                    <span class="profile-label">Height:</span>
                    <span class="profile-value">${currentUser.profile.height} cm</span>
                </div>
            `;
        }

        if (currentUser.profile.weight) {
            html += `
                <div class="profile-row">
                    <span class="profile-label">Weight:</span>
                    <span class="profile-value">${currentUser.profile.weight} kg</span>
                </div>
            `;
        }

        // Calculate and show BMI if both height and weight are available
        if (currentUser.profile.height && currentUser.profile.weight) {
            const heightInMeters = currentUser.profile.height / 100;
            const bmi = (currentUser.profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
            let bmiCategory = '';
            if (bmi < 18.5) bmiCategory = 'Underweight';
            else if (bmi < 25) bmiCategory = 'Normal';
            else if (bmi < 30) bmiCategory = 'Overweight';
            else bmiCategory = 'Obese';

            html += `
                <div class="profile-row">
                    <span class="profile-label">BMI:</span>
                    <span class="profile-value">${bmi} (${bmiCategory})</span>
                </div>
            `;
        }

        if (currentUser.profile.avgSystolic) {
            html += `
                <div class="profile-row">
                    <span class="profile-label">Baseline BP:</span>
                    <span class="profile-value">${currentUser.profile.avgSystolic}/${currentUser.profile.avgDiastolic} mmHg</span>
                </div>
            `;
        }

        if (currentUser.profile.avgSugar) {
            html += `
                <div class="profile-row">
                    <span class="profile-label">Baseline Blood Sugar:</span>
                    <span class="profile-value">${currentUser.profile.avgSugar} mg/dL</span>
                </div>
            `;
        }

        if (currentUser.profile.conditions) {
            html += `
                <div class="profile-row">
                    <span class="profile-label">Medical Conditions:</span>
                    <span class="profile-value">${currentUser.profile.conditions}</span>
                </div>
            `;
        }

        if (currentUser.profile.medications) {
            html += `
                <div class="profile-row">
                    <span class="profile-label">Regular Medications:</span>
                    <span class="profile-value">${currentUser.profile.medications}</span>
                </div>
            `;
        }

        // Pre-fill the update form
        if (currentUser.profile.height) {
            document.getElementById('profile-height').value = currentUser.profile.height;
        }
        if (currentUser.profile.weight) {
            document.getElementById('profile-weight').value = currentUser.profile.weight;
        }
    }

    profileInfo.innerHTML = html;
}

// Delete Functions
function deleteBPEntry(id) {
    if (confirm('Are you sure you want to delete this blood pressure reading?')) {
        deleteEntry('bp', id);
        loadDashboard();
        loadVitalsHistory();
        showAlert('Blood pressure reading deleted', 'success');
    }
}

function deleteSugarEntry(id) {
    if (confirm('Are you sure you want to delete this blood sugar reading?')) {
        deleteEntry('sugar', id);
        loadDashboard();
        loadVitalsHistory();
        showAlert('Blood sugar reading deleted', 'success');
    }
}

function deleteFoodEntry(id) {
    if (confirm('Are you sure you want to delete this food entry?')) {
        deleteEntry('food', id);
        loadFoodHistory();
        showAlert('Food entry deleted', 'success');
    }
}

function deleteMedicineEntry(id) {
    if (confirm('Are you sure you want to delete this medicine log?')) {
        deleteEntry('medicine', id);
        loadDashboard();
        loadMedicineHistory();
        showAlert('Medicine log deleted', 'success');
    }
}

// Utility Functions
function formatDateTime(datetime) {
    const date = new Date(datetime);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function formatType(type) {
    return type.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000; min-width: 300px;';
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transition = 'opacity 0.3s ease';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Report Generation
async function generateReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const bpData = getData('bp');
    const sugarData = getData('sugar');
    const foodData = getData('food');
    const medicineData = getData('medicine');
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229);
    doc.text('Health Saathi Report', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Patient: ${currentUser.name}`, 105, 28, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 34, { align: 'center' });
    
    let yPos = 45;
    
    // Blood Pressure Section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Blood Pressure Readings', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    if (bpData.length > 0) {
        bpData.slice(0, 10).forEach(item => {
            doc.text(`${formatDateTime(item.datetime)}: ${item.systolic}/${item.diastolic} mmHg`, 20, yPos);
            yPos += 6;
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
        });
    } else {
        doc.text('No blood pressure readings recorded', 20, yPos);
        yPos += 6;
    }
    
    yPos += 5;
    
    // Blood Sugar Section
    doc.setFontSize(14);
    doc.text('Blood Sugar Readings', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    if (sugarData.length > 0) {
        sugarData.slice(0, 10).forEach(item => {
            doc.text(`${formatDateTime(item.datetime)}: ${item.value} mg/dL (${formatType(item.measurementType)})`, 20, yPos);
            yPos += 6;
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
        });
    } else {
        doc.text('No blood sugar readings recorded', 20, yPos);
        yPos += 6;
    }
    
    yPos += 5;
    
    // Medicine Section
    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Current Medications', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    if (medicineData.length > 0) {
        const uniqueMeds = {};
        medicineData.forEach(item => {
            if (!uniqueMeds[item.name]) {
                uniqueMeds[item.name] = item;
            }
        });
        
        Object.values(uniqueMeds).slice(0, 10).forEach(item => {
            doc.text(`${item.name} - ${item.dosage} (${formatType(item.frequency)})`, 20, yPos);
            yPos += 6;
        });
    } else {
        doc.text('No medications recorded', 20, yPos);
    }
    
    // Save PDF
    doc.save(`health-report-${currentUser.username}-${new Date().toISOString().split('T')[0]}.pdf`);
    showAlert('Report generated successfully!', 'success');
}

// Export Data
function exportData() {
    const allData = {
        user: {
            name: currentUser.name,
            username: currentUser.username,
            email: currentUser.email
        },
        bloodPressure: getData('bp'),
        bloodSugar: getData('sugar'),
        foodDiary: getData('food'),
        medicines: getData('medicine'),
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `healthtracker-${currentUser.username}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showAlert('Data exported successfully!', 'success');
}

// Clear All Data
function clearAllData() {
    if (confirm('Are you sure you want to delete ALL your health data? This cannot be undone!')) {
        if (confirm('Really sure? This will permanently delete all your records!')) {
            localStorage.removeItem(getUserKey('bp'));
            localStorage.removeItem(getUserKey('sugar'));
            localStorage.removeItem(getUserKey('food'));
            localStorage.removeItem(getUserKey('medicine'));
            
            loadDashboard();
            loadVitalsHistory();
            loadFoodHistory();
            loadMedicineHistory();
            
            showAlert('All data has been cleared', 'success');
        }
    }
}

// AI Chatbot Functions
async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    addChatMessage(message, 'user');
    input.value = '';
    
    const loadingId = Date.now();
    addChatMessage('<div class="loading"></div>', 'assistant', loadingId);
    
    try {
        // Build context with user's health data
        const bpData = getData('bp');
        const sugarData = getData('sugar');
        
        let context = `Patient: ${currentUser.name}, Age: ${currentUser.profile?.age || 'N/A'}, Gender: ${currentUser.profile?.gender || 'N/A'}. `;
        
        if (currentUser.profile?.conditions) {
            context += `Medical conditions: ${currentUser.profile.conditions}. `;
        }
        
        if (currentUser.profile?.medications) {
            context += `Current medications: ${currentUser.profile.medications}. `;
        }
        
        if (bpData.length > 0) {
            const latest = bpData[0];
            context += `Latest BP: ${latest.systolic}/${latest.diastolic} mmHg. `;
            if (currentUser.profile?.avgSystolic) {
                context += `Baseline BP: ${currentUser.profile.avgSystolic}/${currentUser.profile.avgDiastolic}. `;
            }
        }
        
        if (sugarData.length > 0) {
            const latest = sugarData[0];
            context += `Latest blood sugar: ${latest.value} mg/dL (${latest.measurementType}). `;
            if (currentUser.profile?.avgSugar) {
                context += `Baseline blood sugar: ${currentUser.profile.avgSugar} mg/dL. `;
            }
        }
        
        const response = await fetch(MESH_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MESH_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful medical assistant for a patient health tracking app. Provide general health information and advice based on the patient's data. Always remind users to consult with their healthcare provider for personalized medical advice. Patient context: ${context}`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 500
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        const reply = data.choices[0].message.content;
        
        removeChatMessage(loadingId);
        addChatMessage(reply, 'assistant');
        
    } catch (error) {
        console.error('Chat error:', error);
        removeChatMessage(loadingId);
        addChatMessage('Sorry, I encountered an error connecting to the AI service. Please check that your MESH API key is configured correctly in Vercel environment variables.', 'system');
    }
}

function addChatMessage(content, role, id = null) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    if (id) messageDiv.id = `msg-${id}`;
    messageDiv.innerHTML = content;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeChatMessage(id) {
    const message = document.getElementById(`msg-${id}`);
    if (message) message.remove();
}
