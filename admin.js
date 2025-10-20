const productsAPI = 'http://localhost:3000/products';
const feedbackAPI = 'http://localhost:3000/feedback';
const usersAPI = 'http://localhost:3000/users';
const ordersAPI = 'http://localhost:3000/orders';

const formProd = document.getElementById('productForm');
const productList = document.getElementById('productList');
const feedbackList = document.getElementById('feedbackList');
const usersList = document.getElementById('usersList');
const orderStats = document.getElementById('orderStats');
const logoutLink = document.getElementById('logoutLink');

// ===== Прелоадер =====
window.addEventListener('load', () => {
  const p = document.getElementById('preloader');
  if (p) setTimeout(() => p.setAttribute('hidden', ''), 250); // короткая задержка для красоты
});

// Проверка доступа админа
function checkAdminAccess() {
  const userData = localStorage.getItem('currentUser');
  if (!userData) {
    alert('Необходима авторизация!');
    window.location.href = 'login.html';
    return false;
  }

  const user = JSON.parse(userData);
  if (user.role !== 'admin') {
    alert('Доступ запрещен! Только для администраторов.');
    window.location.href = 'catalog.html';
    return false;
  }

  return true;
}

// Выход
logoutLink.addEventListener('click', (e) => {
  e.preventDefault();
  if (confirm('Выйти из системы?')) {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  }
});

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
          <button onclick="editProduct(${
            p.id
          })" class="btn-edit">Редактировать</button>
          <button onclick="deleteProduct(${
            p.id
          })" class="btn-danger">Удалить</button>
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
        <button onclick="deleteFeedback(${
          f.id
        })" class="btn-danger">Удалить</button>
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
          <h4>${u.nickname || u.email}</h4>
          <p>${u.fio.last} ${u.fio.first} ${u.fio.middle || ''}</p>
          <small>Email: ${u.email} | Телефон: ${u.phone}</small><br>
          <small>Роль: <strong>${
            u.role === 'admin' ? 'Администратор' : 'Клиент'
          }</strong></small>
        </div>
        <div class="actions">
          <button onclick="toggleRole(${u.id}, '${u.role}')" class="btn-edit">
            ${u.role === 'admin' ? 'Сделать клиентом' : 'Сделать админом'}
          </button>
          <button onclick="deleteUser(${
            u.id
          })" class="btn-danger">Удалить</button>
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
  const newRole = currentRole === 'admin' ? 'client' : 'admin';

  if (
    !confirm(
      `Изменить роль пользователя на "${
        newRole === 'admin' ? 'Администратор' : 'Клиент'
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

// Инициализация
if (checkAdminAccess()) {
  loadProducts();
  loadFeedback();
  loadUsers();
  loadOrderStats();
}
