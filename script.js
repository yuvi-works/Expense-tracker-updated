function switchTab(tabId) {
    // Determine the opposite form id (just for smooth transitions, though basic display block/none is used here)
    
    // Update tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(`tab-${tabId}`).classList.add('active');

    // Update forms
    document.querySelectorAll('.form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(`${tabId}-form`).classList.add('active');
}

// Attach Form Submit Handlers for API Auth Integration
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button[type="submit"]');
            const origText = btn.textContent;
            btn.textContent = 'Signing in...';
            btn.disabled = true;

            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-password').value;

            try {
                await auth.login(email, pass);
            } catch (err) {
                // Return button to active state natively
                btn.textContent = origText;
                btn.disabled = false;
            }
        });
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = signupForm.querySelector('button[type="submit"]');
            const origText = btn.textContent;
            btn.textContent = 'Creating account...';
            btn.disabled = true;

            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const pass = document.getElementById('signup-password').value;

            try {
                await auth.signup(name, email, pass);
            } catch (err) {
                btn.textContent = origText;
                btn.disabled = false;
            }
        });
    }
});
