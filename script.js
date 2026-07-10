// ==========================================
// 1. SESSION MANAGEMENT & INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    checkActiveSession();
    renderJourneyLogs();
});

function checkActiveSession() {
    const activeEmail = localStorage.getItem('currentUserEmail');
    const isAuthPage = window.location.pathname.includes('auth.html');

    if (!activeEmail) {
        if (!isAuthPage) {
            window.location.href = './auth.html';
        }
        return; 
    }

    if (activeEmail && isAuthPage) {
        window.location.href = './index.html';
        return;
    }

    if (activeEmail && !isAuthPage) {
        const activeName = localStorage.getItem('currentUserName') || "Radha Jindal";
        const userNameElement = document.getElementById('displayUserName');
        if (userNameElement) {
            userNameElement.textContent = activeName;
        }
        initDashboardForms();
    }
}

// ==========================================
// 2. AUTHENTICATION FLOW
// ==========================================
function toggleAuthMode(mode) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');

    if (mode === 'signup') {
        if(loginForm) loginForm.style.display = 'none';
        if(signupForm) signupForm.style.display = 'flex';
        if(title) title.textContent = "Create Your Profile";
        if(subtitle) subtitle.textContent = "Register your local health account";
    } else {
        if(loginForm) loginForm.style.display = 'flex';
        if(signupForm) signupForm.style.display = 'none';
        if(title) title.textContent = "Welcome to Health Saathi";
        if(subtitle) subtitle.textContent = "Sign in to view your health dashboard";
    }
}

function handleLoginSubmit(e) {
    if (e) e.preventDefault();
    const email = document.getElementById('userEmail')?.value.trim();
    localStorage.setItem('currentUserEmail', email);
    localStorage.setItem('currentUserName', "Radha Jindal");
    window.location.href = './index.html';
}

function handleSignUpSubmit(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('newName')?.value.trim();
    const email = document.getElementById('newEmail')?.value.trim();

    localStorage.setItem('currentUserEmail', email);
    localStorage.setItem('currentUserName', name);
    window.location.href = './index.html';
}

function clearActiveSession() {
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('currentUserName');
    localStorage.removeItem('healthJourneyRecords');
    window.location.href = './auth.html';
}

// ==========================================
// 3. SECURE TAB NAVIGATION CONTROLLER
// ==========================================
function switchTab(tabName) {
    alert("Opening the " + tabName.toUpperCase() + " dashboard panel...");

    const views = ['dashboard', 'vitals', 'food', 'medicines'];
    views.forEach(v => {
        const targetSection = document.getElementById(`${v}-tab`);
        if (targetSection) {
            targetSection.style.display = (v === tabName) ? 'block' : 'none';
        }
        
        const targetBtn = document.getElementById(`btn-${v}`);
        if (targetBtn) {
            if (v === tabName) {
                targetBtn.style.background = '#e0e7ff';
                targetBtn.style.color = '#4f46e5';
            } else {
                targetBtn.style.background = 'transparent';
                targetBtn.style.color = '#64748b';
            }
        }
    });
}

// ==========================================
// 4. THE JOURNEY LOGGER ENGINE
// ==========================================
function initDashboardForms() {
    document.getElementById('vitals-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const sys = document.getElementById('vitals-systolic').value;
        const dia = document.getElementById('vitals-diastolic').value;
        const sugar = document.getElementById('vitals-sugar').value || 'N/A';
        
        document.getElementById('dash-bp').textContent = `${sys}/${dia}`;
        if(sugar !== 'N/A') document.getElementById('dash-sugar').textContent = sugar;
        
        saveJourneyLog(`❤️ Vitals Recorded: Blood Pressure is ${sys}/${dia} mmHg, Blood Sugar is ${sugar} mg/dL`);
        e.target.reset();
        switchTab('dashboard');
    });

    document.getElementById('food-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const meal = document.getElementById('food-desc').value;
        saveJourneyLog(`🍎 Food Intake Logged: Consumed "${meal}"`);
        e.target.reset();
        switchTab('dashboard');
    });

    document.getElementById('med-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const med = document.getElementById('med-name').value;
        saveJourneyLog(`💊 Medication Added: Scheduled "${med}" successfully`);
        e.target.reset();
        switchTab('dashboard');
    });
}

function saveJourneyLog(message) {
    let logs = JSON.parse(localStorage.getItem('healthJourneyRecords')) || [];
    const entry = {
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    logs.unshift(entry); // Push newest entries to top
    localStorage.setItem('healthJourneyRecords', JSON.stringify(logs));
    renderJourneyLogs();
}

function renderJourneyLogs() {
    const container = document.getElementById('journeyLogHistory');
    if (!container) return;
    
    let logs = JSON.parse(localStorage.getItem('healthJourneyRecords')) || [];
    const emptyMsg = document.getElementById('empty-log-msg');

    if (logs.length === 0) {
        if(emptyMsg) emptyMsg.style.display = 'block';
        return;
    }

    if(emptyMsg) emptyMsg.style.display = 'none';
    container.innerHTML = ''; // clear slate

    logs.forEach(log => {
        const item = document.createElement('div');
        item.style.padding = '14px 18px';
        item.style.background = '#f8fafc';
        item.style.borderLeft = '4px solid #4f46e5';
        item.style.borderRadius = '6px';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        
        item.innerHTML = `
            <span style="font-weight: 500; color: #334155;">${log.text}</span>
            <span style="font-size: 0.85rem; color: #94a3b8; font-weight: 600;">⏰ ${log.time}</span>
        `;
        container.appendChild(item);
    });
}