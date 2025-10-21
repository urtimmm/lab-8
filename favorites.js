const favDiv = document.getElementById('favorites');

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
    favDiv.innerHTML =
      "<p>⚠️ Для просмотра избранного необходимо <a href='login.html'>авторизоваться</a></p>";
    return false;
  }
  currentUser = JSON.parse(userData);
  return true;
}

// Функции для работы с LocalStorage
function getFavoritesFromStorage() {
  const favorites = localStorage.getItem('favorites');
  return favorites ? JSON.parse(favorites) : [];
}

function saveFavoritesToStorage(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function getCartFromStorage() {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

function saveCartToStorage(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function loadFavorites() {
  if (!checkAuth()) {
    updateLoginButtonVisibility();
    return;
  }
  updateLoginButtonVisibility();

  try {
    const allFavorites = getFavoritesFromStorage();
    const userFavorites = allFavorites.filter(
      (fav) => fav.userId === currentUser.id
    );

    favDiv.innerHTML = userFavorites.length
      ? userFavorites
          .map(
            (p) => `
      <div class="card">
        <img src="${p.image}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p class="price">${p.price} BYN</p>
        <div class="actions">
          <button onclick="removeFav('${p.id}')" class="btn-danger">Удалить</button>
          <button onclick="addToCart('${p.productId}')" class="btn">🛒 В корзину</button>
        </div>
      </div>
    `
          )
          .join('')
      : '<p>❌ Избранное пусто</p>';
  } catch (error) {
    favDiv.innerHTML = '<p>Ошибка загрузки избранного</p>';
    console.error(error);
  }
}

function removeFav(id) {
  if (!confirm('Удалить из избранного?')) return;

  try {
    const allFavorites = getFavoritesFromStorage();
    const updatedFavorites = allFavorites.filter((fav) => fav.id !== id);
    saveFavoritesToStorage(updatedFavorites);
    loadFavorites();
  } catch (error) {
    alert('❌ Ошибка при удалении');
    console.error(error);
  }
}

function addToCart(productId) {
  if (!currentUser) return;

  try {
    const allFavorites = getFavoritesFromStorage();
    const allCart = getCartFromStorage();

    // Находим товар в избранном
    const favItem = allFavorites.find(
      (fav) => fav.userId === currentUser.id && fav.productId === productId
    );

    if (!favItem) {
      alert('❌ Товар не найден в избранном');
      return;
    }

    // Проверяем, есть ли товар уже в корзине
    const existingCartItem = allCart.find(
      (item) => item.userId === currentUser.id && item.productId === productId
    );

    if (existingCartItem) {
      // Увеличиваем количество
      existingCartItem.quantity += 1;
      saveCartToStorage(allCart);
      alert('✅ Количество товара в корзине увеличено!');
      return;
    }

    // Добавляем новый товар в корзину
    const cartItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4), // Генерируем уникальный ID
      userId: currentUser.id,
      productId: favItem.productId,
      title: favItem.title,
      price: favItem.price,
      image: favItem.image,
      quantity: 1,
      addedAt: new Date().toISOString(),
    };

    allCart.push(cartItem);
    saveCartToStorage(allCart);
    alert('✅ Добавлено в корзину!');
  } catch (error) {
    alert('❌ Ошибка при добавлении в корзину');
    console.error(error);
  }
}

loadFavorites();

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
