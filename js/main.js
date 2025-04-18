// main.js

// main.js

// ========== CART FUNCTIONALITY ==========
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = count;
}

function updateCartTotal() {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalEl = document.getElementById("cart-total");
  if (totalEl) totalEl.textContent = "₹" + total;
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCartItems() {
  const cartList = document.getElementById("cart-items");
  if (!cartList) return;
  cartList.innerHTML = "";

  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center flex-wrap";
    li.innerHTML = `
      <span class="fw-bold">${item.name}</span>
      <div class="cart-item-controls">
        <button class="quantity-btn minus-btn" data-index="${index}">−</button>
        <span class="cart-item-quantity">${item.quantity}</span>
        <button class="quantity-btn plus-btn" data-index="${index}">+</button>
        <span class="ms-2 fw-bold">₹${item.price * item.quantity}</span>
        <span class="remove-btn ms-3" data-index="${index}">❌</span>
      </div>
    `;
    cartList.appendChild(li);
  });
  updateCartCount();
  updateCartTotal();
  saveCart();
}

function updateInlineQuantityUI(card, item) {
  const qtyBox = card.querySelector(".inline-qty-box");
  if (!qtyBox) return;
  qtyBox.querySelector(".qty-number").textContent = item.quantity;
}

function showInlineControls(card, name) {
  const existing = cart.find((item) => item.name === name);
  let controls = card.querySelector(".inline-qty-box");

  if (!controls) {
    controls = document.createElement("div");
    controls.className = "inline-qty-box mt-3 d-flex align-items-center gap-2";
    controls.innerHTML = `
      <button class="btn btn-sm qty-btn minus">−</button>
      <span class="qty-number fw-bold">${existing.quantity}</span>
      <button class="btn btn-sm qty-btn plus">+</button>
    `;
    card.querySelector(".product-buttons").appendChild(controls);
  }

  controls.style.display = "flex";

  controls.querySelector(".plus").onclick = () => {
    existing.quantity++;
    updateCartCount();
    updateCartTotal();
    updateInlineQuantityUI(card, existing);
    saveCart();
    renderCartItems();
  };

  controls.querySelector(".minus").onclick = () => {
    if (existing.quantity > 1) {
      existing.quantity--;
    } else {
      controls.remove();
      cart = cart.filter((item) => item.name !== name);
    }
    updateCartCount();
    updateCartTotal();
    updateInlineQuantityUI(card, existing);
    saveCart();
    renderCartItems();
  };
}

// ========== DOM EVENTS ==========
document.addEventListener("DOMContentLoaded", function () {
  // Add to Cart
  document.querySelectorAll(".product-buttons .main-btn.alt").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const card = this.closest(".product-card");
      const name = card.querySelector("h4").textContent;
      const priceText = card.querySelector(".price").textContent;
      const price = parseInt(priceText.replace(/[^\d]/g, "")) || 0;

      let existing = cart.find((item) => item.name === name);
      if (existing) {
        existing.quantity++;
      } else {
        existing = { name, price, quantity: 1 };
        cart.push(existing);
      }

      showInlineControls(card, name);
      renderCartItems();
    });
  });

  // Quantity & Remove in cart modal
  const cartItemsContainer = document.getElementById("cart-items");
  if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", function (e) {
      const index = e.target.dataset.index;
      if (e.target.classList.contains("plus-btn")) {
        cart[index].quantity++;
      } else if (e.target.classList.contains("minus-btn")) {
        if (cart[index].quantity > 1) {
          cart[index].quantity--;
        }
      } else if (e.target.classList.contains("remove-btn")) {
        cart.splice(index, 1);
      }
      renderCartItems();
    });
  }

  // Buy Now triggers checkout modal
  document.querySelectorAll(".product-buttons .main-btn:not(.alt)").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const checkoutModal = new bootstrap.Modal(document.getElementById("checkoutModal"));
      checkoutModal.show();
    });
  });

  // Checkout Submit
  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const orderId = "ORD" + Date.now();
      alert("✅ Order Placed! Your Order ID is: " + orderId);
      localStorage.setItem("lastOrderId", orderId);
      cart = [];
      renderCartItems();
      this.reset();
      bootstrap.Modal.getInstance(document.getElementById("checkoutModal")).hide();
    });
  }

  // Order ID lookup
  const orderLookupForm = document.getElementById("order-lookup-form");
  if (orderLookupForm) {
    orderLookupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const inputId = document.getElementById("order-id-input").value;
      const storedId = localStorage.getItem("lastOrderId");
      const resultBox = document.getElementById("order-lookup-result");
      if (inputId === storedId) {
        resultBox.textContent = `✅ Order ${storedId} found! It is being processed.`;
        resultBox.style.color = "green";
      } else {
        resultBox.textContent = `❌ No order found with ID: ${inputId}`;
        resultBox.style.color = "red";
      }
    });
  }

  renderCartItems();
});

// ========== FILTERING & LOAD MORE ==========
document.addEventListener("DOMContentLoaded", function () {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const productItems = document.querySelectorAll(".product-item");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector(".filter-btn.active")?.classList.remove("active");
      btn.classList.add("active");

      const filterValue = btn.getAttribute("data-filter");
      productItems.forEach((item) => {
        item.style.display =
          filterValue === "all" || item.classList.contains(filterValue)
            ? "block"
            : "none";
      });
    });
  });

  const loadMoreBtn = document.getElementById("load-more-btn");
  const allProducts = document.querySelectorAll(".product-item");
  let visibleCount = 8;

  function updateVisibleItems() {
    allProducts.forEach((item, index) => {
      item.style.display = index < visibleCount ? "block" : "none";
    });
    if (visibleCount >= allProducts.length && loadMoreBtn) {
      loadMoreBtn.style.display = "none";
    }
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      visibleCount += 4;
      updateVisibleItems();
    });
  }

  updateVisibleItems();
});


// Header Scroll 
let nav = document.querySelector(".navbar");
window.onscroll = function() {
    if(document.documentElement.scrollTop > 50){
        nav.classList.add("header-scrolled"); 
    }else{
        nav.classList.remove("header-scrolled");
    }
}

// nav hide  
let navBar = document.querySelectorAll(".nav-link");
let navCollapse = document.querySelector(".navbar-collapse.collapse");
navBar.forEach(function(a){
    a.addEventListener("click", function(){
        navCollapse.classList.remove("show");
    })
})

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("trackForm");
    const result = document.getElementById("trackResult");
  
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const orderId = document.getElementById("orderId").value.trim();
  
      // Mock order status
      const statusData = {
        FMZ123456: ["Order Received", "Packed", "Shipped", "Out for Delivery", "Delivered"],
        FMZ654321: ["Order Received", "Packed", "Cancelled"]
      };
  
      result.innerHTML = "";
  
      if (statusData[orderId]) {
        const ul = document.createElement("ul");
        ul.className = "list-group";
  
        statusData[orderId].forEach((step, index, arr) => {
          const li = document.createElement("li");
          li.className = "list-group-item" + (index === arr.length - 1 ? " active" : "");
          li.textContent = step;
          ul.appendChild(li);
        });
  
        result.appendChild(ul);
      } else {
        result.innerHTML = `<div class="alert alert-warning">❌ No order found with ID: ${orderId}</div>`;
      }
    });
  });
  