let isSignUpMode = false;

function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;

    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const nameGroup = document.getElementById('name-group');
    const clinicalGroup = document.getElementById('clinical-profile-group');
    const submitBtn = document.getElementById('submit-btn');
    const toggleTextContainer = document.getElementById('auth-toggle-text');

    if (!title || !subtitle || !nameGroup || !clinicalGroup || !submitBtn || !toggleTextContainer) return;

    if (isSignUpMode) {
        title.textContent = "Create Profile";
        subtitle.textContent = "Enroll into the clinical monitoring ledger";
        nameGroup.style.display = "flex";
        clinicalGroup.style.display = "grid";
        submitBtn.textContent = "Register & Enter";
        toggleTextContainer.innerHTML = `Already registered? <span id="toggle-action-btn">Sign In</span>`;
        
        document.getElementById('auth-name')?.setAttribute('required', 'true');
        document.getElementById('auth-height')?.setAttribute('required', 'true');
        document.getElementById('auth-weight')?.setAttribute('required', 'true');
    } else {
        title.textContent = "Welcome Back";
        subtitle.textContent = "Log in to access your clinical journal";
        nameGroup.style.display = "none";
        clinicalGroup.style.display = "none";
        submitBtn.textContent = "Sign In";
        toggleTextContainer.innerHTML = `Don't have an account? <span id="toggle-action-btn">Create Profile</span>`;
        
        document.getElementById('auth-name')?.removeAttribute('required');
        document.getElementById('auth-height')?.removeAttribute('required');
        document.getElementById('auth-weight')?.removeAttribute('required');
    }
    
    document.getElementById('toggle-action-btn')?.addEventListener('click', toggleAuthMode);
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('auth-form');
    const toggleActionBtn = document.getElementById('toggle-action-btn');

    toggleActionBtn?.addEventListener('click', toggleAuthMode);

    form?.addEventListener('submit', function(e) {
        e.preventDefault();

        const emailInput = document.getElementById('auth-email');
        if (!emailInput) return;
        
        const email = emailInput.value.trim();

        if (isSignUpMode) {
            const name = document.getElementById('auth-name')?.value.trim() || "Radha Jindal";
            const height = document.getElementById('auth-height')?.value || "165";
            const weight = document.getElementById('auth-weight')?.value || "62";

            localStorage.setItem('currentUserEmail', email);
            localStorage.setItem('currentUserName', name);
            localStorage.setItem('userHeight', height);
            localStorage.setItem('userWeight', weight);
            localStorage.setItem('healthJourneyRecords', JSON.stringify([]));
        } else {
            localStorage.setItem('currentUserEmail', email);
            if (!localStorage.getItem('currentUserName')) {
                localStorage.setItem('currentUserName', "Radha Jindal");
            }
            if (!localStorage.getItem('userHeight')) {
                localStorage.setItem('userHeight', "165");
            }
            if (!localStorage.getItem('userWeight')) {
                localStorage.setItem('userWeight', "62");
            }
        }

        window.location.href = "./index.html";
    });
});