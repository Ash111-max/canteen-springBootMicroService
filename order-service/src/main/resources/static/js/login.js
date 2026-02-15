/* ========================================
   LOGIN PAGE JAVASCRIPT
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

// === SETUP EVENT LISTENERS ===
function setupEventListeners() {
    // Enter key to submit
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                login();
            }
        });
    }
}

// === LOGIN FUNCTION ===
async function login() {
    const rollNumber = document.getElementById('rollNumber').value.trim();
    const password = document.getElementById('password').value;
    const button = document.getElementById('loginBtn');
    
    // Validation
    if (!Validator.isRequired(rollNumber)) {
        showError('Please enter your roll number');
        return;
    }
    
    if (!Validator.isRequired(password)) {
        showError('Please enter your password');
        return;
    }
    
    // Show loading
    UI.showLoading(button);
    
    try {
        const student = await WalletService.login(rollNumber, password);
        
        // Save to localStorage
        Auth.login(rollNumber);
        
        // Show success
        showSuccess('Login successful! Redirecting...');
        
        // Redirect to home
        setTimeout(() => {
            window.location.href = '/home';
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showError('Invalid credentials! Please check your roll number and password.');
        UI.showLoading(button, false);
    }
}

// === SHOW ERROR ===
function showError(message) {
    const alertDiv = document.getElementById('alertMessage');
    if (alertDiv) {
        alertDiv.innerHTML = `
            <div class="alert alert-error">
                <span>❌</span>
                <span>${message}</span>
            </div>
        `;
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            alertDiv.innerHTML = '';
        }, 5000);
    }
}

// === SHOW SUCCESS ===
function showSuccess(message) {
    const alertDiv = document.getElementById('alertMessage');
    if (alertDiv) {
        alertDiv.innerHTML = `
            <div class="alert alert-success">
                <span>✅</span>
                <span>${message}</span>
            </div>
        `;
    }
}

// === EXPORT ===
window.login = login;