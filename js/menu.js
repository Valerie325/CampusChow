const menuGrid = document.getElementById("menuGrid");
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("searchInput");
const cartList = document.getElementById("cartList"); // The section to display cart items
const totalPrice = document.getElementById("totalPrice"); // To display total price
const checkoutButton = document.getElementById("checkoutButton"); // Button to initiate checkout
const cartSection = document.getElementById("cartSection");
const cartToggleButton = document.getElementById("cartToggleButton");
const cartToggleMobile = document.getElementById("cartToggleMobile");
const mobileCartCount = document.getElementById("mobileCartCount");
const cartCloseButton = document.getElementById("cartCloseButton");
const foodOptionModal = document.getElementById("foodOptionModal");
const foodModalCloseButton = document.getElementById("foodModalCloseButton");
const selectedMealName = document.getElementById("selectedMealName");
const foodLocation = document.getElementById("foodLocation");
const packageQuantity = document.getElementById("packageQuantity");
const confirmFoodSelection = document.getElementById("confirmFoodSelection");

let currentCategory = "All"; // Default
let currentSearch = ""; // Default
let cart = JSON.parse(localStorage.getItem("cart")) || []; // Load cart from localStorage or start fresh
let selectedMeal = null;

function updateBodyModalState() {
  const cartOpen = cartSection && !cartSection.hidden;
  const foodOpen = foodOptionModal && !foodOptionModal.hidden;
  document.body.classList.toggle("modal-open", cartOpen || foodOpen);
}

function setCartPanelOpen(isOpen) {
  if (!cartSection) return;
  cartSection.hidden = !isOpen;
  cartSection.setAttribute("aria-hidden", String(!isOpen));
  updateBodyModalState();

  if (cartToggleButton) {
    cartToggleButton.setAttribute("aria-expanded", String(isOpen));
  }

  if (cartToggleMobile) {
    cartToggleMobile.setAttribute("aria-expanded", String(isOpen));
  }
}

function toggleCartPanel() {
  if (!cartSection) return;
  setCartPanelOpen(cartSection.hidden);
}

function closeCartPanel() {
  setCartPanelOpen(false);
}

function openFoodOptionModal(meal) {
  if (!foodOptionModal || !selectedMealName || !foodLocation || !packageQuantity) {
    return;
  }

  selectedMeal = meal;
  selectedMealName.textContent = meal.name;
  foodLocation.value = "";
  packageQuantity.value = "1";
  foodOptionModal.hidden = false;
  foodOptionModal.setAttribute("aria-hidden", "false");
  updateBodyModalState();
}

function closeFoodOptionModal() {
  if (!foodOptionModal) return;
  foodOptionModal.hidden = true;
  foodOptionModal.setAttribute("aria-hidden", "true");
  selectedMeal = null;
  updateBodyModalState();
}

function updateCartButtonCount() {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (cartToggleButton) {
    cartToggleButton.textContent = `Cart (${itemCount})`;
  }

  if (mobileCartCount) {
    mobileCartCount.textContent = String(itemCount);
  }
}

