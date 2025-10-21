const ordersAPI = 'http://localhost:3001/orders';
const ordersDiv = document.getElementById('orders');

// ===== Прелоадер =====
window.addEventListener('load', () => {
  const p = document.getElementById('preloader');
  if (p) setTimeout(() => p.setAttribute('hidden', ''), 250); // короткая задержка для красоты
});

let currentUser = null;

// Функция управления видимостью кнопки "войти", админ-ссылки и регистрации
function updateLoginButtonVisibility() {
  const loginLink = document.getElementById('login-link');
  const mobileLoginLink = document.getElementById('mobile-login-link');
  const userIcon = document.getElementById('user-icon');
  const logoutBtn = document.getElementById('logout-btn');
  const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
  const adminLink = document.getElementById('admin-link');
  const mobileAdminLink = document.getElementById('mobile-admin-link');

  // Находим ссылки на регистрацию в десктопном и мобильном меню
  const registerLinks = document.querySelectorAll('a[href="register.html"]');

  if (currentUser) {
    // Пользователь авторизован - скрываем кнопку "войти"
    if (loginLink) loginLink.style.display = 'none';
    if (mobileLoginLink) mobileLoginLink.style.display = 'none';

    // Скрываем ссылки на регистрацию для авторизованных пользователей
    registerLinks.forEach((link) => {
      link.style.display = 'none';
    });

    // Показываем элементы для авторизованного пользователя
    if (userIcon) userIcon.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'block';
    if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'block';

    // Показываем админ-ссылку только для администраторов
    if (currentUser.role === 'admin') {
      if (adminLink) adminLink.style.display = 'inline-block';
      if (mobileAdminLink) mobileAdminLink.style.display = 'block';
    } else {
      if (adminLink) adminLink.style.display = 'none';
      if (mobileAdminLink) mobileAdminLink.style.display = 'none';
    }
  } else {
    // Пользователь не авторизован - показываем кнопку "войти"
    if (loginLink) loginLink.style.display = 'inline-block';
    if (mobileLoginLink) mobileLoginLink.style.display = 'block';

    // Показываем ссылки на регистрацию для неавторизованных пользователей
    registerLinks.forEach((link) => {
      link.style.display = 'inline-block';
    });

    // Скрываем элементы для авторизованного пользователя
    if (userIcon) userIcon.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'none';

    // Скрываем админ-ссылку для неавторизованных пользователей
    if (adminLink) adminLink.style.display = 'none';
    if (mobileAdminLink) mobileAdminLink.style.display = 'none';
  }
}

// Проверка авторизации
function checkAuth() {
  const userData = localStorage.getItem('currentUser');
  if (!userData) {
    ordersDiv.innerHTML =
      "<p>⚠️ Для просмотра заказов необходимо <a href='login.html'>авторизоваться</a></p>";
    return false;
  }
  currentUser = JSON.parse(userData);
  return true;
}

async function loadOrders() {
  if (!checkAuth()) {
    updateLoginButtonVisibility();
    return;
  }
  updateLoginButtonVisibility();

  try {
    const res = await fetch(
      `${ordersAPI}?userId=${currentUser.id}&_sort=date&_order=desc`
    );
    const data = await res.json();

    ordersDiv.innerHTML = data.length
      ? data
          .map(
            (order) => `
      <div class="card">
        <div class="order-header">
          <div>
            <h3>Заказ №${order.id}</h3>
            <p>Дата: ${new Date(order.date).toLocaleString('ru-RU')}</p>
            <p>Статус: <span class="status-badge status-${
              order.status
            }">${getStatusText(order.status)}</span></p>
          </div>
          <p class="price">${order.total.toFixed(2)} BYN</p>
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

loadOrders();

// Обработчик кнопки выхода
const logoutBtn = document.getElementById('logout-btn');
const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    location.reload();
  });
}

if (mobileLogoutBtn) {
  mobileLogoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    location.reload();
  });
}
