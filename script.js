// ==========================================
// 1. "NO MESH, NO ENTRY" RULE VALIDATION LAYER
// ==========================================
const MeshValidator = {
    // Ensures everything strictly resides inside the proper grid layout system
    verifyContext: function(formElement) {
        if (!formElement) return false;

        // "No Mesh, No Entry" Rule Enforcement
        // Looks for your structural mesh wrappers or the main layout container
        const meshContainer = formElement.closest('.mesh-layout') || document.getElementById('root-mesh-container');
        
        if (!meshContainer) {
            console.error("Rule Triggered: Entry denied due to structural layout isolation.");
            return false;
        }
        return true;
    }
};

// ==========================================
// 2. LIFECYCLE MANAGEMENT & ROUTING
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
// 3. INTERACTIVE WORKSPACE VIEW CONTROLLER
// ==========================================
function switchTab(tabName) {
    const views = ['dashboard', 'vitals', 'food', 'medicines'];
    views.forEach(v => {
        const targetSection = document.getElementById(`${v}-tab`);
        if (targetSection) {
            if (v === tabName) {
                targetSection.style.setProperty('display', 'block', 'important');
            } else {
                targetSection.style.setProperty('display', 'none', 'important');
            }
        }
        
        // Keeps nav navigation highlighted seamlessly
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
// 4. DATA CAPTURE STREAMS & TRANSACTION HANDLERS
// ==========================================
function initDashboardForms() {
    // Vitals Submission Link
    document.getElementById('vitals-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!MeshValidator.verifyContext(this)) {
            alert("Action Blocked: 'No Mesh, No Entry' rule violation.");
            return;
        }

        const sys = parseInt(document.getElementById('vitals-systolic').value) || 0;
        const dia = parseInt(document.getElementById('vitals-diastolic').value) || 0;
        const sugar = parseInt(document.getElementById('vitals-sugar').value) || 0;
        
        const bpView = document.getElementById('dash-bp');
        const sugarView = document.getElementById('dash-sugar');
        if (bpView) bpView.textContent = `${sys}/${dia}`;
        if (sugarView) sugarView.textContent = sugar;
        
        saveJourneyLog('VITALS', `Vitals Logged - BP: ${sys}/${dia} mmHg, Blood Glucose: ${sugar} mg/dL`, { sys, dia, sugar });
        this.reset();
        switchTab('dashboard');
    });

    // Nutrition Submission Link
    document.getElementById('food-form')?.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!MeshValidator.verifyContext(this)) {
            alert("Action Blocked: 'No Mesh, No Entry' rule violation.");
            return;
        }

        const meal = document.getElementById('food-desc').value;
        saveJourneyLog('FOOD', `Nutritional Log - Consumed: "${meal}"`, null);
        this.reset();
        switchTab('dashboard');
    });

    // Medicine Submission Link (with dynamic mg metrics)
    document.getElementById('med-form')?.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!MeshValidator.verifyContext(this)) {
            alert("Action Blocked: 'No Mesh, No Entry' rule violation.");
            return;
        }

        const medName = document.getElementById('med-name').value;
        const dosageMg = document.getElementById('med-mg').value;
        
        saveJourneyLog('MEDICINE', `Prescription Log - Medication: ${medName} | Strength: ${dosageMg} mg`, { medName, dosageMg });
        this.reset();
        switchTab('dashboard');
    });
}

function saveJourneyLog(type, message, meta) {
    let logs = JSON.parse(localStorage.getItem('healthJourneyRecords')) || [];
    const entry = {
        type: type,
        text: message,
        meta: meta,
        time: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    logs.unshift(entry);
    localStorage.setItem('healthJourneyRecords', JSON.stringify(logs));
    renderJourneyLogs();
}

// ==========================================
// 5. DIAGNOSTIC PARSER & PRESENTATION SUMMARY
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

    if (logs.length === 0) {
        if (box) {
            box.style.background = '#f8fafc';
            box.style.borderColor = '#e2e8f0';
        }
        insightsList.innerHTML = `<li style="color: #64748b; font-style: italic; list-style: none;">No diagnostic data logged yet. Add vitals or medications to generate insights.</li>`;
        return;
    }

    let insights = [];
    let uniqueMeds = new Set();
    let latestVitals = logs.find(l => l.type === 'VITALS');

    if (latestVitals && latestVitals.meta) {
        const { sys, dia, sugar } = latestVitals.meta;
        
        if (sys >= 130 || dia >= 80) {
            insights.push(`⚠️ <strong>Elevated Blood Pressure Parameters Detected:</strong> Read at ${sys}/${dia} mmHg.`);
        } else if (sys < 90 || dia < 60) {
            insights.push(`⚠️ <strong>Hypotension Parameters Noted:</strong> Blood pressure running at ${sys}/${dia} mmHg.`);
        } else {
            insights.push(`✅ <strong>Optimal Blood Pressure Standard:</strong> Baseline reads perfect at ${sys}/${dia} mmHg.`);
        }

        if (sugar >= 140) {
            insights.push(`⚠️ <strong>Hyperglycemia Metric Flagged:</strong> Serum glucose read high at ${sugar} mg/dL.`);
        } else if (sugar < 70) {
            insights.push(`🚨 <strong>Hypoglycemia Emergency Threshold:</strong> Critical low glucose reading at ${sugar} mg/dL.`);
        } else {
            insights.push(`✅ <strong>Glucose Stability Logged:</strong> Level reads beautifully balanced at ${sugar} mg/dL.`);
        }
    }

    logs.forEach(l => {
        if (l.type === 'MEDICINE' && l.meta) {
            uniqueMeds.add(`💊 Active Regime Tracked: <strong>${l.meta.medName}</strong> at a dosage strength of <strong>${l.meta.dosageMg} mg</strong>.`);
        }
    });
    uniqueMeds.forEach(med => insights.push(med));

    if (box) {
        const hasWarnings = insights.some(i => i.includes('⚠️') || i.includes('🚨'));
        box.style.background = hasWarnings ? '#fffb0012' : '#f0fdf4';
        box.style.borderColor = hasWarnings ? '#fef08a' : '#bbf7d0';
    }

    insightsList.innerHTML = insights.map(ins => `<li style="list-style: square; margin-bottom: 4px; color: #1e293b;">${ins}</li>`).join('');
}

// ==========================================
// 6. EXPORT UTILITIES
// ==========================================
function downloadDoctorPDF() {
    const targetElement = document.getElementById('printableReportArea');
    const userName = localStorage.getItem('currentUserName') || "Patient";
    
    if (!targetElement) return;

    const opt = {
        margin:       [15, 15],
        filename:     `Clinical_Report_${userName.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(targetElement).set(opt).save();
}

function clearActiveSession() {
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('currentUserName');
    localStorage.removeItem('healthJourneyRecords');
    window.location.href = './auth.html';
}