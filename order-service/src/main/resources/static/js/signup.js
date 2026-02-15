/* ========================================
   SIGNUP PAGE JAVASCRIPT
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

// === SETUP EVENT LISTENERS ===
function setupEventListeners() {
    // Password strength indicator
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                signup();
            }
        });
    }
}

// === CHECK PASSWORD STRENGTH ===
function checkPasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthBar = document.getElementById('strengthBar');
    const strengthLabel = document.getElementById('strengthLabel');
    
    if (!strengthBar) return;
    
    const strength = Validator.checkPasswordStrength(password);
    
    // Reset classes
    strengthBar.className = 'password-strength-bar';
    
    if (!strength) {
        strengthBar.style.width = '0%';
        if (strengthLabel) strengthLabel.textContent = '';
        return;
    }
    
    // Apply strength class
    strengthBar.classList.add(`strength-${strength}`);
    
    // Update label
    if (strengthLabel) {
        const labels = {
            weak: '😟 Weak',
            medium: '😐 Medium',
            strong: '😊 Strong'
        };
        const colors = {
            weak: 'var(--error)',
            medium: 'var(--warning)',
            strong: 'var(--success)'
        };
        
        strengthLabel.textContent = labels[strength];
        strengthLabel.style.color = colors[strength];
    }
}

// === SIGNUP FUNCTION ===
async function signup() {
    const studentName = document.getElementById('studentName').value.trim();
    const rollNumber = document.getElementById('rollNumber').value.trim();
    const password = document.getElementById('password').value;
    const button = document.getElementById('signupBtn');
    
    // Validation
    if (!Validator.isRequired(studentName)) {
        showError('Please enter your full name');
        return;
    }
    
    if (!Validator.isRequired(rollNumber)) {
        showError('Please enter your roll number');
        return;
    }
    
    if (!Validator.isRequired(password)) {
        showError('Please enter a password');
        return;
    }
    
    if (password.length < 4) {
        showError('Password must be at least 4 characters long');
        return;
    }
    
    // Show loading
    UI.showLoading(button);
    
    try {
        await WalletService.register(studentName, rollNumber, password);
        
        // Show success
        showSuccess('Registration Successful! You received ₹500 welcome bonus. Redirecting to login...');
        
        // Redirect to login
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        
    } catch (error) {
        console.error('Signup error:', error);
        
        let errorMessage = 'Registration failed. Please try again.';
        if (error.message.includes('already')) {
            errorMessage = 'Roll number already registered! Please login instead.';
        }
        
        showError(errorMessage);
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
window.signup = signup;