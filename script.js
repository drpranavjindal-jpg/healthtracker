// ==========================================
// 1. INITIALIZATION & ROUTING ENGINE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    checkActiveSession();
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
// 2. UNIFIED PASSTHROUGH AUTH ENGINE
// ==========================================
function handleLoginSubmit(e) {
    if (e) e.preventDefault();
    const nameInput = document.getElementById('userName')?.value.trim() || "Radha Jindal";
    const emailInput = document.getElementById('userEmail')?.value.trim() || "guest@healthsaathi.com";

    localStorage.setItem('currentUserEmail', emailInput);
    localStorage.setItem('currentUserName', nameInput);
    window.location.href = './index.html';
}

function handleSignUpSubmit(e) {
    if (e) e.preventDefault();
    const nameInput = document.getElementById('newName')?.value.trim() || "Radha Jindal";
    const emailInput = document.getElementById('newEmail')?.value.trim() || "guest@healthsaathi.com";

    localStorage.setItem('currentUserEmail', emailInput);
    localStorage.setItem('currentUserName', nameInput);
    window.location.href = './index.html';
}

function clearActiveSession() {
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('currentUserName');
    window.location.href = './auth.html';
}

// ==========================================
// 3. SECURE TAB MANAGER (ALERT-FREE)
// ==========================================
function switchTab(tabName) {
    // Hide all panels
    const views = ['dashboard', 'vitals', 'food', 'medicines'];
    views.forEach(v => {
        const target = document.getElementById(`${v}-tab`);
        if (target) target.style.display = 'none';
        
        const btn = document.getElementById(`btn-${v}`);
        if (btn) {
            btn.style.background = 'transparent';
            btn.style.color = '#64748b';
        }
    });

    // Show the explicitly targeted segment
    const activeView = document.getElementById(`${tabName}-tab`);
    if (activeView) activeView.style.display = 'block';

    const activeBtn = document.getElementById(`btn-${tabName}`);
    if (activeBtn) {
        activeBtn.style.background = '#e0e7ff';
        activeBtn.style.color = '#4f46e5';
    }
}

// ==========================================
// 4. METRICS RECORDING CONTROLLER
// ==========================================
function initDashboardForms() {
    document.getElementById('vitals-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const sys = document.getElementById('vitals-systolic').value;
        const dia = document.getElementById('vitals-diastolic').value;
        const sugar = document.getElementById('vitals-sugar').value;
        
        if(document.getElementById('dash-bp')) document.getElementById('dash-bp').textContent = `${sys}/${dia}`;
        if(sugar && document.getElementById('dash-sugar')) document.getElementById('dash-sugar').textContent = sugar;
        
        e.target.reset();
        switchTab('dashboard');
    });

    document.getElementById('food-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        e.target.reset();
        switchTab('dashboard');
    });

    document.getElementById('med-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        e.target.reset();
        switchTab('dashboard');
    });
}