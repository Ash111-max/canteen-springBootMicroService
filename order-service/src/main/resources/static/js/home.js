/* ========================================
   HOME PAGE JAVASCRIPT
   Menu browsing and ordering functionality
   ======================================== */

// === STATE ===
let menuItems = [];
let filteredItems = [];
let currentCategory = 'All';
let currentSort = 'default';

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', async () => {
    // Protect page
    Auth.requireAuth();
    
    // Load user info
    await loadUserInfo();
    
    // Load menu
    await loadMenu();
    
    // Setup event listeners
    setupEventListeners();
});

// === LOAD USER INFO ===
async function loadUserInfo() {
    const rollNumber = Auth.getRollNumber();
    const rollElement = document.getElementById('userRoll');
    const nameElement = document.getElementById('userName');
    
    if (rollElement) rollElement.textContent = rollNumber;
    
    try {
        const wallet = await WalletService.getWallet(rollNumber);
        if (nameElement) {
            nameElement.textContent = wallet.studentName;
        }
    } catch (error) {
        console.error('Failed to load user info:', error);
    }
}

// === LOAD MENU ===
async function loadMenu() {
    const grid = document.getElementById('foodGrid');
    
    // Show loading skeletons
    grid.innerHTML = Array(6).fill(0).map(() => `
        <div class="food-card skeleton">
            <div class="skeleton-image"></div>
            <div class="card-body">
                <div class="skeleton-text"></div>
                <div class="skeleton-text short"></div>
                <div class="skeleton-text"></div>
            </div>
        </div>
    `).join('');
    
    try {
        menuItems = await MenuService.getAllItems();
        filteredItems = menuItems;
        renderMenu();
    } catch (error) {
        console.error('Failed to load menu:', error);
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="empty-icon">❌</div>
                <h3 class="empty-title">Failed to Load Menu</h3>
                <p class="empty-message">Please check if Menu Service is running.</p>
                <button class="btn btn-primary" onclick="loadMenu()">Retry</button>
            </div>
        `;
    }
}

// === RENDER MENU ===
function renderMenu() {
    const grid = document.getElementById('foodGrid');
    
    if (filteredItems.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="empty-icon">🔍</div>
                <h3 class="empty-title">No Items Found</h3>
                <p class="empty-message">Try adjusting your filters.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filteredItems.map(item => createFoodCard(item)).join('');
}

// === CREATE FOOD CARD ===
function createFoodCard(item) {
    const isSoldOut = item.quantity <= 0;
    const isLowStock = item.quantity > 0 && item.quantity <= 5;
    
    return `
        <div class="food-card ${isSoldOut ? 'sold-out' : ''}" data-category="${item.category}">
            <div class="food-image-container">
                <img src="${item.imageUrl}" 
                     alt="${item.name}" 
                     class="food-image"
                     onerror="this.src='https://placehold.co/600x400/FC8019/ffffff?text=${encodeURIComponent(item.name)}'">
                
                <div class="image-badges">
                    <span class="badge badge-${item.type === 'Veg' ? 'veg' : 'non-veg'}">
                        ${item.type === 'Veg' ? '🟢' : '🔴'} ${item.type}
                    </span>
                    ${item.quantity > 50 ? '<span class="badge badge-bestseller">⭐ Bestseller</span>' : ''}
                </div>
                
                ${!isSoldOut ? `
                    <div class="stock-badge ${isLowStock ? 'low-stock' : ''}">
                        📦 ${item.quantity} left
                    </div>
                ` : ''}
                
                ${isSoldOut ? `
                    <div class="sold-out-overlay">
                        <div class="sold-out-text">SOLD OUT</div>
                    </div>
                ` : ''}
            </div>
            
            <div class="food-card-content">
                <div class="food-header">
                    <div>
                        <h3 class="food-name">${item.name}</h3>
                        <p class="food-category">${item.category}</p>
                    </div>
                </div>
                
                <div class="food-footer">
                    <div>
                        <span class="food-price">${UI.formatPrice(item.price)}</span>
                    </div>
                    ${!isSoldOut ? `
                        <button class="add-to-cart-btn" 
                                onclick="addToCart(${item.id})"
                                data-id="${item.id}">
                            ADD
                        </button>
                    ` : `
                        <button class="btn btn-secondary" disabled>
                            Unavailable
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;
}

// === ADD TO CART (PLACE ORDER) ===
async function addToCart(itemId) {
    const rollNumber = Auth.getRollNumber();
    const button = event.target;
    
    // Show loading
    UI.showLoading(button);
    
    try {
        // Redirect to order placement
        window.location.href = `/order-ui/place?rollNumber=${rollNumber}&itemId=${itemId}`;
    } catch (error) {
        console.error('Order failed:', error);
        UI.showToast('Failed to place order. Please try again.', 'error');
        UI.showLoading(button, false);
    }
}

// === FILTER BY CATEGORY ===
function filterByCategory(category) {
    currentCategory = category;
    applyFilters();
    
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
}

// === APPLY FILTERS ===
function applyFilters() {
    filteredItems = menuItems.filter(item => {
        // Category filter
        if (currentCategory !== 'All' && item.category !== currentCategory) {
            return false;
        }
        return true;
    });
    
    // Apply sorting
    applySorting();
    
    // Render
    renderMenu();
}

// === APPLY SORTING ===
function applySorting() {
    switch (currentSort) {
        case 'price-low':
            filteredItems.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredItems.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredItems.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            // Keep original order
            break;
    }
}

// === CHANGE SORT ===
function changeSort(sortType) {
    currentSort = sortType;
    applyFilters();
}

// === SEARCH ===
const searchMenu = debounce(function(query) {
    if (!query.trim()) {
        filteredItems = menuItems;
    } else {
        filteredItems = menuItems.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase())
        );
    }
    renderMenu();
}, 300);

// === SETUP EVENT LISTENERS ===
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchMenu(e.target.value);
        });
    }
    
    // Sort dropdown
    const sortDropdown = document.getElementById('sortDropdown');
    if (sortDropdown) {
        sortDropdown.addEventListener('change', (e) => {
            changeSort(e.target.value);
        });
    }
}

// === NAVIGATE TO PAGES ===
function goToWallet() {
    window.location.href = '/wallet';
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

// === MAKE FUNCTIONS GLOBALLY AVAILABLE ===
window.addToCart = addToCart;
window.filterByCategory = filterByCategory;
window.changeSort = changeSort;
window.searchMenu = searchMenu;
window.goToWallet = goToWallet;
window.goToHistory = goToHistory;
window.logout = logout;