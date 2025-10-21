/* ===== Прелоадер ===== */
window.addEventListener('load', () => {
  const p = document.getElementById('preloader');
  if (p) setTimeout(() => p.setAttribute('hidden', ''), 250); // короткая задержка для плавности
});

/* ===== Бургер-меню с оверлеем и блокировкой скролла ===== */
(function () {
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('overlay');
  if (!burger || !menu || !overlay) return;

  const close = () => {
    burger.classList.remove('active');
    menu.classList.remove('open');
    overlay.classList.remove('show');
    document.body.classList.remove('locked');
    burger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    overlay.hidden = true;
  };
  const open = () => {
    burger.classList.add('active');
    menu.classList.add('open');
    overlay.classList.add('show');
    document.body.classList.add('locked');
    burger.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    overlay.hidden = false;
  };

  burger.addEventListener('click', () =>
    menu.classList.contains('open') ? close() : open()
  );
  overlay.addEventListener('click', close);
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
})();

/* ===== Слайдер (autoplay + arrows + dots, без jQuery) ===== */
(function () {
  const root = document.getElementById('heroSlider');
  if (!root) return;
  const track = root.querySelector('.slider__track');
  const slides = Array.from(root.querySelectorAll('.slide'));
  const prev = root.querySelector('.slider__prev');
  const next = root.querySelector('.slider__next');
  const dotsWrap = root.querySelector('.slider__dots');
  let i = 0,
    timer;

  const set = (idx) => {
    i = (idx + slides.length) % slides.length;
    track.style.transform = `translateX(-${i * 100}%)`;
    dotsWrap
      .querySelectorAll('button')
      .forEach((b, bi) => b.classList.toggle('active', bi === i));
  };
  slides.forEach((_, idx) => {
    const b = document.createElement('button');
    b.addEventListener('click', () => {
      set(idx);
      resetAutoplay();
    });
    dotsWrap.appendChild(b);
  });
  const nextSlide = () => set(i + 1);
  const prevSlide = () => set(i - 1);
  const start = () => (timer = setInterval(nextSlide, 3500));
  const stop = () => clearInterval(timer);
  const resetAutoplay = () => {
    stop();
    start();
  };

  next.addEventListener('click', () => {
    nextSlide();
    resetAutoplay();
  });
  prev.addEventListener('click', () => {
    prevSlide();
    resetAutoplay();
  });
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);

  set(0);
  start();
})();

/* ===== Плавная прокрутка с учётом фикс-хедера ===== */
(function () {
  const header = document.querySelector('.navbar');
  const offset = () => (header ? header.offsetHeight : 0) + 8;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a.smooth, .mobile-menu a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (!id.startsWith('#')) return;
    e.preventDefault();
    const el = document.querySelector(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - offset();
    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

/* ===== Reveal-анимации по скроллу ===== */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  els.forEach((el) => io.observe(el));
})();

/* ===== Parallax (3 слоя + обратное движение), уважаем reduced-motion ===== */
(function () {
  const sec = document.querySelector('.parallax');
  if (!sec) return;
  const back = sec.querySelector('.parallax__back');
  const mid = sec.querySelector('.parallax__mid');
  const front = sec.querySelector('.parallax__front');
  const rev = sec.querySelector('.parallax__reverse');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  let ticking = false;

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const r = sec.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementHeight = r.height;

        // Более плавный расчет прогресса
        const progress = Math.max(
          0,
          Math.min(1, (windowHeight - r.top) / (windowHeight + elementHeight))
        );

        // Применяем трансформации с улучшенной плавностью
        if (back) {
          back.style.transform = `translateY(${progress * 30}px)`;
        }
        if (mid) {
          mid.style.transform = `translate(-50%, ${progress * 80}px)`;
        }
        if (front) {
          front.style.transform = `translate(-55%, ${progress * 130}px)`;
        }
        if (rev) {
          rev.style.transform = `translateY(${-progress * 60}px)`;
        }

        ticking = false;
      });
      ticking = true;
    }
  };

  // Инициализация
  onScroll();

  // Оптимизированный обработчик скролла
  document.addEventListener('scroll', onScroll, { passive: true });

  // Обработчик изменения размера окна
  window.addEventListener('resize', onScroll, { passive: true });
})();

