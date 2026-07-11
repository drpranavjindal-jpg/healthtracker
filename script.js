// 1. Simple Navigation
function switchTab(id) {
    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// 2. Data Storage
function saveVitals() {
    localStorage.setItem('bp', document.getElementById('bp').value);
    localStorage.setItem('sugar', document.getElementById('sugar').value);
    alert('Vitals Saved');
    updateReport();
}

function saveFood() {
    localStorage.setItem('food', document.getElementById('food').value);
    alert('Food Saved');
    updateReport();
}

function saveMed() {
    localStorage.setItem('med', document.getElementById('med').value);
    alert('Medicine Saved');
    updateReport();
}

// 3. Report Engine (ALWAYS updates the PDF area)
function updateReport() {
    const report = document.getElementById('report-content');
    report.innerHTML = `
        <p><strong>BP:</strong> ${localStorage.getItem('bp') || 'Not Set'}</p>
        <p><strong>Sugar:</strong> ${localStorage.getItem('sugar') || 'Not Set'}</p>
        <p><strong>Food:</strong> ${localStorage.getItem('food') || 'Not Set'}</p>
        <p><strong>Medicine:</strong> ${localStorage.getItem('med') || 'Not Set'}</p>
        <p><em>Generated on: ${new Date().toLocaleString()}</em></p>
    `;
}

// 4. PDF Bug Fix (Targets ONLY the printable-area)
function exportPDF() {
    const element = document.getElementById('printable-area');
    html2pdf().from(element).save('MyReport.pdf');
}

// Initialize
window.onload = updateReport;