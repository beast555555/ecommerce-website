// Core JavaScript for Jerseys Store - Cart, Search, Filter, Animations

// Cart Management with localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function getCartCount() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function updateCartUI() {
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    badge.textContent = getCartCount();
    badge.style.display = getCartCount() > 0 ? 'flex' : 'none';
  }
}

function addToCart(productId, size, quantity = 1) {
  const existingItem = cart.find(item => item.id === productId && item.size === size);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ id: productId, size, quantity });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
  
  // Visual feedback
  showNotification('Added to cart!', 'success');
}

function removeFromCart(productId, size) {
  cart = cart.filter(item => !(item.id === productId && item.size === size));
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
  renderCartItems();
  updateCartTotal();
}

function updateQuantity(productId, size, change) {
  const item = cart.find(item => item.id === productId && item.size === size);
  if (item) {
    item.quantity = Math.max(1, item.quantity + change);
    if (item.quantity === 0) {
      removeFromCart(productId, size);
    } else {
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCartItems();
      updateCartTotal();
    }
  }
}

// Product Rendering
function renderProducts(productsToRender = products, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = productsToRender.map(product => `
    <div class="product-card fade-in">
      <img src="${product.image}" alt="${product.name}" class="product-image">
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-category">${product.category.toUpperCase()}</div>
        <div class="product-price">₹${Math.round(product.price)}</div>
        <button class="btn" onclick="addToCart(${product.id}, 'M', 1)">Add to Cart</button>
        <a href="product-detail.html?id=${product.id}" class="btn" style="margin-top: 0.5rem; background: var(--neon-green);">View Details</a>
      </div>
    </div>
  `).join('');

  observeAnimations();
}

// Product Detail Page
function renderProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'));
  const product = products.find(p => p.id === productId);
  
  if (!product) return;
  
  document.getElementById('detail-name').textContent = product.name;
  document.getElementById('detail-price').textContent = `₹${Math.round(product.price)}`;
  document.getElementById('detail-image').src = product.image;
  document.getElementById('detail-desc').textContent = product.description;
  
  const sizeContainer = document.getElementById('size-selector');
  sizeContainer.innerHTML = product.sizes.map(size => 
    `<button class="size-btn" onclick="selectSize('${size}')">${size}</button>`
  ).join('');
}

let selectedSize = '';

function selectSize(size) {
  selectedSize = size;
  document.querySelectorAll('.size-btn').forEach(btn => 
    btn.classList.toggle('active', btn.textContent === size)
  );
}

function addToCartFromDetail() {
  if (!selectedSize) {
    alert('Please select a size!');
    return;
  }
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'));
  addToCart(productId, selectedSize);
}

// Cart Page
function renderCartItems() {
  const container = document.querySelector('.cart-items');
  if (!container) return;
  
  if (cart.length === 0) {
    container.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">Your cart is empty. <a href="index.html">Shop now!</a></p>';
    return;
  }
  
  container.innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    return `
      <div class="cart-item fade-in">
        <img src="${product.image}" alt="${product.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
        <div>
          <div style="font-weight: bold;">${product.name}</div>
          <div style="color: var(--neon-green);">Size: ${item.size}</div>
        <div>₹${Math.round(product.price)}</div>
        </div>
        <div class="qty-controls">
          <button onclick="updateQuantity(${item.id}, '${item.size}', -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="updateQuantity(${item.id}, '${item.size}', 1)">+</button>
        </div>
        <div>₹${Math.round(product.price * item.quantity)}</div>
        <button class="btn" style="padding: 0.5rem 1rem; font-size: 0.9rem;" onclick="removeFromCart(${item.id}, '${item.size}')">Remove</button>
      </div>
    `;
  }).join('');
}

function updateCartTotal() {
  const total = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + (product.price * item.quantity);
  }, 0);
  
  const totalEl = document.querySelector('.total-price');
  if (totalEl) totalEl.textContent = `₹${Math.round(total)}`;
}

// Search & Filter
function setupSearchFilter() {
  const searchInput = document.getElementById('search-input');
  const filterSelect = document.getElementById('category-filter');
  
  if (!searchInput || !filterSelect) return;
  
  function filterProducts() {
    let filtered = products;
    
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm));
    }
    
    const category = filterSelect.value;
    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }
    
    renderProducts(filtered, '.products-grid');
  }
  
  searchInput.addEventListener('input', filterProducts);
  filterSelect.addEventListener('change', filterProducts);
}

// Animations
function observeAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
      }
    });
  });
  
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// Notifications
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === 'success' ? 'var(--neon-green)' : 'var(--neon-red)'};
    color: white;
    padding: 1rem 2rem;
    border-radius: 8px;
    z-index: 2000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Checkout
function checkout() {
  if (cart.length === 0) {
    alert('Cart is empty!');
    return;
  }
  alert('Order placed successfully! Thank you for shopping at JerseyPro.');
  cart = [];
  localStorage.removeItem('cart');
  updateCartUI();
  renderCartItems();
  updateCartTotal();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  updateCartUI();
  
  if (window.location.pathname.includes('product-detail.html')) {
    renderProductDetail();
  } else if (window.location.pathname.includes('cart.html')) {
    renderCartItems();
    updateCartTotal();
  } else if (window.location.pathname.includes('products.html')) {
    setupSearchFilter();
    renderProducts(products, '.products-grid');
  } else {
    // Homepage - featured products
    const featured = products.slice(0, 6);
    renderProducts(featured, '.products-grid');
  }
  
  // Navbar click handlers
  const cartIcon = document.querySelector('.cart-icon');
  if (cartIcon) {
    cartIcon.addEventListener('click', () => {
      window.location.href = 'cart.html';
    });
  }
});
