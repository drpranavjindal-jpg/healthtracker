// Navigation Helper
function switchTab(id, btn) {
    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active-btn'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active-btn');
}

// Data Handling
function addRecord(type, val) {
    // Basic validation
    if (!val || val.trim() === "") {
        alert("Please enter data first!");
        return;
    }
    
    let history = JSON.parse(localStorage.getItem('history') || '[]');
    history.push({ type, details: val, time: new Date().toLocaleString() });
    localStorage.setItem('history', JSON.stringify(history));
    
    alert('Entry Saved!');
    render();
}

function saveVitals() {
    const h = document.getElementById('height').value;
    const w = document.getElementById('weight').value;
    const bp = document.getElementById('bp').value;
    const sugar = document.getElementById('sugar').value;

    // Update profile data
    if(h || w) localStorage.setItem('profile', JSON.stringify({h, w}));
    
    // Save to history
    addRecord('Vitals', `BP: ${bp||'--'} | Sugar: ${sugar||'--'}`);
}

function saveMeds() {
    addRecord('Medication', document.getElementById('med').value);
}

// UI Refresh
function render() {
    // Render History
    let history = JSON.parse(localStorage.getItem('history') || '[]');
    let list = document.getElementById('history-list');
    
    list.innerHTML = history.slice().reverse().map(item => `
        <div class="log-row">
            <div><strong>${item.type}:</strong> ${item.details}</div>
            <div class="timestamp">${item.time}</div>
        </div>
    `).join('') || '<p>No history yet.</p>';

    // Render Profile
    let prof = JSON.parse(localStorage.getItem('profile') || '{"h":"--", "w":"--"}');
    document.getElementById('profile-display').innerHTML = `<strong>Profile:</strong> ${prof.h}cm / ${prof.w}kg`;
}

// PDF Export
function exportPDF() {
    // Prints only the container
    html2pdf().from(document.querySelector('.container')).save('Medical_Report.pdf');
}

// Initialize
window.onload = render;