/* ========================================
   HISTORY PAGE JAVASCRIPT
   Enhanced with detailed order information
   ======================================== */

let orders = [];
let menuItems = {};

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', async () => {
    Auth.requireAuth();
    
    // Load menu items first (for item names)
    await loadMenuItems();
    
    // Then load orders
    await loadOrders();
});

// === LOAD MENU ITEMS ===
async function loadMenuItems() {
    try {
        const items = await MenuService.getAllItems();
        
        // Create lookup map
        items.forEach(item => {
            menuItems[item.id] = {
                name: item.name,
                category: item.category,
                type: item.type,
                imageUrl: item.imageUrl
            };
        });
        
        console.log('Menu items loaded:', Object.keys(menuItems).length);
    } catch (error) {
        console.error('Failed to load menu items:', error);
    }
}

// === LOAD ORDERS ===
async function loadOrders() {
    const rollNumber = Auth.getRollNumber();
    const container = document.getElementById('ordersContainer');
    
    // Show loading
    container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 4rem; margin-bottom: 20px;">⏳</div>
            <div style="font-size: 1.2rem; color: var(--gray-600);">Loading your orders...</div>
        </div>
    `;
    
    try {
        const response = await fetch(`http://localhost:8083/order/history?rollNumber=${rollNumber}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        
        orders = await response.json();
        
        // Sort by date (newest first)
        orders.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
        
        // Enhance orders with menu item details
        orders = orders.map(order => ({
            ...order,
            itemDetails: menuItems[order.itemId] || {
                name: order.itemName || `Item #${order.itemId}`,
                category: 'Unknown',
                type: 'Unknown',
                imageUrl: null
            }
        }));
        
        renderOrders();
        updateStatistics();
        
    } catch (error) {
        console.error('Failed to load orders:', error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <h3 class="empty-title">Failed to Load Orders</h3>
                <p class="empty-message">Please check if all services are running.</p>
                <button class="btn btn-primary" onclick="loadOrders()">Retry</button>
            </div>
        `;
    }
}

// === RENDER ORDERS ===
function renderOrders() {
    const container = document.getElementById('ordersContainer');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🛒</div>
                <h3 class="empty-title">No Orders Yet</h3>
                <p class="empty-message">
                    Looks like you haven't ordered anything yet.<br>
                    Time to treat yourself to some delicious food!
                </p>
                <a href="/home" class="btn btn-primary btn-lg">🍔 Browse Menu</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="order-timeline">
            ${orders.map(createOrderCard).join('')}
        </div>
    `;
}

// === CREATE ORDER CARD ===
function createOrderCard(order) {
    const item = order.itemDetails;
    const date = new Date(order.orderTime);
    
    return `
        <div class="order-card">
            <div class="order-header">
                <div class="order-info">
                    <h3 class="order-title">${item.name}</h3>
                    <div class="order-id">Order #${order.id}</div>
                    
                    <div class="order-badge-group">
                        ${item.type === 'Veg' 
                            ? '<span class="badge badge-veg">🟢 Veg</span>'
                            : '<span class="badge badge-non-veg">🔴 Non-Veg</span>'
                        }
                        ${item.category 
                            ? `<span class="badge" style="background: var(--gray-100); color: var(--gray-700);">${item.category}</span>`
                            : ''
                        }
                    </div>
                </div>
                
                <div class="order-price-section">
                    <div class="order-price">${UI.formatPrice(order.amount)}</div>
                    <span class="order-status status-${order.status.toLowerCase()}">
                        ${order.status}
                    </span>
                </div>
            </div>
            
            <div class="order-details">
                <div class="detail-row">
                    <span class="detail-label">Item Name</span>
                    <span class="detail-value">${item.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Category</span>
                    <span class="detail-value">${item.category}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Type</span>
                    <span class="detail-value">${item.type}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Price</span>
                    <span class="detail-value">${UI.formatPrice(order.amount)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status</span>
                    <span class="detail-value" style="color: var(--success);">${order.status}</span>
                </div>
            </div>
            
            <div class="order-footer">
                <div class="order-time">
                    <div class="time-item">
                        📅 ${UI.formatDate(order.orderTime)}
                    </div>
                    <div class="time-item">
                        🕐 ${UI.formatTime(order.orderTime)}
                    </div>
                </div>
                
                <div class="order-actions">
                    <button class="btn btn-sm btn-outline" onclick="reorderItem(${order.itemId})">
                        🔄 Reorder
                    </button>
                </div>
            </div>
        </div>
    `;
}

// === UPDATE STATISTICS ===
function updateStatistics() {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0);
    const confirmedOrders = orders.filter(o => o.status === 'CONFIRMED').length;
    
    // Update UI
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalSpent').textContent = UI.formatPrice(totalSpent);
    document.getElementById('confirmedOrders').textContent = confirmedOrders;
}

// === REORDER ITEM ===
function reorderItem(itemId) {
    if (confirm('Do you want to order this item again?')) {
        const rollNumber = Auth.getRollNumber();
        window.location.href = `/order-ui/place?rollNumber=${rollNumber}&itemId=${itemId}`;
    }
}

// === FILTER ORDERS ===
function filterOrders(filter) {
    // Update active filter
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter logic (can be expanded)
    // For now, just a placeholder
    console.log('Filter:', filter);
}

// === NAVIGATION ===
function goToHome() {
    window.location.href = '/home';
}

function goToWallet() {
    window.location.href = '/wallet';
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        Auth.logout();
    }
}

// === EXPORT FUNCTIONS ===
window.reorderItem = reorderItem;
window.filterOrders = filterOrders;
window.goToHome = goToHome;
window.goToWallet = goToWallet;
window.logout = logout;