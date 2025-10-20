const cartAPI = "http://localhost:3000/cart";
const ordersAPI = "http://localhost:3000/orders";
const cartDiv = document.getElementById("cart");
const totalDiv = document.getElementById("total");


// ===== Прелоадер =====
window.addEventListener('load', () => {
  const p = document.getElementById('preloader');
  if (p) setTimeout(() => p.setAttribute('hidden', ''), 250); // короткая задержка для красоты
});

let currentUser = null;

// Проверка авторизации
function checkAuth() {
  const userData = localStorage.getItem("currentUser");
  if (!userData) {
    cartDiv.innerHTML = "<p>⚠️ Для просмотра корзины необходимо <a href='login.html'>авторизоваться</a></p>";
    totalDiv.style.display = "none";
    document.querySelector("button[onclick='checkout()']").style.display = "none";
    return false;
  }
  currentUser = JSON.parse(userData);
  return true;
}

async function loadCart() {
  if (!checkAuth()) return;

  const res = await fetch(`${cartAPI}?userId=${currentUser.id}`);
  const data = await res.json();
  let total = 0;

  cartDiv.innerHTML = data.length ? data.map(p => {
    total += p.price * p.quantity;
    return `
      <div class="card">
        <img src="${p.image}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p>${p.price} × ${p.quantity} = <b class="price">${(p.price * p.quantity).toFixed(2)} BYN</b></p>
        <div class="actions">
          <button onclick="changeQty(${p.id}, ${p.quantity + 1})">+</button>
          <button onclick="changeQty(${p.id}, ${p.quantity - 1})">-</button>
          <button onclick="removeCart(${p.id})" class="btn-danger">Удалить</button>
        </div>
      </div>
    `;
  }).join("") : "<p>❌ Корзина пуста</p>";

  totalDiv.textContent = "Итого: " + total.toFixed(2) + " BYN";
  totalDiv.style.display = data.length ? "block" : "none";
}

async function changeQty(id, qty) {
  if (qty <= 0) return removeCart(id);

  await fetch(`${cartAPI}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity: qty })
  });
  loadCart();
}

async function removeCart(id) {
  if (!confirm("Удалить товар из корзины?")) return;

  await fetch(`${cartAPI}/${id}`, { method: "DELETE" });
  loadCart();
}

async function checkout() {
  if (!currentUser) {
    alert("Необходима авторизация!");
    return;
  }

  const res = await fetch(`${cartAPI}?userId=${currentUser.id}`);
  const cartItems = await res.json();

  if (!cartItems.length) {
    alert("Корзина пуста!");
    return;
  }

  const order = {
    userId: currentUser.id,
    userName: currentUser.nickname || currentUser.fio.first,
    userEmail: currentUser.email,
    date: new Date().toISOString(),
    items: cartItems.map(item => ({
      productId: item.productId,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    })),
    total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    status: "pending"
  };

  try {
    await fetch(ordersAPI, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });

    // Очищаем корзину пользователя
    for (let item of cartItems) {
      await fetch(`${cartAPI}/${item.id}`, { method: "DELETE" });
    }

    alert("✅ Заказ успешно оформлен!");
    loadCart();
  } catch (error) {
    alert("❌ Ошибка при оформлении заказа");
    console.error(error);
  }
}

loadCart();