/* ===== Анимированные счётчики ===== */
(function () {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        io.unobserve(el);
        const target = +el.dataset.target || 0;
        const dur = 1200;
        const start = performance.now();
        const step = (t) => {
          const k = Math.min((t - start) / dur, 1);
          el.textContent = Math.floor(target * k).toLocaleString('ru-RU');
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((c) => io.observe(c));
})();

/* ===== Тосты ===== */
const toast = (() => {
  const wrap = document.getElementById('toasts');
  const make = (msg, type = 'info', timeout = 2400) => {
    if (!wrap) return;
    const t = document.createElement('div');
    t.className = `toast toast--${type}`;
    t.innerHTML = `<div class="toast__text">${msg}</div><button class="toast__close" aria-label="Закрыть">×</button>`;
    wrap.appendChild(t);
    const kill = () => t.remove();
    const tm = setTimeout(kill, timeout);
    t.querySelector('.toast__close').addEventListener('click', () => {
      clearTimeout(tm);
      kill();
    });
  };
  return {
    info: (m) => make(m, 'info'),
    success: (m) => make(m, 'success'),
    error: (m) => make(m, 'error'),
  };
})();

/* ===== Базовая система модалок ===== */
const modalsHost = document.getElementById('modals');
function openModal({
  title = '',
  body = '',
  actions = [],
  modalClass = '',
  headerClass = '',
  bodyClass = '',
  footClass = '',
}) {
  if (!modalsHost) return () => {};
  const m = document.createElement('div');
  m.className = 'modal open';

  // Создаем заголовок только если title не пустой
  const headerHTML = title
    ? `<div class="modal__head ${headerClass}"><strong>${title}</strong><button class="modal__close" aria-label="Закрыть">×</button></div>`
    : '';

  // Создаем modal__foot только если есть действия
  const footHTML =
    actions.length > 0 ? `<div class="modal__foot ${footClass}"></div>` : '';

  m.innerHTML = `
    <div class="modal__card ${modalClass}" role="dialog" aria-modal="true">
      ${headerHTML}
      <div class="modal__body ${bodyClass}">${body}</div>
      ${footHTML}
    </div>`;

  // Добавляем действия только если есть modal__foot
  if (actions.length > 0) {
    const foot = m.querySelector('.modal__foot');
    actions.forEach((a) => {
      const b = document.createElement('button');
      b.className = a.class || 'btn';
      b.textContent = a.text || 'OK';
      b.addEventListener('click', () => {
        a.onClick?.();
        close();
      });
      foot.appendChild(b);
    });
  }
  const close = () => {
    m.classList.remove('open');
    setTimeout(() => m.remove(), 150);
  };
  m.addEventListener('click', (e) => {
    if (e.target === m) close();
  });

  // Добавляем обработчик для кнопки закрытия только если она существует
  const closeBtn = m.querySelector('.modal__close');
  if (closeBtn) {
    closeBtn.addEventListener('click', close);
  }

  modalsHost.appendChild(m);
  return close;
}

/* Подтверждение */
function openConfirm({
  title = 'Подтверждение',
  message = 'Вы уверены?',
  onConfirm,
}) {
  openModal({
    title,
    body: `<p>${message}</p>`,
    actions: [
      { text: 'Отмена', class: 'btn-secondary' },
      { text: 'ОК', class: 'btn', onClick: onConfirm },
    ],
    modalClass: 'confirm-modal',
    headerClass: 'confirm-header',
    bodyClass: 'confirm-body',
    footClass: 'confirm-foot',
  });
}

// Делаем функцию глобальной
window.openConfirm = openConfirm;

/* Форма товара (create/edit) */
function openProductForm({ mode = 'create', data = null, onSubmit }) {
  const isEdit = mode === 'edit';
  const form = `
    <form id="prodForm" class="form" style="max-width:100%">
      <label>Название<input name="title" required value="${
        data?.title || ''
      }"></label>
      <label>Описание<textarea name="description" required>${
        data?.description || ''
      }</textarea></label>
      <label>Цена<input type="number" step="0.01" name="price" required value="${
        data?.price || ''
      }"></label>
      <label>Категория<input name="category" required value="${
        data?.category || ''
      }"></label>
      <label>URL изображения<input type="url" name="image" value="${
        data?.image || ''
      }"></label>
      <button class="btn" type="submit">${
        isEdit ? 'Сохранить' : 'Добавить'
      }</button>
    </form>`;
  const close = openModal({
    title: isEdit ? 'Редактирование товара' : 'Новый товар',
    body: form,
  });
  const el = document.getElementById('prodForm');
  el.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(el);
    const payload = Object.fromEntries(fd.entries());
    payload.price = parseFloat(payload.price);
    await onSubmit?.(payload);
    toast.success(isEdit ? 'Товар обновлён' : 'Товар добавлен');
    close();
  });
}

