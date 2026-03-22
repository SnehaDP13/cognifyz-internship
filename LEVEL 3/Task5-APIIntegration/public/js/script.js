// ========== STATE MANAGEMENT ==========
let products = [];
let categories = [
    { id: 1, name: "Appetizer", color: "#2e7d32" },
    { id: 2, name: "Main Course", color: "#000000" },
    { id: 3, name: "Seafood", color: "#c62828" },
    { id: 4, name: "Dessert", color: "#d4af37" },
    { id: 5, name: "Beverage", color: "#0288d1" },
    { id: 6, name: "Wine", color: "#8B4513" },
    { id: 7, name: "Special", color: "#ff6b6b" }
];
let currentPage = 'products';
let deleteId = null;
let productChart = null;

// ========== API FUNCTIONS ==========
async function fetchProducts(filters = {}) {
    try {
        let url = '/api/products?';
        if (filters.category && filters.category !== 'all') url += `category=${filters.category}&`;
        if (filters.available && filters.available !== 'all') url += `available=${filters.available}&`;
        if (filters.featured === 'true') url += `featured=true&`;
        if (filters.minPrice) url += `minPrice=${filters.minPrice}&`;
        if (filters.maxPrice) url += `maxPrice=${filters.maxPrice}&`;
        if (filters.minRating) url += `minRating=${filters.minRating}&`;
        if (filters.popularity && filters.popularity !== 'all') url += `popularity=${filters.popularity}&`;
        
        const response = await fetch(url);
        products = await response.json();
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

async function createProduct(product) {
    const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    });
    return await response.json();
}

async function updateProduct(id, product) {
    const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    });
    return await response.json();
}

async function toggleAvailability(id) {
    const response = await fetch(`/api/products/${id}/toggle`, {
        method: 'PATCH'
    });
    return await response.json();
}

async function deleteProduct(id) {
    const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
    });
    return await response.json();
}

async function fetchStats() {
    const response = await fetch('/api/stats');
    return await response.json();
}

// ========== UI FUNCTIONS ==========
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
    if (halfStar) stars += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
    
    return stars;
}

function getPopularityBadge(popularity) {
    const badges = {
        'low': '<span class="badge bg-secondary">Low Popularity</span>',
        'medium': '<span class="badge bg-info">Medium Popularity</span>',
        'high': '<span class="badge bg-warning">High Popularity</span>',
        'very-high': '<span class="badge bg-success">Very High Popularity</span>'
    };
    return badges[popularity] || badges['medium'];
}

// ========== PAGE RENDERING ==========
async function renderPage(page) {
    currentPage = page;
    const contentDiv = document.getElementById('pageContent');
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });
    
    switch(page) {
        case 'products':
            await renderProductsPage();
            break;
        case 'inventory':
            await renderInventoryPage();
            break;
        case 'analytics':
            await renderAnalyticsPage();
            break;
        case 'categories':
            await renderCategoriesPage();
            break;
    }
}

