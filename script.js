document.addEventListener('DOMContentLoaded', () => {
    checkActiveSession();
    renderJourneyLogs();
    populateMetricPlaceholders(); // Fill profile inputs on load
});

// Sync Inputs with LocalStorage
function populateMetricPlaceholders() {
    document.getElementById('update-age').value = localStorage.getItem('userAge') || "25";
    document.getElementById('update-height').value = localStorage.getItem('userHeight') || "165";
    document.getElementById('update-weight').value = localStorage.getItem('userWeight') || "62";
}

// Profile Tab Submission Logic
document.getElementById('metrics-update-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    localStorage.setItem('userAge', document.getElementById('update-age').value);
    localStorage.setItem('userHeight', document.getElementById('update-height').value);
    localStorage.setItem('userWeight', document.getElementById('update-weight').value);
    
    alert("Profile Updated Successfully!");
    renderJourneyLogs(); // Refresh the insights
    switchTab('dashboard');
});

// Age-Aware BMI Engine
function generateClinicalInsights(logs) {
    const age = parseInt(localStorage.getItem('userAge')) || 25;
    const height = parseFloat(localStorage.getItem('userHeight')) || 165;
    const weight = parseFloat(localStorage.getItem('userWeight')) || 62;
    const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1);

    // Dynamic age context
    let ageAdvice = (age > 60) ? "Senior focus: Monitor bone density and cardiac health." : "Adult focus: Prioritize metabolic stability.";
    
    let insightsList = document.getElementById('insightsList');
    insightsList.innerHTML = `
        <li><strong>Profile:</strong> Age ${age} | Height: ${height}cm | Weight: ${weight}kg</li>
        <li><strong>Calculated BMI:</strong> ${bmi} (${ageAdvice})</li>
    `;
    
    // Add existing log insights here...
}

// Tab Switching
function switchTab(tabName) {
    const views = ['dashboard', 'vitals', 'profile', 'food', 'medicines'];
    views.forEach(v => {
        document.getElementById(`${v}-tab`)?.style.setProperty('display', (v === tabName) ? 'block' : 'none', 'important');
    });
}

function downloadDoctorPDF() {
    html2pdf().from(document.getElementById('printableReportArea')).save();
}