/* Детали товара */
function openProductDetails(p) {
  const body = `
    <div class="product-details-container">
      <img src="${p.image}" alt="${p.title}" class="product-details-image"/>
      <div class="product-details-content">
        <h3 class="product-details-title">${p.title}</h3>
        <p class="product-details-description">${p.description}</p>
        <p class="product-details-price">${(p.price || 0).toFixed(2)} BYN</p>
        <div class="product-details-actions">
          <button class="btn" data-action="cart" data-id="${
            p.id
          }" id="pdAdd">🛒 В корзину</button>
          <button class="btn-secondary" data-action="fav" data-id="${
            p.id
          }" id="pdFav">В избранное</button>
        </div>
      </div>
    </div>`;
  const close = openModal({ title: '📦 Детали товара', body });

  // Обработчик для кнопки "В корзину"
  document.getElementById('pdAdd').addEventListener('click', async (e) => {
    // Проверяем авторизацию
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.id) {
      toast.error('Нужна авторизация для добавления в корзину');
      return;
    }

    try {
      // Получаем корзину из localStorage
      const allCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = allCart.find(
        (item) => item.userId === currentUser.id && item.productId === p.id
      );

      if (existingItem) {
        // Увеличиваем количество
        existingItem.quantity += 1;
      } else {
        // Добавляем новый товар
        const cartItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
          userId: currentUser.id,
          productId: p.id,
          title: p.title,
          price: p.price,
          image: p.image,
          quantity: 1,
          addedAt: new Date().toISOString(),
        };
        allCart.push(cartItem);
      }

      // Сохраняем в localStorage
      localStorage.setItem('cart', JSON.stringify(allCart));

      // Показываем уведомление
      toast.success('Товар добавлен в корзину');

      // Закрываем модальное окно
      close();
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      toast.error('Ошибка добавления в корзину');
    }
  });

  // Обработчик для кнопки "В избранное"
  document.getElementById('pdFav').addEventListener('click', async (e) => {
    // Проверяем авторизацию
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.id) {
      toast.error('Нужна авторизация для добавления в избранное');
      return;
    }

    try {
      // Получаем избранное из localStorage
      const allFavorites = JSON.parse(
        localStorage.getItem('favorites') || '[]'
      );
      const existingItem = allFavorites.find(
        (item) => item.userId === currentUser.id && item.productId === p.id
      );

      if (existingItem) {
        toast.info('Товар уже в избранном');
        return;
      }

      // Добавляем новый товар в избранное
      const favItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
        userId: currentUser.id,
        productId: p.id,
        title: p.title,
        price: p.price,
        image: p.image,
        addedAt: new Date().toISOString(),
      };
      allFavorites.push(favItem);

      // Сохраняем в localStorage
      localStorage.setItem('favorites', JSON.stringify(allFavorites));

      // Показываем уведомление
      toast.success('Добавлено в избранное');

      // Закрываем модальное окно
      close();
    } catch (error) {
      console.error('Ошибка добавления в избранное:', error);
      toast.error('Ошибка добавления в избранное');
    }
  });
}

