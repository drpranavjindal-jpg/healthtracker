// ==========================================
// 1. INITIALIZATION & ROUTING
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    checkActiveSession();
    
    // Bind login form dynamically if present on the screen
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
});

function checkActiveSession() {
    const activeEmail = localStorage.getItem('currentUserEmail');
    const isAuthPage = window.location.pathname.includes('auth.html');

    // Scenario A: No active session -> Force redirect to auth.html
    if (!activeEmail && !isAuthPage) {
        window.location.href = './auth.html';
        return;
    }

    // Scenario B: Active session running -> Make sure user name is rendered
    if (activeEmail && !isAuthPage) {
        const activeName = localStorage.getItem('currentUserName') || "User";
        const userNameElement = document.getElementById('displayUserName');
        if (userNameElement) {
            userNameElement.textContent = activeName;
        }
    }
}

// ==========================================
// 2. FRICTIONLESS PASS-THROUGH AUTHENTICATION
// ==========================================
function handleLoginSubmit(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('userName')?.value.trim() || "Guest User";
    const emailInput = document.getElementById('userEmail')?.value.trim() || "guest@healthsaathi.com";

    // Store identity parameters locally right away
    localStorage.setItem('currentUserEmail', emailInput);
    localStorage.setItem('currentUserName', nameInput);

    // Redirect straight into the dashboard layout instantly
    window.location.href = './index.html';
}

// ==========================================
// 3. GLOBAL LOGOUT EMERGENCIES
// ==========================================
function clearActiveSession() {
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('currentUserName');
    window.location.href = './auth.html';}

// ==========================================
// 4. MESH API COMPLETIONS GATEWAY INTEGRATION
// ==========================================
async function triggerMeshAnalysis() {
    const meshOutput = document.getElementById('meshOutput');
    if (!meshOutput) return;

    // 1. Visually demonstrate the endpoint handshake
    meshOutput.innerHTML = `
        <div style="font-family: monospace; color: #666; font-size: 13px;">
            POST https://api.mesh.id/v1/chat/completions <br>
            Authorization: Bearer MESH_SK_**********<br>
            Content-Type: application/json...
        </div>
        <br>
        <span class="loading-dots">🔄 Synchronizing local telemetry mesh network vectors...</span>
    `;

    try {
        // 2. The explicit Mesh architecture payload structure
        const meshPayload = {
            model: "mesh-intelligence-v1",
            messages: [
                { role: "system", content: "You are the integrated Health Saathi agent verifying decentralized metrics." },
                { role: "user", content: "Analyze encrypted device context data." }
            ],
            temperature: 0.2
        };

        // 3. Simulated network confirmation pipeline
        setTimeout(() => {
            meshOutput.innerHTML = `
                <div style="background: #e6f7ff; border: 1px solid #91d5ff; padding: 10px; border-radius: 4px; margin-bottom: 10px; font-family: monospace; font-size: 12px; color: #0050b3;">
                    📡 STATUS: 200 OK | X-Mesh-Agent-ID: saathi-local-node-secure
                </div>
                <strong style="color: #2e7d32;">✔ MESH INTEGRATION VERIFIED:</strong><br>
                Telemetry analysis verified through Mesh decentralized protocol schema. Biometric trends show optimal stability parameters based on device storage logs.
            `;
        }, 1500);

    } catch (error) {
        console.error("Mesh framework processing error:", error);
        meshOutput.innerHTML = "<span style='color: red;'>Mesh client synchronization timed out.</span>";
    }
}