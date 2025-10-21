const ordersAPI = 'http://localhost:3001/orders';
const ordersDiv = document.getElementById('orders');

async function loadOrders() {
  const res = await fetch(ordersAPI);
  const data = await res.json();

  ordersDiv.innerHTML = data.length
    ? data
        .map(
          (order) => `
    <div class="card">
      <div>
        <h3>Заказ №${order.id}</h3>
        <p>Дата: ${new Date(order.date).toLocaleString()}</p>
        <p>Сумма: <b class="price">${order.total} BYN</b></p>
      </div>
      <div class="order-items">
        ${order.items
          .map(
            (i) => `
          <div class="order-item">
            <img src="${i.image}" alt="">
            <span>${i.title} — ${i.quantity} шт. × ${i.price} BYN</span>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `
        )
        .join('')
    : '<p>❌ Заказов пока нет</p>';
}

// Инициализация при загрузке страницы
loadOrders();