async function renderProductsPage() {
    const contentDiv = document.getElementById('pageContent');
    
    contentDiv.innerHTML = `
        <div class="filter-section">
            <div class="row g-3">
                <div class="col-md-2">
                    <label class="form-label"><i class="fas fa-tag"></i> Category</label>
                    <select id="categoryFilter" class="filter-select">
                        <option value="all">All Categories</option>
                        ${categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('')}
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label"><i class="fas fa-check-circle"></i> Availability</label>
                    <select id="availabilityFilter" class="filter-select">
                        <option value="all">All Items</option>
                        <option value="true">Available Only</option>
                        <option value="false">Unavailable Only</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label"><i class="fas fa-fire"></i> Popularity</label>
                    <select id="popularityFilter" class="filter-select">
                        <option value="all">All</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="very-high">Very High</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label"><i class="fas fa-dollar-sign"></i> Min Price</label>
                    <input type="number" id="minPriceFilter" class="filter-input" placeholder="Min" step="1">
                </div>
                <div class="col-md-2">
                    <label class="form-label"><i class="fas fa-dollar-sign"></i> Max Price</label>
                    <input type="number" id="maxPriceFilter" class="filter-input" placeholder="Max" step="1">
                </div>
                <div class="col-md-2">
                    <label class="form-label"><i class="fas fa-star"></i> Min Rating</label>
                    <select id="ratingFilter" class="filter-select">
                        <option value="0">Any Rating</option>
                        <option value="4">4+ Stars</option>
                        <option value="4.5">4.5+ Stars</option>
                    </select>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-3">
                    <div class="form-check">
                        <input type="checkbox" id="featuredFilter" class="form-check-input">
                        <label class="form-check-label">Featured Products Only</label>
                    </div>
                </div>
                <div class="col-md-9 text-end">
                    <button id="applyFilters" class="btn btn-primary me-2">
                        <i class="fas fa-filter"></i> Apply Filters
                    </button>
                    <button id="resetFilters" class="btn btn-outline-secondary">
                        <i class="fas fa-undo"></i> Reset
                    </button>
                </div>
            </div>
        </div>
        <div id="productsGrid" class="row g-4">
            <div class="text-center py-5">
                <div class="luxury-spinner"><i class="fas fa-store"></i></div>
                <p>Loading products...</p>
            </div>
        </div>
    `;
    
    await loadProducts();
    
    document.getElementById('applyFilters').addEventListener('click', () => loadProducts());
    document.getElementById('resetFilters').addEventListener('click', () => {
        document.getElementById('categoryFilter').value = 'all';
        document.getElementById('availabilityFilter').value = 'all';
        document.getElementById('popularityFilter').value = 'all';
        document.getElementById('minPriceFilter').value = '';
        document.getElementById('maxPriceFilter').value = '';
        document.getElementById('ratingFilter').value = '0';
        document.getElementById('featuredFilter').checked = false;
        loadProducts();
    });
}

