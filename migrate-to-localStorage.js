// Пример данных из db.json
const sampleData = {
  users: [
    {
      id: '1',
      fio: {
        first: 'Иван',
        last: 'Иванов',
        middle: 'Иванович',
      },
      email: 'admin@myshop.com',
      phone: '+375291234567',
      birthdate: '1990-01-15',
      nickname: 'admin',
      role: 'admin',
      password: 'Admin123!',
      registeredAt: '2025-01-01T10:00:00.000Z',
    },
  ],
  products: [
    {
      id: '1',
      title: 'Samsung Galaxy S24 Smartphone',
      description: 'Flagship smartphone with excellent camera',
      price: 2499,
      category: 'Electronics',
      rating: 4.8,
      image: './img/products/s-l1600.jpg',
    },
  ],
  cart: [
    {
      id: '6444',
      userId: '508d',
      productId: '4',
      title: 'Куртка зимняя мужская',
      price: 299,
      image: './img/products/hooded-jacket.jpg',
      quantity: 1,
      addedAt: '2025-10-20T21:28:10.251Z',
    },
  ],
  favorites: [
    {
      id: 'c08f',
      userId: '508d',
      productId: '4',
      title: 'Куртка зимняя мужская',
      price: 299,
      image: './img/products/hooded-jacket.jpg',
      addedAt: '2025-10-20T21:28:08.524Z',
    },
  ],
  orders: [],
  feedback: [],
};

function loadSampleData() {
  document.getElementById('jsonData').value = JSON.stringify(
    sampleData,
    null,
    2
  );
  log('Загружен пример данных', 'info');
}

function migrateData() {
  const jsonText = document.getElementById('jsonData').value.trim();

  if (!jsonText) {
    log('Введите данные JSON для миграции', 'error');
    return;
  }

  try {
    const data = JSON.parse(jsonText);
    let migratedCount = 0;

    // Мигрируем избранное
    if (data.favorites && Array.isArray(data.favorites)) {
      localStorage.setItem('favorites', JSON.stringify(data.favorites));
      migratedCount += data.favorites.length;
      log(`Мигрировано ${data.favorites.length} записей избранного`, 'success');
    }

    // Мигрируем корзину
    if (data.cart && Array.isArray(data.cart)) {
      localStorage.setItem('cart', JSON.stringify(data.cart));
      migratedCount += data.cart.length;
      log(`Мигрировано ${data.cart.length} записей корзины`, 'success');
    }

    // Мигрируем заказы
    if (data.orders && Array.isArray(data.orders)) {
      localStorage.setItem('orders', JSON.stringify(data.orders));
      migratedCount += data.orders.length;
      log(`Мигрировано ${data.orders.length} записей заказов`, 'success');
    }

    // Мигрируем пользователей (для тестирования)
    if (data.users && Array.isArray(data.users)) {
      localStorage.setItem('migratedUsers', JSON.stringify(data.users));
      migratedCount += data.users.length;
      log(
        `Мигрировано ${data.users.length} записей пользователей (для тестирования)`,
        'info'
      );
    }

    log(`Миграция завершена! Всего записей: ${migratedCount}`, 'success');
    showCurrentData();
  } catch (error) {
    log(`Ошибка при парсинге JSON: ${error.message}`, 'error');
  }
}

function clearAllData() {
  localStorage.removeItem('favorites');
  localStorage.removeItem('cart');
  localStorage.removeItem('orders');
  localStorage.removeItem('migratedUsers');
  log('Все данные LocalStorage очищены', 'info');
  showCurrentData();
}

function showCurrentData() {
  const result = document.getElementById('current-data');
  const data = {
    favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
    cart: JSON.parse(localStorage.getItem('cart') || '[]'),
    orders: JSON.parse(localStorage.getItem('orders') || '[]'),
    migratedUsers: JSON.parse(localStorage.getItem('migratedUsers') || '[]'),
  };

  result.innerHTML = `
          <h3>Избранное (${data.favorites.length} записей)</h3>
          <pre>${JSON.stringify(data.favorites, null, 2)}</pre>
          
          <h3>Корзина (${data.cart.length} записей)</h3>
          <pre>${JSON.stringify(data.cart, null, 2)}</pre>
          
          <h3>Заказы (${data.orders.length} записей)</h3>
          <pre>${JSON.stringify(data.orders, null, 2)}</pre>
          
          <h3>Пользователи (${data.migratedUsers.length} записей)</h3>
          <pre>${JSON.stringify(data.migratedUsers, null, 2)}</pre>
      `;
}

function log(message, type = 'info') {
  const result = document.getElementById('migration-result');
  const timestamp = new Date().toLocaleTimeString();
  result.innerHTML += `<div class="${type}">[${timestamp}] ${message}</div>`;
  result.scrollTop = result.scrollHeight;
}

// Инициализация
window.onload = function () {
  log('Страница миграции загружена', 'info');
  showCurrentData();
};
