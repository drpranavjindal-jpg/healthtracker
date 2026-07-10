// ==========================================
// 1. "NO MESH, NO ENTRY" CONTEXTUAL GUARD
// ==========================================
const MeshValidator = {
    verifyContext: function(formElement) {
        if (!formElement) return false;
        
        // Crawls upwards to confirm submission context sits strictly inside validation parameters
        const meshContainer = formElement.closest('.mesh-layout') || document.getElementById('root-mesh-container');
        if (!meshContainer) {
            console.error("Layout Restriction Triggered: Entry Denied. No Mesh, No Entry.");
            return false;
        }
        return true;
    }
};

// ==========================================
// 2. RUNTIME IDENTITY LIFECYCLE MANAGEMENT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    checkActiveSession();
    renderJourneyLogs();
});

function checkActiveSession() {
    const activeEmail = localStorage.getItem('currentUserEmail');
    const isAuthPage = window.location.pathname.includes('auth.html');

    if (!activeEmail) {
        if (!isAuthPage) window.location.replace('./auth.html');
        return; 
    }

    if (isAuthPage) {
        window.location.replace('./index.html');
        return;
    }

    const activeName = localStorage.getItem('currentUserName') || "Radha Jindal";
    const userNameElement = document.getElementById('displayUserName');
    if (userNameElement) userNameElement.textContent = activeName;
    initDashboardForms();
}

// ==========================================
// 3. INTERACTIVE TAB SELECTOR INTERFACES
// ==========================================
function switchTab(tabName) {
    const views = ['dashboard', 'vitals', 'food', 'medicines'];
    views.forEach(v => {
        const section = document.getElementById(`${v}-tab`);
        if (section) section.style.setProperty('display', (v === tabName) ? 'block' : 'none', 'important');
        
        const btn = document.getElementById(`btn-${v}`);
        if (btn) {
            btn.style.background = (v === tabName) ? '#e0e7ff' : 'transparent';
            btn.style.color = (v === tabName) ? '#4f46e5' : '#64748b';
        }
    });
}

// ==========================================
// 4. DEFENSIVE TRANSACTION PIPELINE LISTENERS
// ==========================================
function initDashboardForms() {
    document.getElementById('vitals-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!MeshValidator.verifyContext(this)) { alert("Action Blocked: 'No Mesh, No Entry' rule violation."); return; }

        const sys = parseInt(document.getElementById('vitals-systolic').value, 10) || 0;
        const dia = parseInt(document.getElementById('vitals-diastolic').value, 10) || 0;
        const sugar = parseInt(document.getElementById('vitals-sugar').value, 10) || 0;
        
        const bpView = document.getElementById('dash-bp');
        const sugarView = document.getElementById('dash-sugar');
        if (bpView) bpView.textContent = `${sys}/${dia}`;
        if (sugarView) sugarView.textContent = sugar;
        
        saveJourneyLog('VITALS', `Vitals Logged - BP: ${sys}/${dia} mmHg, Blood Glucose: ${sugar} mg/dL`, { sys, dia, sugar });
        this.reset();
        switchTab('dashboard');
    });

    document.getElementById('food-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!MeshValidator.verifyContext(this)) { alert("Action Blocked: 'No Mesh, No Entry' rule violation."); return; }

        const meal = document.getElementById('food-desc').value.trim();
        saveJourneyLog('FOOD', `Nutritional Log - Consumed: "${meal}"`, null);
        this.reset();
        switchTab('dashboard');
    });

    document.getElementById('med-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!MeshValidator.verifyContext(this)) { alert("Action Blocked: 'No Mesh, No Entry' rule violation."); return; }

        const medName = document.getElementById('med-name').value.trim();
        const dosageMg = document.getElementById('med-mg').value;
        
        saveJourneyLog('MEDICINE', `Prescription Log - Medication: ${medName} | Strength: ${dosageMg} mg`, { medName, dosageMg });
        this.reset();
        switchTab('dashboard');
    });
}

