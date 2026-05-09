import './style.css'
import { db } from './src/firebase'
import { collection, addDoc } from "firebase/firestore"

// ===== Product Data =====
const products = [
  {
    id: 1,
    name: 'Chandan Sandalwood',
    category: 'woody',
    price: 249,
    oldPrice: 349,
    image: '/sandal.jpg', 
    desc: 'Rich, warm sandalwood fragrance. 100 sticks per box.',
    badge: 'bestseller',
  },
  {
    id: 2,
    name: 'Rose',
    category: 'floral',
    price: 199,
    oldPrice: null,
    image: '/rose.jpg',
    desc: 'Intoxicating tuberose petals. 80 sticks per box.',
    badge: 'new',
  },
  {
    id: 3,
    name: 'Mogra',
    category: 'floral',
    price: 179,
    oldPrice: 229,
    image: '/mogra.jpg',
    desc: 'Pure jasmine flower essence. 80 sticks per box.',
    badge: null,
  },
  {
    id: 4,
    name: 'Kewda',
    category: 'premium',
    price: 599,
    oldPrice: 799,
    image: '/kewda.jpg',
    desc: 'Rare agarwood resin blend. 50 sticks luxury box.',
    badge: 'premium',
  },
  {
    id: 5,
    name: 'Lavendar',
    category: 'herbal',
    price: 149,
    oldPrice: null,
    image: '/lavendar.jpg',
    desc: 'Purifying neem & holy basil. 100 sticks per box.',
    badge: null,
  },
  {
    id: 6,
    name: 'Champa',
    category: 'floral',
    price: 219,
    oldPrice: 279,
    image: '/champa.jpg',
    desc: 'Damask rose petal fragrance. 80 sticks per box.',
    badge: null,
  },
]

// ===== State =====
let cart = []
let activeCategory = 'all'

// ===== DOM Elements =====
const navbar = document.getElementById('navbar')
const navLinks = document.getElementById('navLinks')
const mobileMenuBtn = document.getElementById('mobileMenuBtn')
const cartBtn = document.getElementById('cartBtn')
const cartCount = document.getElementById('cartCount')
const cartSidebar = document.getElementById('cartSidebar')
const cartOverlay = document.getElementById('cartOverlay')
const cartClose = document.getElementById('cartClose')
const cartItems = document.getElementById('cartItems')
const cartEmpty = document.getElementById('cartEmpty')
const cartFooter = document.getElementById('cartFooter')
const cartTotal = document.getElementById('cartTotal')
const startShopping = document.getElementById('startShopping')
const checkoutBtn = document.getElementById('checkoutBtn')
const productGrid = document.getElementById('productGrid')
const toast = document.getElementById('toast')
const toastMessage = document.getElementById('toastMessage')
const contactForm = document.getElementById('contactForm')

// ===== Render Products =====
function renderProducts(category = 'all') {
  const filtered = category === 'all' ? products : products.filter(p => p.category === category)

  productGrid.innerHTML = filtered.map(product => {
    const badgeHTML = product.badge
      ? `<span class="product-badge badge-${product.badge}">${product.badge}</span>`
      : ''
    const oldPriceHTML = product.oldPrice
      ? `<span class="product-price-old">\u20B9${product.oldPrice}</span>`
      : ''

    return `
      <div class="product-card animate-on-scroll" data-category="${product.category}">
        <div class="product-image">
          ${
            product.image
             ? `<img src="${product.image}" alt="${product.name}" class="product-img">`
             : `<span class="product-emoji">${product.emoji}</span>`
          }
          ${badgeHTML}
        </div>
        <div class="product-info">
          <div class="product-category">${product.category}</div>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-desc">${product.desc}</p>
          <div class="product-meta">
            <div class="product-price">\u20B9${product.price} ${oldPriceHTML}</div>
            <button class="add-to-cart-btn" data-id="${product.id}">Add</button>
          </div>
        </div>
      </div>
    `
  }).join('')

  observeAnimations()
}

// ===== Cart Functions =====
function addToCart(productId) {
  const product = products.find(p => p.id === productId)
  if (!product) return

  const existing = cart.find(item => item.id === productId)
  if (existing) {
    existing.qty += 1
  } else {
    cart.push({ ...product, qty: 1 })
  }

  updateCartUI()
  showToast(`${product.name} added to cart`)

  const countEl = document.getElementById('cartCount')
  countEl.classList.remove('bump')
  void countEl.offsetWidth
  countEl.classList.add('bump')
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId)
  updateCartUI()
}

