const cartAPI = 'http://localhost:3001/cart';
const ordersAPI = 'http://localhost:3001/orders';
const cartDiv = document.getElementById('cart');
const totalDiv = document.getElementById('total');

async function loadCart() {
  const res = await fetch(cartAPI);
  const data = await res.json();
  let total = 0;

  cartDiv.innerHTML = data.length
    ? data
        .map((p) => {
          total += p.price * p.quantity;
          return `
    <div class="card">
      <img src="${p.image}">
      <h3>${p.title}</h3>
      <p>${p.price} × ${p.quantity} = <b class="price">${
            p.price * p.quantity
          } BYN</b></p>
      <div class="actions">
        <button onclick="changeQty(${p.id}, ${p.quantity + 1})">+</button>
        <button onclick="changeQty(${p.id}, ${p.quantity - 1})">-</button>
        <button onclick="removeCart(${
          p.id
        })" class="btn-danger">Удалить</button>
      </div>
    </div>
  `;
        })
        .join('')
    : '<p>❌ Корзина пуста</p>';

  totalDiv.textContent = 'Итого: ' + total + ' BYN';
}

async function changeQty(id, qty) {
  if (qty <= 0) return removeCart(id);
  await fetch(`${cartAPI}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity: qty }),
  });
  loadCart();
}

async function removeCart(id) {
  await fetch(`${cartAPI}/${id}`, { method: 'DELETE' });
  loadCart();
}

async function checkout() {
  const res = await fetch(cartAPI);
  const cartItems = await res.json();

  if (!cartItems.length) {
    alert('Корзина пуста!');
    return;
  }

  const order = {
    id: Date.now(),
    date: new Date().toISOString(),
    items: cartItems,
    total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };

  await fetch(ordersAPI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });

  for (let item of cartItems) {
    await fetch(`${cartAPI}/${item.id}`, { method: 'DELETE' });
  }

  alert('✅ Заказ оформлен!');
  loadCart();
}

// Инициализация при загрузке страницы
loadCart();
