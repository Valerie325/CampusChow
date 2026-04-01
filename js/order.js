// Get DOM elements
const cartItemsDisplay = document.getElementById("cartItemsDisplay");
const totalPriceDisplay = document.getElementById("totalPriceDisplay");
const buyerForm = document.getElementById("buyerForm");

// Check authentication on page load using the auth utility
if (!requireAuth()) {
  // Exit early if not authenticated - user will be redirected
  throw new Error("User must be signed in to view order page");
}

// Load cart and total from localStorage
const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
const total = localStorage.getItem("cartTotal") || 0;

// Display cart items
if (cart.length === 0) {
  cartItemsDisplay.innerHTML = "<p>Your cart is empty!</p>";
  totalPriceDisplay.textContent = "";
} else {
  const ul = document.createElement("ul");
  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} (x${item.quantity}) - GHS ${item.price * item.quantity}`;
    ul.appendChild(li);
  });
  cartItemsDisplay.appendChild(ul);
  totalPriceDisplay.textContent = `Total: GHS ${total}`;
}

// Handle buyer form submission
buyerForm.addEventListener("submit", function(e) {
  e.preventDefault();

  // Verify user is still authenticated
  const token = localStorage.getItem("campusChowToken");
  if (!token) {
    alert("Your session has expired. Please sign in again.");
    window.location.href = "signin.html";
    return;
  }

  const buyerName = document.getElementById("name").value.trim();
  const buyerPhone = document.getElementById("phone").value.trim();
  const buyerAddress = document.getElementById("address").value.trim();
  const payment = document.getElementById("payment").value;

  if (!buyerName || !buyerPhone || !buyerAddress || !payment) {
    alert("Please fill in all fields.");
    return;
  }

  alert(`Order submitted for ${buyerName}!`);

  // Clear cart from localStorage
  localStorage.removeItem("cartItems");
  localStorage.removeItem("cartTotal");
  localStorage.removeItem("cart");

  // Redirect to order success page
  window.location.href = "order-success.html";
});