function updateQty(productId, delta) {
  const item = cart.find(i => i.id === productId)
  if (!item) return

  item.qty += delta
  if (item.qty <= 0) {
    removeFromCart(productId)
    return
  }

  updateCartUI()
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  cartCount.textContent = totalItems

  if (cart.length === 0) {
    cartEmpty.style.display = 'flex'
    cartFooter.style.display = 'none'
    const existingItems = cartItems.querySelectorAll('.cart-item')
    existingItems.forEach(el => el.remove())
    return
  }

  cartEmpty.style.display = 'none'
  cartFooter.style.display = 'block'
  cartTotal.textContent = `\u20B9${totalPrice}`

  const itemsHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-image">
        ${
          item.image
            ? `<img src="${item.image}" class="cart-img">`
            : item.emoji
        }
      </div>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">\u20B9${item.price * item.qty}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" data-id="${item.id}" data-action="decrease">-</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}" data-action="remove">&times;</button>
    </div>
  `).join('')

  const existingItems = cartItems.querySelectorAll('.cart-item')
  existingItems.forEach(el => el.remove())

  cartItems.insertAdjacentHTML('beforeend', itemsHTML)
}

function openCart() {
  cartSidebar.classList.add('open')
  cartOverlay.classList.add('open')
  document.body.style.overflow = 'hidden'
}

function closeCart() {
  cartSidebar.classList.remove('open')
  cartOverlay.classList.remove('open')
  document.body.style.overflow = ''
}

// ===== Toast =====
let toastTimeout
function showToast(message) {
  toastMessage.textContent = message
  toast.classList.add('show')
  clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500)
}

// ===== Scroll Animations =====
function observeAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  )

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el))
}

// ===== Navbar Scroll =====
let lastScroll = 0
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY
  navbar.classList.toggle('scrolled', scrollY > 50)
  lastScroll = scrollY
})

// ===== Active Nav Link =====
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]')
  const scrollY = window.scrollY + 100

  sections.forEach(section => {
    const top = section.offsetTop
    const height = section.offsetHeight
    const id = section.getAttribute('id')

    if (scrollY >= top && scrollY < top + height) {
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active')
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active')
        }
      })
    }
  })
}

window.addEventListener('scroll', updateActiveNav)

// ===== Event Listeners =====

// Mobile menu
mobileMenuBtn.addEventListener('click', () => {
  mobileMenuBtn.classList.toggle('open')
  navLinks.classList.toggle('open')
})

// Close mobile menu on link click
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenuBtn.classList.remove('open')
    navLinks.classList.remove('open')
  })
})

// Cart open/close
cartBtn.addEventListener('click', openCart)
cartClose.addEventListener('click', closeCart)
cartOverlay.addEventListener('click', closeCart)
startShopping.addEventListener('click', closeCart)

// Cart item actions (delegated)
cartItems.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]')
  if (!btn) return
  const id = parseInt(btn.dataset.id)
  const action = btn.dataset.action

  if (action === 'increase') updateQty(id, 1)
  else if (action === 'decrease') updateQty(id, -1)
  else if (action === 'remove') removeFromCart(id)
})

// Add to cart (delegated)
productGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.add-to-cart-btn')
  if (!btn) return
  const id = parseInt(btn.dataset.id)
  addToCart(id)

  btn.textContent = 'Added!'
  btn.classList.add('added')
  setTimeout(() => {
    btn.textContent = 'Add'
    btn.classList.remove('added')
  }, 1200)
})

// Category filter
document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'))
    card.classList.add('active')
    activeCategory = card.dataset.category
    renderProducts(activeCategory)
  })
})

// Checkout
checkoutBtn.addEventListener('click', async () => {
  if (cart.length === 0) return;

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  try {
    await addDoc(collection(db, "orders"), {
      items: cart,
      total: total,
      createdAt: new Date()
    });

    showToast(`Order placed! Total: ₹${total}`);

    cart = [];
    updateCartUI();
    closeCart();

  } catch (error) {
    console.error("Order error:", error);
    showToast("Error placing order");
  }
});

// Contact form
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = e.target.name.value;
  const email = e.target.email.value;
  const message = e.target.message.value;

  try {
    await addDoc(collection(db, "contacts"), {
      name,
      email,
      message,
      createdAt: new Date()
    });

    showToast('Message saved!');
    contactForm.reset();

  } catch (error) {
    console.error(error);
    showToast('Error saving message');
  }
});

// ===== Init =====
renderProducts()
