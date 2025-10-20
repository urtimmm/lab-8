const ordersAPI = "http://localhost:3000/orders";
const ordersDiv = document.getElementById("orders");


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
    ordersDiv.innerHTML = "<p>⚠️ Для просмотра заказов необходимо <a href='login.html'>авторизоваться</a></p>";
    return false;
  }
  currentUser = JSON.parse(userData);
  return true;
}

async function loadOrders() {
  if (!checkAuth()) return;

  try {
    const res = await fetch(`${ordersAPI}?userId=${currentUser.id}&_sort=date&_order=desc`);
    const data = await res.json();

    ordersDiv.innerHTML = data.length ? data.map(order => `
      <div class="card">
        <div class="order-header">
          <div>
            <h3>Заказ №${order.id}</h3>
            <p>Дата: ${new Date(order.date).toLocaleString('ru-RU')}</p>
            <p>Статус: <span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></p>
          </div>
          <p class="price">${order.total.toFixed(2)} BYN</p>
        </div>
        <div class="order-items">
          ${order.items.map(i => `
            <div class="order-item">
              <img src="${i.image}" alt="${i.title}">
              <span><strong>${i.title}</strong> — ${i.quantity} шт. × ${i.price} BYN</span>
            </div>
          `).join("")}
        </div>
      </div>
    `).join("") : "<p>❌ Заказов пока нет</p>";
  } catch (error) {
    ordersDiv.innerHTML = "<p>Ошибка загрузки заказов</p>";
    console.error(error);
  }
}

function getStatusText(status) {
  const statuses = {
    'pending': 'В обработке',
    'confirmed': 'Подтвержден',
    'shipping': 'Доставляется',
    'delivered': 'Доставлен',
    'cancelled': 'Отменен'
  };
  return statuses[status] || 'Неизвестно';
}

loadOrders();