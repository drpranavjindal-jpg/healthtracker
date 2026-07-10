let isSignUpMode = false;

function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const nameGroup = document.getElementById('name-group');
    const clinicalGroup = document.getElementById('clinical-profile-group');
    const submitBtn = document.getElementById('submit-btn');
    const toggleText = document.getElementById('auth-toggle-text');

    if (!title || !subtitle || !nameGroup || !clinicalGroup || !submitBtn || !toggleText) return;

    if (isSignUpMode) {
        title.textContent = "Create Profile";
        subtitle.textContent = "Enroll into the clinical monitoring ledger";
        nameGroup.style.display = "flex";
        clinicalGroup.style.display = "grid";
        submitBtn.textContent = "Register & Enter";
        toggleText.innerHTML = `Already registered? <span onclick="toggleAuthMode()">Sign In</span>`;
        document.getElementById('auth-name')?.setAttribute('required', 'true');
        document.getElementById('auth-height')?.setAttribute('required', 'true');
        document.getElementById('auth-weight')?.setAttribute('required', 'true');
    } else {
        title.textContent = "Welcome Back";
        subtitle.textContent = "Log in to access your clinical journal";
        nameGroup.style.display = "none";
        clinicalGroup.style.display = "none";
        submitBtn.textContent = "Sign In";
        toggleText.innerHTML = `Don't have an account? <span onclick="toggleAuthMode()">Create Profile</span>`;
        document.getElementById('auth-name')?.removeAttribute('required');
        document.getElementById('auth-height')?.removeAttribute('required');
        document.getElementById('auth-weight')?.removeAttribute('required');
    }
}

document.getElementById('auth-form')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('auth-email').value.trim();
    
    if (isSignUpMode) {
        const name = document.getElementById('auth-name').value.trim();
        const height = document.getElementById('auth-height').value;
        const weight = document.getElementById('auth-weight').value;

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
    }

    // Fixes the bounce back/lockout loop by delaying redirection until local variables populate fully
    setTimeout(() => {
        window.location.replace('./index.html');
    }, 150);
});