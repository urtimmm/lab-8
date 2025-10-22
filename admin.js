const productsAPI = 'http://localhost:3001/products';
const feedbackAPI = 'http://localhost:3001/feedback';
const usersAPI = 'http://localhost:3001/users';
const ordersAPI = 'http://localhost:3001/orders';

const formProd = document.getElementById('productForm');
const productList = document.getElementById('productList');
const feedbackList = document.getElementById('feedbackList');
const usersList = document.getElementById('usersList');
const orderStats = document.getElementById('orderStats');
const logoutLink = document.getElementById('logoutLink');
const userIcon = document.getElementById('user-icon');

// Функция получения перевода из window.i18Obj
function getI18n(key, fallback = '') {
  const currentLang = window.lang || 'ru';
  return window.i18Obj?.[currentLang]?.[key] || fallback;
}

// Функция для получения имени пользователя
function getUserName(user) {
  if (!user) return '';

  // Если fio - объект, собираем полное имя
  if (user.fio && typeof user.fio === 'object') {
    const { first = '', last = '', middle = '' } = user.fio;
    const nameParts = [first, middle, last].filter(Boolean);
    return nameParts.join(' ');
  }

  // Если fio - строка, возвращаем как есть
  if (user.fio && typeof user.fio === 'string') {
    return user.fio;
  }

  // Возвращаем name или nickname как fallback
  return user.name || user.nickname || '';
}

// ===== Прелоадер =====
window.addEventListener('load', () => {
  const p = document.getElementById('preloader');
  if (p) setTimeout(() => p.setAttribute('hidden', ''), 250); // короткая задержка для красоты
});

// Функция управления видимостью кнопки "войти" и регистрации
function updateLoginButtonVisibility() {
  const loginLink = document.getElementById('login-link');
  const mobileLoginLink = document.getElementById('mobile-login-link');
  const userIcon = document.getElementById('user-icon');
  const logoutBtn = document.getElementById('logout-btn');
  const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

  // Находим ссылки на регистрацию в десктопном и мобильном меню
  const registerLinks = document.querySelectorAll('a[href="register.html"]');

  const userData = localStorage.getItem('currentUser');
  const currentUser = userData ? JSON.parse(userData) : null;

  if (currentUser) {
    // Пользователь авторизован - скрываем кнопку "войти"
    if (loginLink) loginLink.style.display = 'none';
    if (mobileLoginLink) mobileLoginLink.style.display = 'none';

    // Скрываем ссылки на регистрацию для авторизованных пользователей (включая админов)
    registerLinks.forEach((link) => {
      link.style.display = 'none';
    });

    // Показываем элементы для авторизованного пользователя
    if (userIcon) userIcon.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'block';
    if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'block';
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
  }
}

// Проверка доступа админа
function checkAdminAccess() {
  const userData = localStorage.getItem('currentUser');
  if (!userData) {
    alert('Необходима авторизация!');
    window.location.href = 'login.html';
    return false;
  }

  const user = JSON.parse(userData);
  if (!user.role || user.role !== 'admin') {
    alert('Доступ запрещен! Только для администраторов.');
    window.location.href = 'catalog.html';
    return false;
  }

  return true;
}

// Выход
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Выйти из системы?')) {
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    }
  });
}

// Загрузка товаров
async function loadProducts() {
  try {
    const res = await fetch(productsAPI);
    const data = await res.json();
    productList.innerHTML = data
      .map(
        (p) => `
      <div class="card admin-card">
        <div>
          <h3>${p.title}</h3>
          <div class="card-description">
            <p>${p.description}</p>
          </div>
          <p class="price">${p.price} BYN</p>
          <small>Категория: ${p.category} | Рейтинг: ${p.rating || 0}</small>
        </div>
        <div class="actions">
          <button onclick="editProduct('${
            p.id
          }')" class="btn-edit">Редактировать</button>
          <button onclick="deleteProduct('${
            p.id
          }')" class="btn-danger">Удалить</button>
        </div>
      </div>
    `
      )
      .join('');
  } catch (error) {
    productList.innerHTML = '<p>Ошибка загрузки товаров</p>';
  }
}

// Загрузка отзывов
async function loadFeedback() {
  try {
    const res = await fetch(feedbackAPI);
    const data = await res.json();
    feedbackList.innerHTML = data
      .map(
        (f) => `
      <div class="card">
        <div>
          <h4>Товар: ${f.productTitle || `ID ${f.productId}`}</h4>
          <p>${f.text}</p>
          <small>Пользователь: ${f.userName} | Оценка: ${'⭐'.repeat(
          f.rating
        )}</small>
          <small>Дата: ${new Date(f.date).toLocaleDateString('ru-RU')}</small>
        </div>
        <button onclick="deleteFeedback('${
          f.id
        }')" class="btn-danger">Удалить</button>
      </div>
    `
      )
      .join('');
  } catch (error) {
    feedbackList.innerHTML = '<p>Ошибка загрузки отзывов</p>';
  }
}

