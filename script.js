// ======================================================================
// SOD DREAMS — Original JS (MIT License)
// Author: Semzy Olufemi
// ======================================================================

(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // ----------------------------------------
  // Mobile nav toggle (accessible)
  // ----------------------------------------
  const navToggle = $('.nav-toggle');
  const navList = $('#nav-list');

  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navList.setAttribute('aria-expanded', String(!expanded));
      navList.classList.toggle('open');
    });
  }

  // ----------------------------------------
  // Newsletter 
  // ----------------------------------------
  const newsletterForm = $('#newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('#newsletter-email').value.trim();
      if (!email) return;
      alert(`Thanks! We'll keep you posted at ${email}`);
      newsletterForm.reset();
    });
  }

  // ----------------------------------------
  // Cart
  // ----------------------------------------
  const CART_KEY = 'sod_cart_v1';
  const cartList = $('#cart-list');
  const cartTotalEl = $('#cart-total');
  const clearBtn = $('#cart-clear');
  const checkoutBtn = $('#cart-checkout');

  /** @type {{id:number, name:string, price:number, qty:number}[]} */
  let cart = loadCart();

  // Build a tiny catalog map from DOM (keeps HTML as the source of truth)
  const catalog = new Map();
  $$('.course').forEach(card => {
    const id = Number(card.dataset.id);
    const price = Number(card.dataset.price);
    const name = $('h3', card)?.textContent?.trim() || `Course ${id}`;
    catalog.set(id, { id, name, price });
  });

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function money(n) {
    return `$${(Number(n) || 0).toFixed(2)}`;
  }

  function addToCart(id) {
    const item = cart.find(i => i.id === id);
    if (item) item.qty += 1;
    else {
      const prod = catalog.get(id);
      if (!prod) return;
      cart.push({ id: prod.id, name: prod.name, price: prod.price, qty: 1 });
    }
    renderCart();
  }

  function removeFromCart(id) {
    cart = cart.filter(i => i.id != id);
    renderCart();
  }

  function updateQty(id, qty) {
    const q = Math.max(1, Number(qty) || 1);
    const item = cart.find(i => i.id === id);
    if (item) item.qty = q;
    renderCart();
  }

  function clearCart() {
    cart = [];
    renderCart();
  }

  function renderCart() {
    if (!cartList) return;
    cartList.innerHTML = '';

    if (cart.length === 0) {
      cartList.innerHTML = '<p>Your cart is empty.</p>';
      cartTotalEl.textContent = '$0.00';
      saveCart();
      return;
    }

    let total = 0;
    const frag = document.createDocumentFragment();

    cart.forEach(({ id, name, price, qty }) => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div class="cart-item__name">${name}</div>
        <div class="cart-item__price">${money(price)}</div>
        <label class="sr-only" for="qty-${id}">Quantity</label>
        <input id="qty-${id}" type="number" min="1" value="${qty}" />
        <button class="btn btn--ghost" data-remove="${id}">Remove</button>
      `;
      frag.appendChild(row);
      total += price * qty;
    });

    cartList.appendChild(frag);
    cartTotalEl.textContent = money(total);
    saveCart();
  }

  // Event delegation for Add to Cart buttons
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.add-to-cart');
    if (addBtn) {
      const card = addBtn.closest('.course');
      const id = Number(card?.dataset.id);
      if (id) addToCart(id);
    }

    const removeBtn = e.target.closest('[data-remove]');
    if (removeBtn) {
      const id = Number(removeBtn.getAttribute('data-remove'));
      removeFromCart(id);
    }
  });

  // Qty change (delegation)
  document.addEventListener('change', (e) => {
    if (e.target.matches('.cart-item input[type="number"]')) {
      const id = Number(e.target.id.replace('qty-', ''));
      updateQty(id, e.target.value);
    }
  });

  // Clear / Checkout
  checkoutBtn?.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Your cart is empty.');
    return;
  }

  // calculate total cart amount
  let total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Paystack expects amount in kobo (multiply by 100)
  let amount = total * 100;

  let handler = PaystackPop.setup({
    key: 'pk_test_7968d0fcde9a6d045e6718c94934b1143dfd9ae7', 
    email: 'semiloreezekiel58@gmail.com', 
    amount: amount,
    currency: "NGN",
    ref: '' + Math.floor(Math.random() * 1000000000 + 1), // unique reference

    callback: function(response) {
      alert('Payment successful! Reference: ' + response.reference);
      clearCart(); // empty cart after payment
    },

    onClose: function() {
      alert('Payment cancelled.');
    }
  });

  handler.openIframe();
});


  // Initial render
  renderCart();
})();