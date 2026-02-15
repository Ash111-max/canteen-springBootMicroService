/* ========================================
   ADMIN DASHBOARD JAVASCRIPT
   ======================================== */

const API_URL = "http://localhost:8081/menu";

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    // Check admin auth
    if (localStorage.getItem("adminUser") !== "true") {
        window.location.href = "/admin-login";
        return;
    }
    
    loadMenu();
});

// === LOAD MENU ===
async function loadMenu() {
    const grid = document.getElementById('menuGrid');
    
    // Show loading
    grid.innerHTML = Array(6).fill(0).map(() => `
        <div class="admin-menu-card skeleton">
            <div class="skeleton-image"></div>
            <div class="admin-card-content">
                <div class="skeleton-text"></div>
                <div class="skeleton-text short"></div>
            </div>
        </div>
    `).join('');
    
    try {
        const response = await fetch(API_URL);
        const items = await response.json();
        
        grid.innerHTML = items.map(createMenuCard).join('');
        
    } catch (error) {
        console.error('Failed to load menu:', error);
        UI.showToast('Failed to load menu items', 'error');
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <div style="font-size: 3rem; margin-bottom: 16px;">⚠️</div>
                <div style="color: var(--gray-600); margin-bottom: 20px;">Failed to load menu</div>
                <button class="btn btn-primary" onclick="loadMenu()">Retry</button>
            </div>
        `;
    }
}

// === CREATE MENU CARD ===
function createMenuCard(item) {
    const isAvailable = item.quantity > 0;
    
    return `
        <div class="admin-menu-card" onclick='editItem(${JSON.stringify(item)})'>
            <div class="admin-card-image" style="background-image: url('${item.imageUrl}')">
                <span class="admin-status-badge ${isAvailable ? 'badge-veg' : 'badge-non-veg'}">
                    ${isAvailable ? '✓ In Stock' : '✗ Sold Out'}
                </span>
                <span class="admin-type-badge badge-${item.type === 'Veg' ? 'veg' : 'non-veg'}">
                    ${item.type === 'Veg' ? '🟢' : '🔴'} ${item.type}
                </span>
            </div>
            
            <div class="admin-card-content">
                <div class="admin-card-title">${item.name}</div>
                <div class="admin-card-meta">
                    <span class="admin-price">₹${item.price}</span>
                    <span class="admin-stock">📦 ${item.quantity} left</span>
                </div>
            </div>
        </div>
    `;
}

// === EDIT ITEM ===
function editItem(item) {
    document.getElementById('formTitle').textContent = `✏️ Edit: ${item.name}`;
    document.getElementById('itemId').value = item.id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('category').value = item.category;
    document.getElementById('type').value = item.type;
    document.getElementById('price').value = item.price;
    document.getElementById('quantity').value = item.quantity;
    document.getElementById('imageUrl').value = item.imageUrl;
    
    // Scroll to form
    document.querySelector('.admin-form-section').scrollIntoView({ behavior: 'smooth' });
}

// === SAVE ITEM ===
async function saveItem() {
    const id = document.getElementById('itemId').value;
    const name = document.getElementById('itemName').value.trim();
    const category = document.getElementById('category').value;
    const type = document.getElementById('type').value;
    const price = parseFloat(document.getElementById('price').value);
    const quantity = parseInt(document.getElementById('quantity').value);
    const imageUrl = document.getElementById('imageUrl').value.trim();
    
    // Validation
    if (!name) {
        UI.showToast('Please enter item name', 'error');
        return;
    }
    
    if (!price || price <= 0) {
        UI.showToast('Please enter valid price', 'error');
        return;
    }
    
    if (quantity < 0) {
        UI.showToast('Quantity cannot be negative', 'error');
        return;
    }
    
    const data = {
        id: id || null,
        name,
        category,
        type,
        price,
        quantity,
        isAvailable: quantity > 0,
        imageUrl: imageUrl || 'https://placehold.co/600x400/FC8019/ffffff?text=' + encodeURIComponent(name)
    };
    
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        UI.showToast(id ? 'Item updated successfully!' : 'Item added successfully!', 'success');
        resetForm();
        loadMenu();
        
    } catch (error) {
        console.error('Save error:', error);
        UI.showToast('Failed to save item', 'error');
    }
}

// === RESET FORM ===
function resetForm() {
    document.getElementById('itemId').value = '';
    document.getElementById('itemName').value = '';
    document.getElementById('price').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('imageUrl').value = '';
    document.getElementById('formTitle').textContent = '➕ Add Menu Item';
}

// === RECHARGE WALLET ===
async function rechargeWallet() {
    const rollNumber = document.getElementById('rechargeRoll').value.trim();
    const amount = parseFloat(document.getElementById('rechargeAmount').value);
    
    if (!rollNumber) {
        UI.showToast('Please enter roll number', 'error');
        return;
    }
    
    if (!amount || amount <= 0) {
        UI.showToast('Please enter valid amount', 'error');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8082/wallet/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rollNumber, amount })
        });
        
        if (response.ok) {
            UI.showToast(`Wallet recharged! Added ₹${amount} to Roll No: ${rollNumber}`, 'success');
            document.getElementById('rechargeRoll').value = '';
            document.getElementById('rechargeAmount').value = '';
        } else {
            throw new Error('Student not found');
        }
        
    } catch (error) {
        console.error('Recharge error:', error);
        UI.showToast('Failed to recharge. Student not found!', 'error');
    }
}

// === ADMIN LOGOUT ===
function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminUser');
        window.location.href = '/admin-login';
    }
}

// === EXPORT FUNCTIONS ===
window.editItem = editItem;
window.saveItem = saveItem;
window.resetForm = resetForm;
window.rechargeWallet = rechargeWallet;
window.adminLogout = adminLogout;