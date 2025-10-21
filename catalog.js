document.addEventListener('DOMContentLoaded', () => {
  // ================== catalog.js ==================
  // Исправленная версия с корректной работой i18n

  const productsAPI = 'http://localhost:3001/products';

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

  // Переводы продуктов (для английского языка)
  const productTranslations = {
    1: {
      ru: {
        title: 'Смартфон Samsung Galaxy S24',
        description: 'Флагманский смартфон с отличной камерой',
      },
      en: {
        title: 'Samsung Galaxy S24 Smartphone',
        description: 'Flagship smartphone with excellent camera',
      },
    },
    2: {
      ru: {
        title: 'Ноутбук Lenovo IdeaPad',
        description: 'Производительный ноутбук для работы и учебы',
      },
      en: {
        title: 'Lenovo IdeaPad Laptop',
        description: 'Powerful laptop for work and study',
      },
    },
    3: {
      ru: {
        title: 'Наушники Sony WH-1000XM5',
        description: 'Беспроводные наушники с шумоподавлением',
      },
      en: {
        title: 'Sony WH-1000XM5 Headphones',
        description: 'Wireless headphones with noise cancellation',
      },
    },
    4: {
      ru: {
        title: 'Куртка зимняя мужская',
        description: 'Теплая и стильная куртка',
      },
      en: {
        title: "Men's Winter Jacket",
        description: 'Warm and stylish jacket',
      },
    },
    5: {
      ru: {
        title: 'Книга: Мастер и Маргарита',
        description: 'Классика русской литературы',
      },
      en: {
        title: 'Book: Master and Margarita',
        description: 'Classic of Russian literature',
      },
    },
    6: {
      ru: {
        title: 'Гантели 10 кг (пара)',
        description: 'Для домашних тренировок',
      },
      en: {
        title: '10 kg Dumbbells (pair)',
        description: 'For home workouts',
      },
    },
  };

  // Переводы категорий из db.json в ключи i18n
  const categoryMapping = {
    Electronics: 'category-electronics',
    Clothing: 'category-clothing',
    Books: 'category-books',
    Sports: 'category-sports',
  };

  // DOM элементы
  const catalogEl = document.getElementById('catalog');
  const categoriesEl = document.getElementById('categories');
  const paginationEl = document.getElementById('pagination');
  const searchEl = document.getElementById('search');
  const sortEl = document.getElementById('sort');

  // Состояние
  let allProducts = [];
  let view = [];
  let page = 1;
  const perPage = 8;
  let currentCategory = '';

  // Авторизация
  let currentUser = null;
  (function readAuth() {
    const u = localStorage.getItem('currentUser');
    if (u) currentUser = JSON.parse(u);
  })();

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

  // Функция получения перевода из window.i18Obj
  function getI18n(key, fallback = '') {
    const currentLang = window.lang || 'ru';
    return window.i18Obj?.[currentLang]?.[key] || fallback;
  }

  // Функция для получения перевода продукта
  function getProductText(id, field) {
    const currentLang = window.lang || 'ru';
    const stringId = String(id);
    const translations = productTranslations[stringId];

    // Для английского языка используем translations
    if (currentLang === 'en' && translations?.en?.[field]) {
      return translations.en[field];
    }

    // Для русского языка используем данные из JSON или translations
    if (translations?.ru?.[field]) {
      return translations.ru[field];
    }

    // Fallback: ищем в allProducts
    const numericId = parseInt(id);
    const jsonProduct = allProducts.find((p) => parseInt(p.id) === numericId);
    return jsonProduct?.[field] || '';
  }

  // Notify система
  const notify = {
    ok: (m) => {
      const msg = typeof m === 'string' ? getI18n(m, m) : m;
      window.toast?.success ? window.toast.success(msg) : alert(msg);
    },
    info: (m) => {
      const msg = typeof m === 'string' ? getI18n(m, m) : m;
      window.toast?.info ? window.toast.info(msg) : alert(msg);
    },
    err: (m) => {
      const msg = typeof m === 'string' ? getI18n(m, m) : m;
      window.toast?.error ? window.toast.error(msg) : alert(msg);
    },
  };

  // Загрузка товаров
  async function loadProducts() {
    try {
      const res = await fetch(productsAPI);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      allProducts = await res.json();
      renderCategories();
      applyFilters();
    } catch (e) {
      console.error('Ошибка загрузки товаров:', e);
      catalogEl.innerHTML = `<p>${getI18n(
        'load-error',
        'Ошибка загрузки каталога'
      )}: ${e.message}</p>`;
    }
  }

  // Рендер категорий
  function renderCategories() {
    const cats = Array.from(
      new Set(allProducts.map((p) => p.category).filter(Boolean))
    );

    // Кнопка "Все"
    const allButton = `
    <button data-cat="" class="${currentCategory === '' ? 'active' : ''}">
      ${getI18n('category-all', 'Все')}
    </button>
  `;

    // Кнопки категорий
    const catButtons = cats
      .map((c) => {
        const catKey = categoryMapping[c] || 'category-all';
        return `
      <button data-cat="${c}" class="${currentCategory === c ? 'active' : ''}">
        ${getI18n(catKey, c)}
      </button>
    `;
      })
      .join('');

    categoriesEl.innerHTML = allButton + catButtons;
  }

  // Применение фильтров
  function applyFilters() {
    const q = (searchEl?.value || '').trim().toLowerCase();
    const currentLang = window.lang || 'ru';

    view = allProducts.filter((p) => {
      const byCat = !currentCategory || p.category === currentCategory;

      if (!q) return byCat;

      // Поиск по переведенному тексту
      const title = getProductText(p.id, 'title').toLowerCase();
      const description = getProductText(p.id, 'description').toLowerCase();
      const byText = title.includes(q) || description.includes(q);

      return byCat && byText;
    });

    const s = sortEl?.value || '';
    if (s === 'price') {
      view.sort((a, b) => a.price - b.price);
    }
    if (s === 'title') {
      view.sort((a, b) => {
        const titleA = getProductText(a.id, 'title');
        const titleB = getProductText(b.id, 'title');
        return titleA.localeCompare(titleB);
      });
    }
    if (s === 'rating') {
      view.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    page = 1;
    render();
  }

  // Рендер каталога
  function render() {
    const total = view.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    if (page > pages) page = pages;

    const from = (page - 1) * perPage;
    const items = view.slice(from, from + perPage);

    catalogEl.innerHTML =
      items
        .map(
          (p) => `
    <div class="card reveal" data-id="${p.id}">
      <img src="${p.image}" alt="${getProductText(p.id, 'title')}">
      <h3>${getProductText(p.id, 'title')}</h3>
      <div class="card-description">
        <p>${getProductText(p.id, 'description') || ''}</p>
      </div>
      <span class="price">${(p.price || 0).toFixed(2)} BYN</span>
      <div class="actions">
        <button class="btn" data-action="details" data-id="${p.id}">
          ${getI18n('details-btn', 'Подробнее')}
        </button>
        <button class="btn" data-action="cart" data-id="${p.id}">
          ${getI18n('cart-btn', '🛒 В корзину')}
        </button>
        <button class="btn-secondary" data-action="fav" data-id="${p.id}">
          ${getI18n('fav-btn', '☆ В избранное')}
        </button>
      </div>
    </div>
  `
        )
        .join('') || `<p>${getI18n('no-items', 'Ничего не найдено')}</p>`;

    paginationEl.innerHTML = Array.from(
      { length: pages },
      (_, i) => `
    <button data-page="${i + 1}" class="${i + 1 === page ? 'active' : ''}">${
        i + 1
      }</button>
  `
    ).join('');

    requestAnimationFrame(() => {
      document
        .querySelectorAll('.reveal')
        .forEach((el) => el.classList.add('visible'));
    });
  }

  // Обработчик кликов по карточкам
  catalogEl.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const id = btn.dataset.id;

    // Ищем товар как строку и как число
    let product =
      allProducts.find((p) => p.id == id) ||
      allProducts.find((p) => p.id === id) ||
      allProducts.find((p) => p.id === +id);

    if (!product) return;

    if (btn.dataset.action === 'details') {
      if (window.openProductDetails) {
        window.openProductDetails(product);
      } else {
        const title = getProductText(id, 'title');
        const description = getProductText(id, 'description');
        const priceLabel = getI18n('price-label', 'Цена');
        notify.info(
          `${title}\n${description}\n${priceLabel}: ${(
            product.price || 0
          ).toFixed(2)} BYN`
        );
      }
    }

    if (btn.dataset.action === 'cart') {
      if (!currentUser) {
        notify.err(getI18n('auth-required', 'Нужна авторизация'));
        return;
      }
      try {
        const allCart = getCartFromStorage();
        const existingItem = allCart.find(
          (item) =>
            item.userId === currentUser.id && item.productId === product.id
        );

        if (existingItem) {
          // Увеличиваем количество
          existingItem.quantity += 1;
        } else {
          // Добавляем новый товар
          const cartItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
            userId: currentUser.id,
            productId: product.id,
            title: getProductText(product.id, 'title'),
            price: product.price,
            image: product.image,
            quantity: 1,
            addedAt: new Date().toISOString(),
          };
          allCart.push(cartItem);
        }

        saveCartToStorage(allCart);
        notify.ok(getI18n('cart-added', 'Добавлено в корзину'));
      } catch (err) {
        console.error(err);
        notify.err(getI18n('cart-error', 'Ошибка добавления в корзину'));
      }
    }

    if (btn.dataset.action === 'fav') {
      if (!currentUser) {
        notify.err(getI18n('auth-required', 'Нужна авторизация'));
        return;
      }
      try {
        const allFavorites = getFavoritesFromStorage();
        const existingItem = allFavorites.find(
          (item) =>
            item.userId === currentUser.id && item.productId === product.id
        );

        if (existingItem) {
          notify.info(getI18n('fav-exists', 'Уже в избранном'));
        } else {
          const favItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
            userId: currentUser.id,
            productId: product.id,
            title: getProductText(product.id, 'title'),
            price: product.price,
            image: product.image,
            addedAt: new Date().toISOString(),
          };
          allFavorites.push(favItem);
          saveFavoritesToStorage(allFavorites);
          notify.ok(getI18n('fav-added', 'Добавлено в избранное'));

          // Добавляем визуальную обратную связь
          btn.classList.add('added');
          setTimeout(() => {
            btn.classList.remove('added');
          }, 2000);
        }
      } catch (err) {
        console.error(err);
        notify.err(getI18n('fav-error', 'Ошибка добавления в избранное'));
      }
    }
  });

  // Обработчик пагинации
  paginationEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-page]');
    if (!btn) return;
    page = +btn.dataset.page;
    render();
  });

  // Обработчик категорий
  categoriesEl.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-cat]');
    if (!b) return;
    currentCategory = b.dataset.cat || '';
    categoriesEl
      .querySelectorAll('button')
      .forEach((x) => x.classList.toggle('active', x === b));
    applyFilters();
  });

  // Обработчики поиска и сортировки
  searchEl?.addEventListener('input', () => applyFilters());
  sortEl?.addEventListener('change', () => applyFilters());

  // КРИТИЧЕСКИ ВАЖНО: Функция для перерендера после смены языка
  window.reRenderCatalog = function () {
    console.log('reRenderCatalog called, current lang:', window.lang);
    if (allProducts.length > 0) {
      renderCategories();
      render(); // Перерисовываем товары с новыми переводами
    }
  };

  // Профиль пользователя
  const logoutBtn = document.getElementById('logout-btn');
  const userIcon = document.getElementById('user-icon');

  // Обновляем видимость кнопок при загрузке
  updateLoginButtonVisibility();

  if (currentUser) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('currentUser');
      location.reload();
    });

    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    if (mobileLogoutBtn) {
      mobileLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        location.reload();
      });
    }
  }

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

  userIcon?.addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (window.openModal) {
      openModal({
        title: getI18n('profile-title', 'Профиль'),
        body: `
        <div class="profile-modal">
          <div class="profile-header">
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
      `,
      });

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

          // Показываем уведомление об успехе
          const notification = document.createElement('div');
          notification.className =
            'profile-notification profile-notification-success';
          notification.innerHTML = `
            <span>✅</span>
            <span>${getI18n(
              'profile-updated',
              'Профиль успешно обновлён!'
            )}</span>
          `;

          const profileBody = document.querySelector('.profile-body');
          profileBody.insertBefore(notification, profileBody.firstChild);

          // Убираем уведомление через 3 секунды
          setTimeout(() => {
            notification.remove();
          }, 3000);

          // Восстанавливаем кнопку
          submitBtn.classList.remove('loading');
          submitBtn.textContent = originalText;

          // Закрываем модальное окно через небольшую задержку
          setTimeout(() => {
            if (window.closeModal) closeModal();
          }, 1000);
        }, 800);
      });

      document
        .getElementById('reset-settings')
        ?.addEventListener('click', () => {
          // Создаем кастомное модальное окно подтверждения
          const confirmModal = document.createElement('div');
          confirmModal.className = 'modal';
          confirmModal.style.display = 'flex';
          confirmModal.innerHTML = `
            <div class="modal__card" style="max-width: 400px;">
              <div class="modal__head">
                <strong>⚠️ ${getI18n(
                  'reset-confirm-title',
                  'Подтверждение сброса'
                )}</strong>
              </div>
              <div class="modal__body" style="padding: 20px;">
                <p style="margin-bottom: 20px; color: var(--text-color);">
                  ${getI18n(
                    'reset-confirm-message',
                    'Вы уверены, что хотите сбросить все настройки? Это действие нельзя отменить.'
                  )}
                </p>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                  <button id="reset-cancel" class="profile-btn profile-btn-secondary" style="flex: 0;">
                    ${getI18n('cancel', 'Отмена')}
                  </button>
                  <button id="reset-confirm" class="profile-btn profile-btn-danger" style="flex: 0;">
                    ${getI18n('reset-confirm', 'Да, сбросить')}
                  </button>
                </div>
              </div>
            </div>
          `;

          document.body.appendChild(confirmModal);

          // Обработчики для кнопок подтверждения
          document
            .getElementById('reset-cancel')
            .addEventListener('click', () => {
              document.body.removeChild(confirmModal);
            });

          document
            .getElementById('reset-confirm')
            .addEventListener('click', () => {
              // Показываем уведомление о сбросе
              const notification = document.createElement('div');
              notification.className =
                'profile-notification profile-notification-warning';
              notification.innerHTML = `
              <span>🔄</span>
              <span>${getI18n('resetting', 'Сброс настроек...')}</span>
            `;

              const profileBody = document.querySelector('.profile-body');
              profileBody.insertBefore(notification, profileBody.firstChild);

              // Сброс через небольшую задержку
              setTimeout(() => {
                localStorage.clear();
                location.reload();
              }, 1000);
            });
        });
    } else {
      alert(
        `${getI18n('profile-title', 'Профиль')}\n${getI18n('name', 'Имя')}: ${
          user.fio || user.name || ''
        }\n${getI18n('email', 'Email')}: ${user.email || ''}`
      );
    }
  });

  function initActiveNav() {
    const sections = document.querySelectorAll(
      '#catalog, #heroSlider, #about, #gallery, #map'
    );
    const navLinks = document.querySelectorAll('.jakor__nav a.smooth');

    const observerOptions = {
      root: null, // Use the viewport as the root
      rootMargin: '0px 0px -50% 0px', // Trigger when the section reaches the upper half of the viewport
      threshold: 0.1, // At least 10% of the section must be visible to trigger
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Remove 'active' from all nav links
          navLinks.forEach((link) => link.classList.remove('active'));

          // Add 'active' to the matching link
          const id = entry.target.getAttribute('id');
          const activeLink = document.querySelector(
            `.jakor__nav a[href="#${id}"]`
          );
          if (activeLink) {
            activeLink.classList.add('active');
          }
        }
      });
    }, observerOptions);

    // Observe each section/element
    sections.forEach((section) => {
      if (section) {
        // Safety check in case an ID is missing
        observer.observe(section);
      }
    });

    // Handle initial state based on URL hash (e.g., if page loads with #about)
    const hash = window.location.hash;
    if (hash) {
      const targetLink = document.querySelector(
        `.jakor__nav a[href="${hash}"]`
      );
      if (targetLink) {
        navLinks.forEach((link) => link.classList.remove('active'));
        targetLink.classList.add('active');
      }
    }
  }

  // Call the function after DOM is loaded (add this line below the function definition)
  loadProducts();
  initActiveNav();
});
