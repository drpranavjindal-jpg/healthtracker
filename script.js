// Tab Switching
function switchTab(id, btn) {
    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active-btn'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active-btn');
}

// Logic to refresh UI and PDF area
function updateReport() {
    const report = document.getElementById('report-content');
    const grid = document.getElementById('dash-grid');
    
    // UI Data
    const bp = localStorage.getItem('bp') || 'No Data';
    const sugar = localStorage.getItem('sugar') || 'No Data';
    const food = localStorage.getItem('food') || 'No Data';
    const med = localStorage.getItem('med') || 'No Data';

    // Update Report PDF area
    report.innerHTML = `
        <p><strong>BP:</strong> ${bp}</p>
        <p><strong>Sugar:</strong> ${sugar}</p>
        <p><strong>Diet:</strong> ${food}</p>
        <p><strong>Meds:</strong> ${med}</p>
    `;

    // Update Dashboard Cards
    grid.innerHTML = `
        <div class="card"><h4>BP</h4><p>${bp}</p></div>
        <div class="card"><h4>Sugar</h4><p>${sugar}</p></div>
        <div class="card"><h4>Diet</h4><p>${food}</p></div>
        <div class="card"><h4>Meds</h4><p>${med}</p></div>
    `;
}

// Save Functions
function saveVitals() { 
    localStorage.setItem('bp', document.getElementById('bp').value); 
    localStorage.setItem('sugar', document.getElementById('sugar').value); 
    alert('Saved'); updateReport(); 
}
function saveFood() { 
    localStorage.setItem('food', document.getElementById('food').value); 
    alert('Saved'); updateReport(); 
}
function saveMed() { 
    localStorage.setItem('med', document.getElementById('med').value); 
    alert('Saved'); updateReport(); 
}

// Export PDF
function exportPDF() { 
    html2pdf().from(document.getElementById('printable-area')).save('Medical_Report.pdf'); 
}

// Ensure app loads correctly
document.addEventListener('DOMContentLoaded', updateReport);