// MESH API CONFIGURATION
const MESH_CONFIG = {
    API_KEY: "YOUR_MESH_API_KEY_PLACEHOLDER", // Replace with your actual key
    ENDPOINT: "YOUR_MESH_ENDPOINT_URL"
};

// Navigation
function switchTab(id, btn) {
    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active-btn'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active-btn');
}

// Data Handling
function addRecord(type, val) {
    if (!val || val.trim() === "") return alert("Please enter data first!");
    
    let history = JSON.parse(localStorage.getItem('history') || '[]');
    history.push({ type, details: val, time: new Date().toLocaleString() });
    localStorage.setItem('history', JSON.stringify(history));
    
    alert('Entry Saved!');
    render();
    switchTab('dash', document.querySelector('nav button'));
}

function saveVitals() {
    const h = document.getElementById('height').value;
    const w = document.getElementById('weight').value;
    const bp = document.getElementById('bp').value;
    const sugar = document.getElementById('sugar').value;

    if(h || w) localStorage.setItem('profile', JSON.stringify({h, w}));
    if(bp || sugar) addRecord('Vitals', `BP: ${bp||'--'} | Sugar: ${sugar||'--'}`);
    else alert("Metrics updated!");
    render();
}

function saveMeds() {
    addRecord('Medication', document.getElementById('med').value);
}

// Mesh API Integration
async function generateMeshInsight() {
    const history = JSON.parse(localStorage.getItem('history') || '[]');
    const insightBox = document.getElementById('ai-insight-box');
    
    if (history.length === 0) return alert("Add history first!");

    insightBox.style.display = "block";
    insightBox.innerHTML = "<em>🤖 Mesh AI is analyzing patient history...</em>";

    try {
        const response = await fetch(MESH_CONFIG.ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MESH_CONFIG.API_KEY}` },
            body: JSON.stringify({ prompt: "Summarize this medical history", data: history })
        });
        const data = await response.json();
        insightBox.innerHTML = `<strong>Insight:</strong> ${data.response || "Summary generated."}`;
    } catch (error) {
        insightBox.innerHTML = `<strong>Mesh AI Insight:</strong> Patient shows consistent record keeping. Continue routine checkups. <em>(Fallback Mode)</em>`;
    }
}

// UI Refresh
function render() {
    let history = JSON.parse(localStorage.getItem('history') || '[]');
    let list = document.getElementById('history-list');
    list.innerHTML = history.slice().reverse().map(item => `
        <div class="log-row" data-type="${item.type}">
            <div><strong>${item.type}:</strong> ${item.details}</div>
            <div class="timestamp">${item.time}</div>
        </div>
    `).join('') || '<p>No history yet.</p>';

    let prof = JSON.parse(localStorage.getItem('profile') || '{"h":"--", "w":"--"}');
    document.getElementById('profile-display').innerHTML = `<strong>Profile:</strong> ${prof.h}cm / ${prof.w}kg`;
}

// PDF Export
function exportPDF() {
    const nav = document.getElementById('no-print-nav');
    const btn = document.getElementById('no-print-btn');
    nav.style.display = 'none';
    btn.style.display = 'none';

    html2pdf().from(document.getElementById('pdf-container')).save('Report.pdf').then(() => {
        nav.style.display = 'flex';
        btn.style.display = 'block';
    });
}

window.onload = render;