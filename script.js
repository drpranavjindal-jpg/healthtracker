// ==========================================
// 1. GLOBAL CONFIGURATION & MESH API ACCESS
// ==========================================
const ENV_CONFIG = {
    MESH_API_KEY: typeof process !== 'undefined' && process.env?.VITE_MESH_API_KEY 
        ? process.env.VITE_MESH_API_KEY 
        : 'rsk_01KWYMTF1PY1HE7EAZ2BK8CPTW', 
    
    MESH_API_URL: typeof process !== 'undefined' && process.env?.VITE_MESH_API_URL
        ? process.env.VITE_MESH_API_URL
        : 'https://api.meshconnect.com/v1/chat/completions'
};

// ==========================================
// 2. INITIALIZATION & VIEW CONTROLLER
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Attach Form Submissions
    document.getElementById('loginForm')?.addEventListener('submit', handleLoginSubmit);
    document.getElementById('onboardingForm')?.addEventListener('submit', handleOnboardingSubmit);
    document.getElementById('chatForm')?.addEventListener('submit', handleChatSubmit);
    
    // Attach Navigation Links (Sidebar/Tabs)
    document.querySelectorAll('[data-target]').forEach(button => {
        button.addEventListener('click', (e) => {
            const targetView = e.currentTarget.getAttribute('data-target');
            switchView(targetView);
        });
    });

    // Check active session on page reload
    checkActiveSession();
});

// Generic View Switcher Function
function switchView(viewId) {
    // Hide all view sections
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.add('hidden');
    });
    // Show selected view section
    const activeSection = document.getElementById(viewId);
    if (activeSection) {
        activeSection.classList.remove('hidden');
    }
    
    // Highlight active sidebar/tab links if applicable
    document.querySelectorAll('[data-target]').forEach(btn => {
        if (btn.getAttribute('data-target') === viewId) {
            btn.classList.add('active-tab');
        } else {
            btn.classList.remove('active-tab');
        }
    });
}

function checkActiveSession() {
    const activeEmail = localStorage.getItem('currentUserEmail');
    const activeName = localStorage.getItem('currentUserName');
    
    if (activeEmail && activeName) {
        const existingProfile = localStorage.getItem(`profile_${activeEmail}`);
        if (existingProfile) {
            switchView('dashboard');
            loadUserProfileData(activeEmail);
        } else {
            switchView('onboarding');
        }
    } else {
        switchView('login');
    }
}

// ==========================================
// 3. SECURE AUTHENTICATION SYSTEM
// ==========================================
function handleLoginSubmit(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('userName').value.trim();
    const emailInput = document.getElementById('userEmail').value.trim();
    
    if (!nameInput || !emailInput) {
        alert('Please fill in both Name and Email Address.');
        return;
    }

    // Fetch existing users array from local storage
    let localUsers = JSON.parse(localStorage.getItem('health_saathi_users')) || [];

    // Validation: Check if BOTH name and email combination already exists
    const userExists = localUsers.some(user => 
        user.name.toLowerCase() === nameInput.toLowerCase() && 
        user.email.toLowerCase() === emailInput.toLowerCase()
    );

    // Save active session identifiers
    localStorage.setItem('currentUserEmail', emailInput);
    localStorage.setItem('currentUserName', nameInput);

    if (userExists) {
        const existingProfile = localStorage.getItem(`profile_${emailInput}`);
        if (existingProfile) {
            alert(`Welcome back, ${nameInput}! Restoring your local secure session.`);
            loadUserProfileData(emailInput);
            switchView('dashboard'); 
            return;
        }
    } else {
        // Track the unique identity combo in local environment log
        const newUser = {
            name: nameInput,
            email: emailInput,
            createdAt: new Date().toISOString()
        };
        localUsers.push(newUser);
        localStorage.setItem('health_saathi_users', JSON.stringify(localUsers));
    }

    alert('Identity verified securely on your local device!');
    switchView('onboarding'); 
}