// Загрузка пользователей
async function loadUsers() {
  try {
    const res = await fetch(usersAPI);
    const data = await res.json();
    usersList.innerHTML = data
      .map(
        (u) => `
      <div class="card">
        <div>
          <h4>${u.nickname || u.name || u.email}</h4>
          <p>${
            u.fio
              ? `${u.fio.last} ${u.fio.first} ${u.fio.middle || ''}`
              : u.name || 'Пользователь'
          }</p>
          <small>Email: ${u.email} | Телефон: ${
          u.phone || 'Не указан'
        }</small><br>
          <small>Роль: <strong>${
            u.role === 'admin'
              ? 'Администратор'
              : u.role === 'user'
              ? 'Пользователь'
              : 'Не определена'
          }</strong></small>
        </div>
        <div class="actions">
          <button onclick="toggleRole('${u.id}', '${
          u.role || 'user'
        }')" class="btn-edit">
            ${u.role === 'admin' ? 'Сделать пользователем' : 'Сделать админом'}
          </button>
          <button onclick="deleteUser('${
            u.id
          }')" class="btn-danger">Удалить</button>
        </div>
      </div>
    `
      )
      .join('');
  } catch (error) {
    usersList.innerHTML = '<p>Ошибка загрузки пользователей</p>';
  }
}

// Загрузка статистики заказов
async function loadOrderStats() {
  try {
    const res = await fetch(ordersAPI);
    const orders = await res.json();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue =
      totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

    orderStats.innerHTML = `
      <div class="stat-card">
        <h3>${totalOrders}</h3>
        <p>Всего заказов</p>
      </div>
      <div class="stat-card">
        <h3>${totalRevenue.toFixed(2)} BYN</h3>
        <p>Общая выручка</p>
      </div>
      <div class="stat-card">
        <h3>${avgOrderValue} BYN</h3>
        <p>Средний чек</p>
      </div>
    `;
  } catch (error) {
    orderStats.innerHTML = '<p>Ошибка загрузки статистики</p>';
  }
}

// Добавление товара
formProd.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newProd = {
    title: document.getElementById('prodTitle').value,
    description: document.getElementById('prodDesc').value,
    price: parseFloat(document.getElementById('prodPrice').value),
    category: document.getElementById('prodCategory').value,
    rating: 0,
    image:
      document.getElementById('prodImage').value ||
      'https://via.placeholder.com/300x200?text=No+Image',
  };

  try {
    await fetch(productsAPI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProd),
    });
    alert('✅ Товар добавлен!');
    loadProducts();
    formProd.reset();
  } catch (error) {
    alert('❌ Ошибка при добавлении товара');
  }
});

// Удаление товара
async function deleteProduct(id) {
  if (!confirm('Удалить этот товар?')) return;

  try {
    await fetch(`${productsAPI}/${id}`, { method: 'DELETE' });
    alert('✅ Товар удален!');
    loadProducts();
  } catch (error) {
    alert('❌ Ошибка при удалении');
  }
}

