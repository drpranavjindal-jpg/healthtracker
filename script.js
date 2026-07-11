function switchTab(id, btn) {
    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active-btn'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active-btn');
}

// Global Save Function with Input Validation
function addRecord(type, val) {
    if (!val || val.trim() === '') {
        alert("Please enter some data before saving!");
        return;
    }
    let history = JSON.parse(localStorage.getItem('history') || '[]');
    history.push({ type, details: val, time: new Date().toLocaleString() });
    localStorage.setItem('history', JSON.stringify(history));
    alert('Entry Saved!');
    render();
}

function saveVitals() {
    const bp = document.getElementById('bp').value;
    const sugar = document.getElementById('sugar').value;
    if(!bp && !sugar) { alert("Please fill at least one field"); return; }
    addRecord('Vitals', `BP: ${bp || 'N/A'} | Sugar: ${sugar || 'N/A'}`);
}

function saveMeds() {
    addRecord('Medication', document.getElementById('med').value);
}

function render() {
    let history = JSON.parse(localStorage.getItem('history') || '[]');
    let list = document.getElementById('history-list');
    
    // Reverse to show latest logs first
    list.innerHTML = history.slice().reverse().map(item => `
        <div class="log-row">
            <div><strong>${item.type}:</strong> ${item.details}</div>
            <div class="timestamp">${item.time}</div>
        </div>
    `).join('').trim() || '<p>No records yet.</p>';
}

function exportPDF() {
    const element = document.getElementById('history-list');
    // Targeting the history container specifically for the PDF
    html2pdf().from(element).save('Medical_Report.pdf');
}

// Ensure the page loads current data
window.onload = render;