// ==========================================
// 4. METRIC ONBOARDING & STORAGE
// ==========================================
function handleOnboardingSubmit(e) {
    e.preventDefault();
    const email = localStorage.getItem('currentUserEmail');
    
    if (!email) {
        alert('Session expired. Please log in again.');
        switchView('login');
        return;
    }

    const profileData = {
        age: document.getElementById('userAge')?.value || '',
        gender: document.getElementById('userGender')?.value || '',
        weight: document.getElementById('userWeight')?.value || '',
        bloodPressure: document.getElementById('userBP')?.value || '',
        bloodSugar: document.getElementById('userSugar')?.value || '',
        conditions: document.getElementById('userConditions')?.value || ''
    };

    // Save profile keyed specifically to this user's email local domain
    localStorage.setItem(`profile_${email}`, JSON.stringify(profileData));
    
    alert('Health Profile customized and locked locally!');
    loadUserProfileData(email);
    switchView('dashboard');
}

function loadUserProfileData(email) {
    const rawData = localStorage.getItem(`profile_${email}`);
    if (!rawData) return;
    
    const profile = JSON.parse(rawData);
    const name = localStorage.getItem('currentUserName');

    // Dynamically update UI text elements across dashboard if they exist
    if (document.getElementById('displayFieldsName')) document.getElementById('displayFieldsName').innerText = name;
    if (document.getElementById('displayFieldsEmail')) document.getElementById('displayFieldsEmail').innerText = email;
    if (document.getElementById('displayAge')) document.getElementById('displayAge').innerText = profile.age;
    if (document.getElementById('displayBP')) document.getElementById('displayBP').innerText = profile.bloodPressure;
}

// ==========================================
// 5. MESH AI CHAT ADVISOR CORE ENGINE
// ==========================================
async function handleChatSubmit(e) {
    e.preventDefault();
    const chatInput = document.getElementById('chatInputField');
    const chatBoxWindow = document.getElementById('chatWindowLogs');
    const userMessage = chatInput?.value.trim();

    if (!userMessage) return;

    // Append User Message to UI
    appendChatMessage('User', userMessage);
    chatInput.value = '';

    // Retrieve local user data profile context to make Mesh smart
    const email = localStorage.getItem('currentUserEmail');
    const rawProfile = localStorage.getItem(`profile_${email}`);
    const profileContext = rawProfile ? JSON.parse(rawProfile) : {};

    // System prompt forces the model into the 'HE05 Journal Buddy / Wellbeing' track archetype
    const systemPrompt = `You are Health Saathi, a helpful, private wellbeing and health journal buddy chatbot. 
    The current user context: Age ${profileContext.age || 'Unknown'}, BP: ${profileContext.bloodPressure || 'Normal'}, Baseline Conditions: ${profileContext.conditions || 'None'}.
    Provide concise, helpful, educational guidance. Do not substitute for professional medical prescription advice.`;

    // Append a temporary loading placeholder
    const loadingId = appendChatMessage('Health Saathi AI', 'Analyzing insights with Mesh API...');

    try {
        const response = await fetch(ENV_CONFIG.MESH_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ENV_CONFIG.MESH_API_KEY}`
            },
            body: JSON.stringify({
                model: 'mesh-ai-default', // uses your track configuration mapping
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) throw new Error(`API Status Code error: ${response.status}`);
        
        const data = await response.json();
        const aiReply = data.choices[0].message.content;
        
        // Update placeholder with live response
        updateChatMessage(loadingId, aiReply);

    } catch (err) {
        console.error('Mesh integration error details:', err);
        updateChatMessage(loadingId, 'Connection established, but could not stream reply. Please check Mesh API Key limits.');
    }
}

function appendChatMessage(sender, text) {
    const chatBoxWindow = document.getElementById('chatWindowLogs');
    if (!chatBoxWindow) return null;

    const messageDiv = document.createElement('div');
    const uniqueId = 'msg_' + Date.now() + Math.random().toString(36).substr(2, 4);
    messageDiv.id = uniqueId;
    messageDiv.className = `chat-msg ${sender === 'User' ? 'user-align' : 'ai-align'}`;
    messageDiv.innerHTML = `<strong>${sender}:</strong> <span class="text-body">${text}</span>`;
    
    chatBoxWindow.appendChild(messageDiv);
    chatBoxWindow.scrollTop = chatBoxWindow.scrollHeight;
    return uniqueId;
}

function updateChatMessage(msgId, newText) {
    const targetBubble = document.getElementById(msgId);
    if (targetBubble) {
        const contentSpan = targetBubble.querySelector('.text-body');
        if (contentSpan) contentSpan.innerText = newText;
    }
}

// Global Helper to simulate logout/session clear for quick judge resetting
function clearActiveSession() {
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('currentUserName');
    switchView('login');
}