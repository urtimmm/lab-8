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
          <button onclick="removeFav('${p.id}')" class="btn-secondary" data-action="fav">Удалить</button>
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

// Функция для получения имени пользователя
function getUserName(user) {
  if (!user) return '';

  // Если fio - объект, собираем полное имя
  if (user.fio && typeof user.fio === 'object') {
    const { first = '', last = '', middle = '' } = user.fio;
    const nameParts = [first, middle, last].filter(
      (part) => part && part.trim()
    );
    return nameParts.join(' ').trim();
  }

  // Если fio - строка
  if (user.fio && typeof user.fio === 'string') {
    return user.fio;
  }

  // Если есть name
  if (user.name) {
    return user.name;
  }

  return '';
}

// Функция получения перевода из window.i18Obj
function getI18n(key, fallback = '') {
  const currentLang = window.lang || 'ru';
  return window.i18Obj?.[currentLang]?.[key] || fallback;
}

// Обработчик иконки пользователя
const userIcon = document.getElementById('user-icon');
if (userIcon) {
  userIcon.addEventListener('click', () => {
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
            title: `⚠️ ${getI18n(
              'reset-confirm-title',
              'Подтверждение сброса'
            )}`,
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
}

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
