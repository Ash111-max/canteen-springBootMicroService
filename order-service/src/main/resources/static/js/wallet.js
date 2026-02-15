/* ========================================
   WALLET PAGE JAVASCRIPT
   ======================================== */

let transactions = [];
let currentFilter = 'all';

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', async () => {
    Auth.requireAuth();
    await loadWalletData();
    await loadTransactions();
});

// === LOAD WALLET DATA ===
async function loadWalletData() {
    const rollNumber = Auth.getRollNumber();
    
    try {
        const wallet = await WalletService.getWallet(rollNumber);
        
        // Update UI
        document.getElementById('walletBalance').textContent = UI.formatPrice(wallet.balance);
        document.getElementById('studentName').textContent = wallet.studentName;
        document.getElementById('studentRoll').textContent = `Roll No: ${rollNumber}`;
        
    } catch (error) {
        console.error('Failed to load wallet:', error);
        UI.showToast('Failed to load wallet information', 'error');
    }
}

// === LOAD TRANSACTIONS ===
async function loadTransactions() {
    const rollNumber = Auth.getRollNumber();
    const listContainer = document.getElementById('transactionList');
    
    // Show loading
    listContainer.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div style="font-size: 3rem; margin-bottom: 16px;">⏳</div>
            <div style="color: var(--gray-600);">Loading transactions...</div>
        </div>
    `;
    
    try {
        // Fetch order history
        const response = await fetch(`http://localhost:8083/order/history?rollNumber=${rollNumber}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }
        
        const orders = await response.json();
        
        // Fetch menu items to get names
        const menuItems = await MenuService.getAllItems();
        const menuMap = {};
        menuItems.forEach(item => {
            menuMap[item.id] = item.name;
        });
        
        // Transform orders to transactions
        transactions = orders.map(order => ({
            id: order.id,
            type: 'debit',
            name: order.itemName || menuMap[order.itemId] || `Item #${order.itemId}`,
            amount: order.amount,
            date: order.orderTime,
            status: order.status,
            itemId: order.itemId
        }));
        
        // Sort by date (newest first)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        renderTransactions();
        
    } catch (error) {
        console.error('Failed to load transactions:', error);
        listContainer.innerHTML = `
            <div class="transaction-empty">
                <div class="empty-icon">⚠️</div>
                <h3 class="empty-title">Failed to Load Transactions</h3>
                <p class="empty-message">Please try again later</p>
                <button class="btn btn-primary" onclick="loadTransactions()">Retry</button>
            </div>
        `;
    }
}

// === RENDER TRANSACTIONS ===
function renderTransactions() {
    const listContainer = document.getElementById('transactionList');
    
    // Filter transactions
    let filteredTransactions = transactions;
    if (currentFilter !== 'all') {
        filteredTransactions = transactions.filter(t => t.type === currentFilter);
    }
    
    if (filteredTransactions.length === 0) {
        listContainer.innerHTML = `
            <div class="transaction-empty">
                <div class="empty-icon">🛒</div>
                <h3 class="empty-title">No Transactions Yet</h3>
                <p class="empty-message">Start ordering delicious food from the menu!</p>
                <a href="/home" class="btn btn-primary">Browse Menu</a>
            </div>
        `;
        return;
    }
    
    listContainer.innerHTML = filteredTransactions.map(createTransactionItem).join('');
    
    // Update stats
    updateStats();
}

// === CREATE TRANSACTION ITEM ===
function createTransactionItem(transaction) {
    const isDebit = transaction.type === 'debit';
    
    return `
        <div class="transaction-item">
            <div class="transaction-icon ${transaction.type}">
                ${isDebit ? '🍔' : '💰'}
            </div>
            
            <div class="transaction-details">
                <div class="transaction-name">${transaction.name}</div>
                <div class="transaction-meta">
                    <span>📅 ${UI.formatDate(transaction.date)}</span>
                    <span>🕐 ${UI.formatTime(transaction.date)}</span>
                    ${transaction.itemId ? `<span>ID: #${transaction.id}</span>` : ''}
                </div>
            </div>
            
            <div class="transaction-amount">
                <div class="amount-value ${transaction.type}">
                    ${isDebit ? '-' : '+'} ${UI.formatPrice(transaction.amount)}
                </div>
                <span class="transaction-status status-success">
                    ${transaction.status}
                </span>
            </div>
        </div>
    `;
}

// === UPDATE STATISTICS ===
function updateStats() {
    const totalOrders = transactions.length;
    const totalSpent = transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Update UI if stats elements exist
    const ordersElement = document.getElementById('totalOrders');
    const spentElement = document.getElementById('totalSpent');
    
    if (ordersElement) ordersElement.textContent = totalOrders;
    if (spentElement) spentElement.textContent = UI.formatPrice(totalSpent);
}

// === FILTER TRANSACTIONS ===
function filterTransactions(type) {
    currentFilter = type;
    
    // Update active filter
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderTransactions();
}

// === REFRESH DATA ===
async function refreshWallet() {
    const button = event.target;
    UI.showLoading(button);
    
    await Promise.all([
        loadWalletData(),
        loadTransactions()
    ]);
    
    UI.showLoading(button, false);
    UI.showToast('Wallet refreshed successfully!', 'success');
}

// === NAVIGATION ===
function goToHome() {
    window.location.href = '/home';
}

function goToHistory() {
    const rollNumber = Auth.getRollNumber();
    window.location.href = `/history?rollNumber=${rollNumber}`;
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        Auth.logout();
    }
}

// === EXPORT FUNCTIONS ===
window.filterTransactions = filterTransactions;
window.refreshWallet = refreshWallet;
window.goToHome = goToHome;
window.goToHistory = goToHistory;
window.logout = logout;