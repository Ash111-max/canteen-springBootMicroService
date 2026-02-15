/* ========================================
   COMMON JAVASCRIPT UTILITIES
   Shared functions across all pages
   ======================================== */

// === API BASE URLS ===
const API = {
    MENU: 'http://localhost:8081/menu',
    WALLET: 'http://localhost:8082/wallet',
    ORDER: 'http://localhost:8083/order',
    NOTIFICATION: 'http://localhost:8084/notify'
};

// === AUTHENTICATION ===
const Auth = {
    // Check if user is logged in
    isLoggedIn() {
        return localStorage.getItem('savedRoll') !== null;
    },
    
    // Get current user's roll number
    getRollNumber() {
        return localStorage.getItem('savedRoll');
    },
    
    // Save user session
    login(rollNumber) {
        localStorage.setItem('savedRoll', rollNumber);
    },
    
    // Clear user session
    logout() {
        localStorage.removeItem('savedRoll');
        window.location.href = '/';
    },
    
    // Protect page (redirect if not logged in)
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = '/login';
        }
    }
};

// === WALLET SERVICE ===
const WalletService = {
    // Get wallet details
    async getWallet(rollNumber) {
        try {
            const response = await fetch(`${API.WALLET}/${rollNumber}`);
            if (!response.ok) throw new Error('Wallet not found');
            return await response.json();
        } catch (error) {
            console.error('Error fetching wallet:', error);
            throw error;
        }
    },
    
    // Register new student
    async register(studentName, rollNumber, password) {
        try {
            const response = await fetch(`${API.WALLET}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentName, rollNumber, password })
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },
    
    // Login
    async login(rollNumber, password) {
        try {
            const response = await fetch(`${API.WALLET}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rollNumber, password })
            });
            
            if (!response.ok) throw new Error('Invalid credentials');
            return await response.json();
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
};

// === MENU SERVICE ===
const MenuService = {
    // Get all menu items
    async getAllItems() {
        try {
            const response = await fetch(API.MENU);
            if (!response.ok) throw new Error('Failed to fetch menu');
            return await response.json();
        } catch (error) {
            console.error('Error fetching menu:', error);
            throw error;
        }
    },
    
    // Get single item
    async getItem(itemId) {
        try {
            const response = await fetch(`${API.MENU}/${itemId}`);
            if (!response.ok) throw new Error('Item not found');
            return await response.json();
        } catch (error) {
            console.error('Error fetching item:', error);
            throw error;
        }
    }
};

// === UI UTILITIES ===
const UI = {
    // Show toast notification
    showToast(message, type = 'success') {
        // Remove existing toasts
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div style="font-size: 1.5rem;">
                ${type === 'success' ? '✅' : '❌'}
            </div>
            <div>
                <div style="font-weight: 600; margin-bottom: 4px;">
                    ${type === 'success' ? 'Success' : 'Error'}
                </div>
                <div style="color: var(--gray-600); font-size: 0.9rem;">
                    ${message}
                </div>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    // Show loading state
    showLoading(element, show = true) {
        if (show) {
            element.disabled = true;
            element.dataset.originalText = element.textContent;
            element.innerHTML = '<span>⏳ Loading...</span>';
        } else {
            element.disabled = false;
            element.textContent = element.dataset.originalText;
        }
    },
    
    // Format price
    formatPrice(price) {
        return `₹${parseFloat(price).toFixed(2)}`;
    },
    
    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    },
    
    // Format time
    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};

// === VALIDATORS ===
const Validator = {
    // Validate email
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },
    
    // Validate password strength
    checkPasswordStrength(password) {
        if (password.length === 0) return null;
        if (password.length < 6) return 'weak';
        if (password.length < 10) return 'medium';
        return 'strong';
    },
    
    // Validate roll number (alphanumeric)
    isValidRollNumber(roll) {
        return roll && roll.trim().length > 0;
    },
    
    // Validate required field
    isRequired(value) {
        return value && value.trim().length > 0;
    }
};

// === LOCAL STORAGE UTILITIES ===
const Storage = {
    // Set item
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Storage error:', error);
        }
    },
    
    // Get item
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Storage error:', error);
            return null;
        }
    },
    
    // Remove item
    remove(key) {
        localStorage.removeItem(key);
    },
    
    // Clear all
    clear() {
        localStorage.clear();
    }
};

// === DEBOUNCE UTILITY ===
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// === INITIALIZE ===
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

// === EXPORT FOR USE IN OTHER FILES ===
window.Auth = Auth;
window.WalletService = WalletService;
window.MenuService = MenuService;
window.UI = UI;
window.Validator = Validator;
window.Storage = Storage;
window.debounce = debounce;