function saveJourneyLog(type, message, meta) {
    let logs = JSON.parse(localStorage.getItem('healthJourneyRecords')) || [];
    logs.unshift({
        type: type, text: message, meta: meta,
        time: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    localStorage.setItem('healthJourneyRecords', JSON.stringify(logs));
    renderJourneyLogs();
}

// ==========================================
// 5. DIAGNOSTIC INTERPRETATION ENGINE (HEIGHT & WEIGHT INTEGRATED)
// ==========================================
function renderJourneyLogs() {
    const container = document.getElementById('journeyLogHistory');
    if (!container) return;
    
    let logs = JSON.parse(localStorage.getItem('healthJourneyRecords')) || [];
    const emptyMsg = document.getElementById('empty-log-msg');

    if (logs.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        container.innerHTML = '';
        generateClinicalInsights([]);
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    container.innerHTML = '';

    logs.forEach(log => {
        const item = document.createElement('div');
        item.style.padding = '14px 18px';
        item.style.background = '#f8fafc';
        item.style.borderLeft = log.type === 'VITALS' ? '4px solid #ef4444' : log.type === 'MEDICINE' ? '4px solid #10b981' : '4px solid #f59e0b';
        item.style.borderRadius = '6px';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.style.marginBottom = '8px';
        
        item.innerHTML = `
            <span style="font-weight: 500; color: #334155;">${log.text}</span>
            <span style="font-size: 0.85rem; color: #94a3b8; font-weight: 600;">⏰ ${log.time}</span>
        `;
        container.appendChild(item);
    });

    generateClinicalInsights(logs);
}

function generateClinicalInsights(logs) {
    const insightsList = document.getElementById('insightsList');
    const box = document.getElementById('clinicalInsightsBox');
    if (!insightsList) return;

    // Read the Height & Weight data entered during authentication/registration
    const heightMetric = localStorage.getItem('userHeight') || "165";
    const weightMetric = localStorage.getItem('userWeight') || "62";

    let insights = [`👤 <strong>Patient Demographics Profile:</strong> Baseline Height: ${heightMetric} cm | Body Mass Weight: ${weightMetric} kg`];

    if (logs.length === 0) {
        if (box) { box.style.background = '#f8fafc'; box.style.borderColor = '#e2e8f0'; }
        insightsList.innerHTML = `
            <li style="list-style: square; color: #1e293b; margin-bottom: 6px; line-height: 1.4;">${insights[0]}</li>
            <li style="color: #64748b; font-style: italic; list-style: none; margin-top: 6px;">No dynamic clinical insights available yet. Add vitals to analyze metrics.</li>
        `;
        return;
    }

    let uniqueMeds = new Set();
    
    let latestVitals = logs.find(l => l.type === 'VITALS');
    if (latestVitals && latestVitals.meta) {
        const { sys, dia, sugar } = latestVitals.meta;
        if (sys >= 130 || dia >= 80) insights.push(`⚠️ <strong>Elevated Blood Pressure:</strong> Checked at ${sys}/${dia} mmHg.`);
        else insights.push(`✅ <strong>Optimal Blood Pressure Standard:</strong> Baseline reads perfect at ${sys}/${dia} mmHg.`);

        if (sugar >= 140) insights.push(`⚠️ <strong>Hyperglycemia Metric Flagged:</strong> Serum glucose read high at ${sugar} mg/dL.`);
        else if (sugar < 70) insights.push(`🚨 <strong>Hypoglycemia Emergency Threshold:</strong> Critical low glucose reading at ${sugar} mg/dL.`);
        else insights.push(`✅ <strong>Glucose Stability Logged:</strong> Balanced reading at ${sugar} mg/dL.`);
    }

    logs.forEach(l => {
        if (l.type === 'MEDICINE' && l.meta) {
            uniqueMeds.add(`💊 Active Prescription Regime: <strong>${l.meta.medName}</strong> at a dosage strength of <strong>${l.meta.dosageMg} mg</strong>.`);
        }
    });
    uniqueMeds.forEach(med => insights.push(med));

    if (box) {
        const hasWarnings = insights.some(i => i.includes('⚠️') || i.includes('🚨'));
        box.style.background = hasWarnings ? '#fffb0012' : '#f0fdf4';
        box.style.borderColor = hasWarnings ? '#fef08a' : '#bbf7d0';
    }

    insightsList.innerHTML = insights.map(ins => `<li style="list-style: square; margin-bottom: 6px; color: #1e293b; line-height: 1.4;">${ins}</li>`).join('');
}

// ==========================================
// 6. PDF EXPORT ARCHIVE UTILITIES
// ==========================================
function downloadDoctorPDF() {
    const targetElement = document.getElementById('printableReportArea');
    const userName = localStorage.getItem('currentUserName') || "Patient";
    if (!targetElement) return;

    html2pdf().from(targetElement).set({
        margin: [15, 15], filename: `Clinical_Report_${userName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save();
}

function clearActiveSession() {
    localStorage.clear();
    window.location.replace('./auth.html');
}