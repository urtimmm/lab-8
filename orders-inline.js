const ordersDiv = document.getElementById('orders');

// Функции для работы с LocalStorage
function getOrdersFromStorage() {
  const orders = localStorage.getItem('orders');
  return orders ? JSON.parse(orders) : [];
}

function loadOrders() {
  try {
    const allOrders = getOrdersFromStorage();

    // Сортируем по дате (новые сначала)
    allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    ordersDiv.innerHTML = allOrders.length
      ? allOrders
          .map(
            (order) => `
    <div class="card">
      <div>
        <h3>Заказ №${order.id}</h3>
        <p>Дата: ${new Date(order.date).toLocaleString('ru-RU')}</p>
        <p>Сумма: <b class="price">${order.total.toFixed(2)} BYN</b></p>
        <p>Статус: <span class="status-badge status-${
          order.status || 'pending'
        }">${getStatusText(order.status || 'pending')}</span></p>
      </div>
      <div class="order-items">
        ${order.items
          .map(
            (i) => `
          <div class="order-item">
            <img src="${i.image}" alt="${i.title}">
            <span><strong>${i.title}</strong> — ${i.quantity} шт. × ${i.price} BYN</span>
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
  } catch (error) {
    ordersDiv.innerHTML = '<p>Ошибка загрузки заказов</p>';
    console.error(error);
  }
}

function getStatusText(status) {
  const statuses = {
    pending: 'В обработке',
    confirmed: 'Подтвержден',
    shipping: 'Доставляется',
    delivered: 'Доставлен',
    cancelled: 'Отменен',
  };
  return statuses[status] || 'Неизвестно';
}

// Инициализация при загрузке страницы
loadOrders();
