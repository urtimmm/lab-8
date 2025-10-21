const cartDiv = document.getElementById('cart');
const totalDiv = document.getElementById('total');

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
    cartDiv.innerHTML =
      "<p>⚠️ Для просмотра корзины необходимо <a href='login.html'>авторизоваться</a></p>";
    totalDiv.style.display = 'none';
    document.querySelector("button[onclick='checkout()']").style.display =
      'none';
    return false;
  }
  currentUser = JSON.parse(userData);
  return true;
}

// Функции для работы с LocalStorage
function getCartFromStorage() {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

function saveCartToStorage(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function getOrdersFromStorage() {
  const orders = localStorage.getItem('orders');
  return orders ? JSON.parse(orders) : [];
}

function saveOrdersToStorage(orders) {
  localStorage.setItem('orders', JSON.stringify(orders));
}

function loadCart() {
  if (!checkAuth()) {
    updateLoginButtonVisibility();
    return;
  }
  updateLoginButtonVisibility();

  try {
    const allCart = getCartFromStorage();
    const userCart = allCart.filter((item) => item.userId === currentUser.id);
    let total = 0;

    cartDiv.innerHTML = userCart.length
      ? userCart
          .map((p) => {
            total += p.price * p.quantity;
            return `
      <div class="card">
        <img src="${p.image}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p>${p.price} × ${p.quantity} = <b class="price">${(
              p.price * p.quantity
            ).toFixed(2)} BYN</b></p>
        <div class="actions">
          <button onclick="changeQty('${p.id}', ${
              p.quantity + 1
            })" class="qty-btn qty-plus" title="Увеличить количество">+</button>
          <button onclick="changeQty('${p.id}', ${
              p.quantity - 1
            })" class="qty-btn qty-minus" title="Уменьшить количество">-</button>
          <button onclick="removeCart('${
            p.id
          }')" class="btn-danger">Удалить</button>
        </div>
      </div>
    `;
          })
          .join('')
      : '<p>❌ Корзина пуста</p>';

    totalDiv.textContent = 'Итого: ' + total.toFixed(2) + ' BYN';
    totalDiv.style.display = userCart.length ? 'block' : 'none';
  } catch (error) {
    cartDiv.innerHTML = '<p>Ошибка загрузки корзины</p>';
    console.error(error);
  }
}

function changeQty(id, qty) {
  if (qty <= 0) return removeCart(id);

  try {
    const allCart = getCartFromStorage();
    const itemIndex = allCart.findIndex((item) => item.id === id);

    if (itemIndex !== -1) {
      allCart[itemIndex].quantity = qty;
      saveCartToStorage(allCart);

      // Добавляем анимацию пульсации к кнопке
      const clickedButton = event.target;
      if (clickedButton && clickedButton.classList.contains('qty-btn')) {
        clickedButton.classList.add('pulse');
        setTimeout(() => {
          clickedButton.classList.remove('pulse');
        }, 600);
      }

      loadCart();
    }
  } catch (error) {
    alert('❌ Ошибка при изменении количества');
    console.error(error);
  }
}

function removeCart(id) {
  if (!confirm('Удалить товар из корзины?')) return;

  try {
    // Добавляем анимацию пульсации к кнопке удаления
    const deleteButton = event.target;
    if (deleteButton && deleteButton.classList.contains('btn-danger')) {
      deleteButton.classList.add('pulse');
      setTimeout(() => {
        deleteButton.classList.remove('pulse');
      }, 600);
    }

    const allCart = getCartFromStorage();
    const updatedCart = allCart.filter((item) => item.id !== id);
    saveCartToStorage(updatedCart);
    loadCart();
  } catch (error) {
    alert('❌ Ошибка при удалении товара');
    console.error(error);
  }
}

function checkout() {
  if (!currentUser) {
    alert('Необходима авторизация!');
    return;
  }

  try {
    const allCart = getCartFromStorage();
    const cartItems = allCart.filter((item) => item.userId === currentUser.id);

    if (!cartItems.length) {
      alert('Корзина пуста!');
      return;
    }

    const order = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4), // Генерируем уникальный ID
      userId: currentUser.id,
      userName:
        currentUser.nickname || currentUser.fio?.first || currentUser.name,
      userEmail: currentUser.email,
      date: new Date().toISOString(),
      items: cartItems.map((item) => ({
        productId: item.productId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      total: cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      status: 'pending',
    };

    // Сохраняем заказ
    const allOrders = getOrdersFromStorage();
    allOrders.push(order);
    saveOrdersToStorage(allOrders);

    // Очищаем корзину пользователя
    const updatedCart = allCart.filter(
      (item) => item.userId !== currentUser.id
    );
    saveCartToStorage(updatedCart);

    alert('✅ Заказ успешно оформлен!');
    loadCart();
  } catch (error) {
    alert('❌ Ошибка при оформлении заказа');
    console.error(error);
  }
}

loadCart();

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