// Редактирование товара (упрощенная версия)
async function editProduct(id) {
  const res = await fetch(`${productsAPI}/${id}`);
  const product = await res.json();

  const newPrice = prompt('Введите новую цену:', product.price);
  if (newPrice === null) return;

  product.price = parseFloat(newPrice);

  try {
    await fetch(`${productsAPI}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    alert('✅ Товар обновлен!');
    loadProducts();
  } catch (error) {
    alert('❌ Ошибка при обновлении');
  }
}

// Удаление отзыва
async function deleteFeedback(id) {
  if (!confirm('Удалить этот отзыв?')) return;

  try {
    await fetch(`${feedbackAPI}/${id}`, { method: 'DELETE' });
    alert('✅ Отзыв удален!');
    loadFeedback();
  } catch (error) {
    alert('❌ Ошибка при удалении');
  }
}

// Смена роли пользователя
async function toggleRole(id, currentRole) {
  const newRole = currentRole === 'admin' ? 'user' : 'admin';

  if (
    !confirm(
      `Изменить роль пользователя на "${
        newRole === 'admin' ? 'Администратор' : 'Пользователь'
      }"?`
    )
  )
    return;

  try {
    const res = await fetch(`${usersAPI}/${id}`);
    const user = await res.json();
    user.role = newRole;

    await fetch(`${usersAPI}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    alert('✅ Роль изменена!');
    loadUsers();
  } catch (error) {
    alert('❌ Ошибка при изменении роли');
  }
}

// Удаление пользователя
async function deleteUser(id) {
  if (!confirm('Удалить этого пользователя?')) return;

  try {
    await fetch(`${usersAPI}/${id}`, { method: 'DELETE' });
    alert('✅ Пользователь удален!');
    loadUsers();
  } catch (error) {
    alert('❌ Ошибка при удалении');
  }
}

userIcon?.addEventListener('click', () => {
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

  if (window.openModal) {
    openModal({
      title: '', // Убираем заголовок, так как у профиля есть свой profile-header
      actions: [], // Явно указываем пустой массив действий
      body: `
        <div class="profile-modal">
          <div class="profile-header">
            <button class="profile-close" aria-label="Закрыть">×</button>
            <h2 class="profile-title">${getI18n(
              'profile-title',
              'Профиль'
            )}</h2>
            <p class="profile-subtitle">${getI18n(
              'profile-subtitle',
              'Управление настройками аккаунта'
            )}</p>
          </div>
          <div class="profile-body">
            <div class="profile-form-container">
              <form id="user-form" class="profile-form">
              <div class="profile-form-group">
                <label class="profile-form-label" for="user-name">${getI18n(
                  'name',
                  'Имя'
                )}</label>
                <input 
                  id="user-name" 
                  class="profile-form-input" 
                  type="text" 
                  value="${getUserName(user)}"
                  placeholder="${getI18n(
                    'name-placeholder',
                    'Введите ваше имя'
                  )}"
                >
              </div>
              <div class="profile-form-group">
                <label class="profile-form-label" for="user-email">${getI18n(
                  'email',
                  'Email'
                )}</label>
                <input 
                  id="user-email" 
                  class="profile-form-input" 
                  type="email" 
                  value="${user.email || ''}"
                  placeholder="${getI18n(
                    'email-placeholder',
                    'Введите ваш email'
                  )}"
                >
              </div>
              <div class="profile-form-group">
                <label class="profile-form-label" for="user-nickname">${getI18n(
                  'nickname',
                  'Ник'
                )}</label>
                <input 
                  id="user-nickname" 
                  class="profile-form-input" 
                  type="text" 
                  value="${user.nickname || ''}"
                  placeholder="${getI18n(
                    'nickname-placeholder',
                    'Введите ваш ник'
                  )}"
                >
              </div>
              <div class="profile-actions">
                <button type="submit" class="profile-btn profile-btn-primary">
                  ${getI18n('save', 'Сохранить')}
                </button>
                <button type="button" id="reset-settings" class="profile-btn profile-btn-danger">
                  ${getI18n('reset', 'Сброс настроек')}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      `,
    });

    // Добавляем обработчик для кнопки закрытия профиля
    const profileCloseBtn = document.querySelector('.profile-close');
    if (profileCloseBtn) {
      profileCloseBtn.addEventListener('click', () => {
        // Закрываем модальное окно
        const modal = document.querySelector('.modal.open');
        if (modal) {
          modal.classList.remove('open');
          setTimeout(() => modal.remove(), 150);
        }
      });
    }

    document.getElementById('user-form').addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      // Добавляем анимацию загрузки
      submitBtn.classList.add('loading');
      submitBtn.textContent = getI18n('saving', 'Сохранение...');

      // Имитируем задержку для лучшего UX
      setTimeout(() => {
        const nameValue = document.getElementById('user-name').value;
        const updated = {
          ...user,
          fio: nameValue, // Сохраняем как строку
          email: document.getElementById('user-email').value,
          nickname: document.getElementById('user-nickname').value,
        };

        localStorage.setItem('currentUser', JSON.stringify(updated));
        currentUser = updated;

        // Показываем уведомление об успехе через toast
        if (window.toast && window.toast.success) {
          window.toast.success(
            getI18n('profile-updated', 'Профиль успешно обновлён!')
          );
        }

        // Восстанавливаем кнопку
        submitBtn.classList.remove('loading');
        submitBtn.textContent = originalText;

        // Закрываем модальное окно через небольшую задержку
        setTimeout(() => {
          if (window.closeModal) closeModal();
        }, 1000);
      }, 800);
    });

    // Обработчик кнопки сброса настроек
    const resetBtn = document.getElementById('reset-settings');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        // Используем существующую систему модальных окон
        const closeModal = window.openConfirm({
          title: `⚠️ ${getI18n('reset-confirm-title', 'Подтверждение сброса')}`,
          message: getI18n(
            'reset-confirm-message',
            'Вы уверены, что хотите сбросить все настройки? Это действие нельзя отменить.'
          ),
          onConfirm: () => {
            // Показываем уведомление о сбросе через toast
            if (window.toast && window.toast.info) {
              window.toast.info(getI18n('resetting', 'Сброс настроек...'));
            }

            // Сброс через небольшую задержку
            setTimeout(() => {
              // Очищаем все данные localStorage
              localStorage.clear();

              // Устанавливаем значения по умолчанию
              localStorage.setItem('lang', 'ru');
              localStorage.setItem('theme', 'light');

              // Перезагружаем страницу
              location.reload();
            }, 1000);
          },
        });
      });
    }
  } else {
    alert(
      `${getI18n('profile-title', 'Профиль')}\n${getI18n('name', 'Имя')}: ${
        user.fio || user.name || ''
      }\n${getI18n('email', 'Email')}: ${user.email || ''}`
    );
  }
});

// Инициализация
document.addEventListener('DOMContentLoaded', function () {
  updateLoginButtonVisibility();
  if (checkAdminAccess()) {
    loadProducts();
    loadFeedback();
    loadUsers();
    loadOrderStats();
  }
});