async function loadProducts() {
    const category = document.getElementById('categoryFilter')?.value || 'all';
    const available = document.getElementById('availabilityFilter')?.value;
    const popularity = document.getElementById('popularityFilter')?.value;
    const minPrice = document.getElementById('minPriceFilter')?.value;
    const maxPrice = document.getElementById('maxPriceFilter')?.value;
    const minRating = document.getElementById('ratingFilter')?.value;
    const featured = document.getElementById('featuredFilter')?.checked;
    
    const filters = { category, available, popularity, minPrice, maxPrice, minRating, featured };
    const items = await fetchProducts(filters);
    
    const grid = document.getElementById('productsGrid');
    
    if (items.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-box-open fa-4x text-muted mb-4"></i>
                <h3 class="text-primary">No Products Found</h3>
                <p class="text-muted">Try adjusting your filters or add new products</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = items.map(item => `
        <div class="col-md-6 col-lg-4">
            <div class="product-card">
                <div class="product-card-image">
                    <img src="${item.image}" alt="${item.name}">
                    ${item.featured ? '<span class="featured-badge"><i class="fas fa-crown"></i> Featured</span>' : ''}
                    <span class="availability-badge ${item.available ? 'available' : 'unavailable'}">
                        ${item.available ? 'In Stock' : 'Out of Stock'}
                    </span>
                    ${item.discount > 0 ? `<span class="discount-badge">-${item.discount}% OFF</span>` : ''}
                </div>
                <div class="product-card-content">
                    <h3 class="product-card-title">${escapeHtml(item.name)}</h3>
                    <span class="product-card-category"><i class="fas fa-tag"></i> ${item.category}</span>
                    <div class="product-card-rating">
                        ${renderStars(item.rating)}
                        <span class="text-muted ms-2">(${item.rating})</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <div>
                            ${item.discount > 0 ? 
                                `<span class="product-card-price"><del>$${item.originalPrice || item.price}</del> $${(item.price * (1 - item.discount/100)).toFixed(2)}</span>` :
                                `<span class="product-card-price">$${item.price}</span>`
                            }
                        </div>
                        <span class="product-card-stock ${item.stock < 20 ? 'stock-low' : ''}">
                            <i class="fas fa-boxes"></i> ${item.stock} left
                        </span>
                    </div>
                    <div class="mt-2">
                        ${getPopularityBadge(item.popularity)}
                    </div>
                    <p class="text-muted small mt-2">${item.description || 'No description available'}</p>
                </div>
            </div>
        </div>
    `).join('');
}

async function renderInventoryPage() {
    const contentDiv = document.getElementById('pageContent');
    const items = await fetchProducts();
    
    contentDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="fas fa-clipboard-list text-success"></i> Inventory Management</h2>
            <button class="btn btn-primary" onclick="openAddModal()">
                <i class="fas fa-plus"></i> Add New Product
            </button>
        </div>
        <div class="admin-table table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Discount</th>
                        <th>Stock</th>
                        <th>Rating</th>
                        <th>Status</th>
                        <th>Popularity</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="inventoryTableBody">
                    ${items.map(item => `
                        <tr>
                            <td><img src="${item.image}" alt="${item.name}"></td>
                            <td><strong>${escapeHtml(item.name)}</strong>${item.featured ? ' <span class="badge bg-warning">Featured</span>' : ''}</td>
                            <td>${item.category}</td>
                            <td>$${item.price}</td>
                            <td>${item.discount > 0 ? `${item.discount}%` : '-'}</td>
                            <td class="${item.stock < 20 ? 'text-danger fw-bold' : ''}">${item.stock}</td>
                            <td>${item.rating} ★</td>
                            <td>
                                <button class="btn btn-sm ${item.available ? 'btn-success' : 'btn-secondary'}" 
                                        onclick="toggleItemStatus(${item.id})">
                                    ${item.available ? 'Available' : 'Unavailable'}
                                </button>
                            </td>
                            <td>${getPopularityBadge(item.popularity)}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary me-2" onclick="openEditModal(${item.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="openDeleteModal(${item.id}, '${escapeHtml(item.name)}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function renderAnalyticsPage() {
    const contentDiv = document.getElementById('pageContent');
    const stats = await fetchStats();
    const items = await fetchProducts();
    
    contentDiv.innerHTML = `
        <div class="row g-4 mb-4">
            <div class="col-md-3">
                <div class="stat-card">
                    <i class="fas fa-box"></i>
                    <h2>${stats.totalProducts}</h2>
                    <p>Total Products</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <i class="fas fa-check-circle"></i>
                    <h2>${stats.availableProducts}</h2>
                    <p>Available Products</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <i class="fas fa-dollar-sign"></i>
                    <h2>$${stats.averagePrice.toFixed(2)}</h2>
                    <p>Average Price</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <i class="fas fa-tags"></i>
                    <h2>${stats.categories}</h2>
                    <p>Categories</p>
                </div>
            </div>
        </div>
        
        <div class="row g-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-transparent">
                        <h4 class="mb-0"><i class="fas fa-chart-pie text-success"></i> Products by Category</h4>
                    </div>
                    <div class="card-body">
                        <canvas id="categoryChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-transparent">
                        <h4 class="mb-0"><i class="fas fa-chart-line text-danger"></i> Price Distribution</h4>
                    </div>
                    <div class="card-body">
                        <canvas id="priceChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-transparent">
                        <h4 class="mb-0"><i class="fas fa-chart-bar text-success"></i> Low Stock Alert</h4>
                    </div>
                    <div class="card-body">
                        <div id="lowStockAlert"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load charts
    const categories = [...new Set(items.map(item => item.category))];
    const categoryCounts = categories.map(cat => items.filter(item => item.category === cat).length);
    
    new Chart(document.getElementById('categoryChart'), {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: categoryCounts,
                backgroundColor: ['#2e7d32', '#c62828', '#000000', '#d4af37', '#0288d1', '#8B4513', '#ff6b6b'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
    
    const priceRanges = {
        '0-20': items.filter(i => i.price < 20).length,
        '20-50': items.filter(i => i.price >= 20 && i.price < 50).length,
        '50-100': items.filter(i => i.price >= 50 && i.price < 100).length,
        '100+': items.filter(i => i.price >= 100).length
    };
    
    new Chart(document.getElementById('priceChart'), {
        type: 'bar',
        data: {
            labels: ['Under $20', '$20-$50', '$50-$100', 'Over $100'],
            datasets: [{
                label: 'Number of Products',
                data: Object.values(priceRanges),
                backgroundColor: '#2e7d32',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
    
    const lowStockItems = items.filter(i => i.stock < 20);
    const lowStockDiv = document.getElementById('lowStockAlert');
    if (lowStockItems.length > 0) {
        lowStockDiv.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i> <strong>${lowStockItems.length} products</strong> have low stock (less than 20 units):
                <ul class="mt-2 mb-0">
                    ${lowStockItems.map(item => `<li><strong>${escapeHtml(item.name)}</strong> - Only ${item.stock} left</li>`).join('')}
                </ul>
            </div>
        `;
    } else {
        lowStockDiv.innerHTML = '<div class="alert alert-success"><i class="fas fa-check-circle"></i> All products have sufficient stock!</div>';
    }
}

async function renderCategoriesPage() {
    const contentDiv = document.getElementById('pageContent');
    
    contentDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="fas fa-tags text-success"></i> Category Management</h2>
            <button class="btn btn-primary" onclick="openCategoryModal()">
                <i class="fas fa-plus"></i> Add New Category
            </button>
        </div>
        <div class="row g-4" id="categoriesGrid">
            ${categories.map(cat => `
                <div class="col-md-4">
                    <div class="card text-center" style="border-top: 3px solid ${cat.color};">
                        <div class="card-body">
                            <i class="fas fa-tag fa-3x mb-3" style="color: ${cat.color};"></i>
                            <h4>${cat.name}</h4>
                            <p class="text-muted">${products.filter(p => p.category === cat.name).length} products</p>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ========== MODAL FUNCTIONS ==========
function openAddModal() {
    document.getElementById('productModalTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productAvailable').checked = true;
    document.getElementById('productFeatured').checked = false;
    document.getElementById('productStock').value = 50;
    document.getElementById('productDiscount').value = 0;
    
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

function openEditModal(id) {
    const item = products.find(i => i.id === id);
    if (!item) return;
    
    document.getElementById('productModalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Product';
    document.getElementById('productId').value = item.id;
    document.getElementById('productName').value = item.name;
    document.getElementById('productCategory').value = item.category;
    document.getElementById('productPrice').value = item.price;
    document.getElementById('productRating').value = item.rating;
    document.getElementById('productDescription').value = item.description || '';
    document.getElementById('productImage').value = item.image || '';
    document.getElementById('productAvailable').checked = item.available;
    document.getElementById('productFeatured').checked = item.featured || false;
    document.getElementById('productStock').value = item.stock || 50;
    document.getElementById('productDiscount').value = item.discount || 0;
    document.getElementById('productPopularity').value = item.popularity || 'medium';
    
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

function openDeleteModal(id, name) {
    deleteId = id;
    document.getElementById('deleteItemName').textContent = name;
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}

function openCategoryModal() {
    const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    modal.show();
}

async function toggleItemStatus(id) {
    const result = await toggleAvailability(id);
    if (result) {
        showToast(`Product status updated to ${result.available ? 'Available' : 'Unavailable'}`, 'success');
        await renderInventoryPage();
    }
}

// ========== FORM SUBMISSION ==========
document.addEventListener('DOMContentLoaded', () => {
    renderPage('products');
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            renderPage(page);
        });
    });
    
    // Product form submission
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const id = document.getElementById('productId').value;
            const itemData = {
                name: document.getElementById('productName').value,
                category: document.getElementById('productCategory').value,
                price: parseFloat(document.getElementById('productPrice').value),
                rating: parseFloat(document.getElementById('productRating').value) || 0,
                description: document.getElementById('productDescription').value,
                image: document.getElementById('productImage').value,
                available: document.getElementById('productAvailable').checked,
                featured: document.getElementById('productFeatured').checked,
                stock: parseInt(document.getElementById('productStock').value) || 0,
                discount: parseInt(document.getElementById('productDiscount').value) || 0,
                popularity: document.getElementById('productPopularity').value
            };
            
            let result;
            if (id) {
                result = await updateProduct(id, itemData);
                showToast('Product updated successfully!', 'success');
            } else {
                result = await createProduct(itemData);
                showToast('New product added successfully!', 'success');
            }
            
            bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
            await renderInventoryPage();
        });
    }
    
    // Category form submission
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newCategory = {
                name: document.getElementById('categoryName').value,
                color: document.getElementById('categoryColor').value
            };
            categories.push({ id: categories.length + 1, ...newCategory });
            showToast('Category added successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
            document.getElementById('categoryForm').reset();
            await renderCategoriesPage();
        });
    }
    
    // Delete confirmation
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', async () => {
        if (deleteId) {
            await deleteProduct(deleteId);
            showToast('Product deleted successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
            await renderInventoryPage();
        }
    });
});

// Make functions global
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
window.toggleItemStatus = toggleItemStatus;
window.openCategoryModal = openCategoryModal;