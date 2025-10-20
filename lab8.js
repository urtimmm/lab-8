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

    const onScroll = () => {
        const r = sec.getBoundingClientRect();
        const progress = 1 - Math.min(Math.max(((r.bottom > 0 ? r.top * -1 : 0) / (r.height || 1)), 0), 1);
        if (back) back.style.transform = `translateY(${progress * 25}px)`;       // slowly, increased from 20 to 25
        if (mid) mid.style.transform = `translate(-50%, ${progress * 75}px)`; // medium, increased from 60 to 75
        if (front) front.style.transform = `translate(-55%, ${progress * 125}px)`; // fast, increased from 100 to 125
        if (rev) rev.style.transform = `translateY(${-progress * 55}px)`;     // reverse direction, increased from 45 to 55
    };
    onScroll();
    document.addEventListener('scroll', onScroll, { passive: true });
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
function openModal({ title = '', body = '', actions = [] }) {
    if (!modalsHost) return () => { };
    const m = document.createElement('div');
    m.className = 'modal open';
    m.innerHTML = `
    <div class="modal__card" role="dialog" aria-modal="true">
      <div class="modal__head"><strong>${title}</strong><button class="modal__close" aria-label="Закрыть">×</button></div>
      <div class="modal__body">${body}</div>
      <div class="modal__foot"></div>
    </div>`;
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
    const close = () => {
        m.classList.remove('open');
        setTimeout(() => m.remove(), 150);
    };
    m.addEventListener('click', (e) => {
        if (e.target === m) close();
    });
    m.querySelector('.modal__close').addEventListener('click', close);
    modalsHost.appendChild(m);
    return close;
}

/* Подтверждение */
function openConfirm({ title = 'Подтверждение', message = 'Вы уверены?', onConfirm }) {
    openModal({
        title,
        body: `<p>${message}</p>`,
        actions: [
            { text: 'Отмена', class: 'btn-secondary' },
            { text: 'ОК', class: 'btn', onClick: onConfirm },
        ],
    });
}

/* Форма товара (create/edit) */
function openProductForm({ mode = 'create', data = null, onSubmit }) {
    const isEdit = mode === 'edit';
    const form = `
    <form id="prodForm" class="form" style="max-width:100%">
      <label>Название<input name="title" required value="${data?.title || ''}"></label>
      <label>Описание<textarea name="description" required>${data?.description || ''}</textarea></label>
      <label>Цена<input type="number" step="0.01" name="price" required value="${data?.price || ''}"></label>
      <label>Категория<input name="category" required value="${data?.category || ''}"></label>
      <label>URL изображения<input type="url" name="image" value="${data?.image || ''}"></label>
      <button class="btn" type="submit">${isEdit ? 'Сохранить' : 'Добавить'}</button>
    </form>`;
    const close = openModal({ title: isEdit ? 'Редактирование товара' : 'Новый товар', body: form });
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
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start">
      <img src="${p.image}" alt="${p.title}" style="width:100%;border-radius:12px;object-fit:cover"/>
      <div>
        <h3 style="margin:0 0 8px">${p.title}</h3>
        <p>${p.description}</p>
        <p class="price" style="margin:10px 0 16px">${(p.price || 0).toFixed(2)} BYN</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn" id="pdAdd">В корзину</button>
          <button class="btn-secondary" id="pdFav">В избранное</button>
        </div>
      </div>
    </div>`;
    const close = openModal({ title: 'Детали товара', body });
    document.getElementById('pdAdd').addEventListener('click', () => {
        toast.success('Товар добавлен в корзину');
        close();
    });
    document.getElementById('pdFav').addEventListener('click', () => {
        toast.info('Добавлено в избранное');
        close();
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
    const sounds = Array.from({ length: 10 }, (_, i) => new Audio(`img/audio/s${i + 1}.mp3`));
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


/* ===== Экспорт хелперов ===== */
window.openProductForm = openProductForm;
window.openProductDetails = openProductDetails;
window.openConfirm = openConfirm;
window.toast = toast;
