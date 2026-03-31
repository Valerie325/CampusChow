document.getElementById("buyerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const buyerName = document.getElementById("name").value;
  const buyerPhone = document.getElementById("phone").value;
  const buyerAddress = document.getElementById("address").value;
  const payment = document.getElementById("payment").value;

  if (!buyerName || !buyerPhone || !buyerAddress || !payment) {
    alert("Please fill in all fields.");
    return;
  }

  alert(`Order submitted for ${buyerName}!`);

  window.location.href = "order-success.html";

  localStorage.removeItem("cartItems");
  localStorage.removeItem("totalPrice");
});