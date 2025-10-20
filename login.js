// ===== login.js с поддержкой i18n =====

const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const usersAPI = 'http://localhost:3001/users';

// Функция получения перевода
function getI18n(key, fallback = '') {
  const currentLang = window.lang || 'ru';
  return window.i18Obj?.[currentLang]?.[key] || fallback;
}

// ===== Прелоадер =====
window.addEventListener('load', () => {
  const p = document.getElementById('preloader');
  if (p) setTimeout(() => p.setAttribute('hidden', ''), 250);
});

// ===== Обработчик формы входа =====
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  console.log('Попытка входа:', email);

  try {
    const res = await fetch(`${usersAPI}?email=${encodeURIComponent(email)}`);

    if (!res.ok) {
      loginError.textContent = getI18n(
        'login-error-server',
        'Ошибка сервера. Проверьте, запущен ли json-server'
      );
      console.error('Статус ответа:', res.status);
      return;
    }

    const users = await res.json();
    console.log('Найдено пользователей:', users.length);

    if (users.length === 0) {
      loginError.textContent = getI18n(
        'login-error-not-found',
        'Пользователь с таким email не найден!'
      );
      return;
    }

    const user = users[0];
    console.log('Пользователь:', user.email, 'Роль:', user.role);

    if (user.password !== password) {
      loginError.textContent = getI18n(
        'login-error-password',
        'Неверный пароль!'
      );
      return;
    }

    // Сохранение пользователя
    localStorage.setItem(
      'currentUser',
      JSON.stringify({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        fio: user.fio,
      })
    );

    // Используем toast если доступен, иначе alert
    const successMsg = getI18n('login-success', 'Успешный вход!');
    if (window.toast && window.toast.success) {
      window.toast.success(successMsg);
    } else {
      alert(successMsg);
    }

    // Перенаправление в зависимости от роли
    setTimeout(() => {
      if (user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'catalog.html';
      }
    }, 500);
  } catch (error) {
    loginError.textContent = getI18n(
      'login-error-connection',
      'Ошибка подключения к серверу. Проверьте консоль.'
    );
    console.error('Ошибка:', error);
  }
});

// ===== Проверка авторизации при загрузке =====
window.addEventListener('DOMContentLoaded', () => {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const user = JSON.parse(currentUser);
    const confirmMsg = getI18n(
      'login-already-logged',
      'Вы уже авторизованы. Перейти в каталог?'
    );
    if (confirm(confirmMsg)) {
      window.location.href = 'catalog.html';
    }
  }
});