// Function to update the cart display
function updateCart() {
  cartList.innerHTML = ""; // Clear the existing cart content
  let total = 0;

  cart.forEach((item, index) => {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
      <span>${item.name} - ${item.location} (x${item.quantity})</span>
      <span>GHS ${item.price * item.quantity}</span>
      <button class="remove-btn" data-index="${index}">Remove</button>
    `;
    cartList.appendChild(cartItem);
    total += item.price * item.quantity;
  });

  totalPrice.textContent = `Total: GHS ${total}`;
  updateCartButtonCount();

  // Save the cart to localStorage after every update
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Function to add a meal to the cart
function addToCart(meal, quantity, location) {
  const existingMeal = cart.find(
    (item) => item.name === meal.name && item.location === location
  );

  if (existingMeal) {
    existingMeal.quantity += quantity;
  } else {
    cart.push({
      name: meal.name,
      price: meal.price,
      location,
      quantity,
    });
  }

  updateCart();
}

// Function to remove a meal from the cart
function removeFromCart(index) {
  cart.splice(index, 1); // Remove the item at the given index
  updateCart();
}

// Function to render meals (with "Add to Cart" button)
function renderMeals(filteredMeals) {
  menuGrid.innerHTML = "";

  if (filteredMeals.length === 0) {
    menuGrid.innerHTML = "<p>No meals found.</p>";
    return;
  }

  filteredMeals.forEach((meal) => {
    const card = document.createElement("div");
    card.className = "menu-card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.innerHTML = `
      <img src="${meal.image}" alt="${meal.name}" class="menu-img">
      <div class="menu-info">
        <h3 class="menu-name">${meal.name}</h3>
        <p class="menu-desc">${meal.desc}</p>
        <span class="menu-price">GHS ${meal.price}</span>
        <button class="add-to-cart-btn" type="button">Select Options</button>
      </div>
    `;

    const openMealOptions = () => openFoodOptionModal(meal);

    card.addEventListener("click", openMealOptions);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openMealOptions();
      }
    });

    // Attach event listener to the card button
    const addToCartBtn = card.querySelector(".add-to-cart-btn");
    addToCartBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openMealOptions();
    });

    menuGrid.appendChild(card);
  });
}

function confirmFoodSelectionHandler() {
  if (!selectedMeal || !foodLocation || !packageQuantity) return;

  const location = foodLocation.value.trim();
  const quantity = Number(packageQuantity.value);

  if (!location) {
    alert("Please select a delivery location.");
    return;
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    alert("Please enter a valid package quantity.");
    return;
  }

  addToCart(selectedMeal, quantity, location);
  closeFoodOptionModal();
}

// Function to apply filters (category + search)
function applyFilters() {
  let filtered = meals;

  if (currentCategory !== "All") {
    filtered = filtered.filter((meal) => meal.category === currentCategory);
  }

  if (currentSearch.trim() !== "") {
    filtered = filtered.filter(
      (meal) =>
        meal.name.toLowerCase().includes(currentSearch) ||
        meal.desc.toLowerCase().includes(currentSearch)
    );
  }

  renderMeals(filtered);
}

// Function to initiate checkout process
function checkout() {
  if (cart.length === 0) {
    alert(
      "Your cart is empty. Please add items to your cart before checking out."
    );
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartSummary = cart
    .map(
      (item) =>
        `${item.name} (x${item.quantity}) - GHS ${item.price * item.quantity}`
    )
    .join("\n");

  // Save cart and total to localStorage for order.html
  localStorage.setItem("cartItems", JSON.stringify(cart));
  localStorage.setItem("cartTotal", total);

  // Redirect to order.html page
  window.location.href = "order.html";
}

// Initial render (show all meals)
applyFilters();

// Category filter
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    currentCategory = button.getAttribute("data-category");
    applyFilters();
  });
});

// Search input filter
searchInput.addEventListener("input", () => {
  currentSearch = searchInput.value.toLowerCase();
  applyFilters();
});

// Handle cart item removal
cartList.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-btn")) {
    const index = e.target.getAttribute("data-index");
    removeFromCart(index);
  }
});

// Handle checkout button click
checkoutButton.addEventListener("click", checkout);

if (cartToggleButton) {
  cartToggleButton.addEventListener("click", toggleCartPanel);
}

if (cartToggleMobile) {
  cartToggleMobile.addEventListener("click", toggleCartPanel);
}

if (cartCloseButton) {
  cartCloseButton.addEventListener("click", closeCartPanel);
}

if (foodModalCloseButton) {
  foodModalCloseButton.addEventListener("click", closeFoodOptionModal);
}

if (confirmFoodSelection) {
  confirmFoodSelection.addEventListener("click", confirmFoodSelectionHandler);
}

if (cartSection) {
  cartSection.addEventListener("click", (e) => {
    if (e.target && e.target.hasAttribute("data-cart-close")) {
      closeCartPanel();
    }
  });
}

if (foodOptionModal) {
  foodOptionModal.addEventListener("click", (e) => {
    if (e.target && e.target.hasAttribute("data-food-close")) {
      closeFoodOptionModal();
    }
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && foodOptionModal && !foodOptionModal.hidden) {
    closeFoodOptionModal();
    return;
  }

  if (e.key === "Escape" && cartSection && !cartSection.hidden) {
    closeCartPanel();
  }
});

// Update cart when page loads (if cart exists in localStorage)
updateCart();