/* ===== Интерактивная медиагалерея (10+ картинок + уникальные звуки + видео) ===== */
(function () {
  const view = document.getElementById('galImage');
  const btnRandom = document.querySelector('.gal-btn[data-action="random"]');
  const btnPP = document.querySelector('.gal-btn[data-action="playpause"]');
  const vol = document.getElementById('galVolume');
  const videoBtn = document.getElementById('galVideoBtn');
  if (!view || !btnRandom || !btnPP) return;

  // Под твою структуру проекта используем папку img/
  const imgs = Array.from({ length: 10 }, (_, i) => `img/gallery/${i + 1}.jpg`);
  const sounds = Array.from(
    { length: 10 },
    (_, i) => new Audio(`img/audio/s${i + 1}.mp3`)
  );
  let idx = 0,
    playing = false;

  const fadeTo = (src) => {
    view.style.opacity = 0.4;
    setTimeout(() => {
      view.src = src;
      view.style.opacity = 1;
    }, 120);
  };
  const play = () => {
    playing = true;
    btnPP.setAttribute('aria-pressed', 'true');
    sounds[idx].currentTime = 0;
    sounds[idx].play();
  };
  const pause = () => {
    playing = false;
    btnPP.setAttribute('aria-pressed', 'false');
    sounds[idx].pause();
  };

  btnRandom.addEventListener('click', () => {
    sounds[idx].pause();
    const prev = idx;
    while (idx === prev) idx = Math.floor(Math.random() * imgs.length);
    fadeTo(imgs[idx]);
    if (playing) play();
  });
  btnPP.addEventListener('click', () => {
    playing ? pause() : play();
  });
  vol?.addEventListener('input', () => {
    sounds.forEach((a) => (a.volume = +vol.value));
  });
  vol?.dispatchEvent(new Event('input'));

  // Кнопка запуска видео — модалка с <video>
  videoBtn?.addEventListener('click', () => {
    openModal({
      title: 'Видео',
      body: `<video src="img/promo.mp4" controls autoplay style="width:100%;border-radius:12px"></video>`,
    });
  });
})();

/* ===== Карта в модалке (iframe) ===== */
(function () {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-modal="mapModal"]');
    if (!btn) return;
    openModal({
      title: 'Мы на карте',
      body: `
        <div style="width:100%;height:100%;position:relative;">
          <iframe 
            title="Карта" 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade"
            src="https://yandex.ru/map-widget/v1/?um=constructor%3A1b6d6f2c7e2&source=constructor"
            style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"
            allowfullscreen
          ></iframe>
        </div>
      `,
    });
  });
})();

/* ===== Отслеживание скролла для бургер меню ===== */
(function () {
  const burger = document.getElementById('burger');
  if (!burger) return;

  let ticking = false;
  const scrollThreshold = 50; // Порог скролла в пикселях

  const updateBurgerPosition = () => {
    const scrollY = window.scrollY;

    if (scrollY > scrollThreshold) {
      burger.classList.add('scrolled');
    } else {
      burger.classList.remove('scrolled');
    }

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(updateBurgerPosition);
      ticking = true;
    }
  };

  // Инициализация при загрузке страницы
  updateBurgerPosition();

  // Добавляем обработчик скролла
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ===== Экспорт хелперов ===== */
window.openProductForm = openProductForm;
window.openProductDetails = openProductDetails;
window.openConfirm = openConfirm;
window.toast = toast;
