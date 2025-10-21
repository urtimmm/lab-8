const formFb = document.getElementById('feedbackForm');
const productSelect = document.getElementById('productSelect');
const reviewText = document.getElementById('reviewText');
const reviewError = document.getElementById('reviewError');

let currentUser = null;

// ===== Прелоадер =====
window.addEventListener('load', () => {
  const p = document.getElementById('preloader');
  if (p) setTimeout(() => p.setAttribute('hidden', ''), 250); // короткая задержка для красоты
});

// Проверка авторизации
function checkAuth() {
  const userData = localStorage.getItem('currentUser');
  if (!userData) {
    if (formFb) {
      formFb.innerHTML =
        "<p>⚠️ Для оставления отзывов необходимо <a href='login.html'>авторизоваться</a></p>";
    }
    return false;
  }
  currentUser = JSON.parse(userData);
  return true;
}

async function loadProducts() {
  const res = await fetch('http://localhost:3001/products');
  const data = await res.json();
  productSelect.innerHTML = data
    .map((p) => `<option value="${p.id}">${p.title}</option>`)
    .join('');
}

// Функция управления видимостью кнопки "войти" и админ-ссылки
function updateLoginButtonVisibility() {
  const loginLink = document.getElementById('login-link');
  const mobileLoginLink = document.getElementById('mobile-login-link');
  const userIcon = document.getElementById('user-icon');
  const logoutBtn = document.getElementById('logout-btn');
  const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
  const adminLink = document.getElementById('admin-link');
  const mobileAdminLink = document.getElementById('mobile-admin-link');

  if (currentUser) {
    // Пользователь авторизован - скрываем кнопку "войти"
    if (loginLink) loginLink.style.display = 'none';
    if (mobileLoginLink) mobileLoginLink.style.display = 'none';

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

    // Скрываем элементы для авторизованного пользователя
    if (userIcon) userIcon.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'none';

    // Скрываем админ-ссылку для неавторизованных пользователей
    if (adminLink) adminLink.style.display = 'none';
    if (mobileAdminLink) mobileAdminLink.style.display = 'none';
  }
}

// Инициализация
if (checkAuth()) {
  loadProducts();
}
updateLoginButtonVisibility();

reviewText.addEventListener('input', () => {
  reviewError.textContent =
    reviewText.value.length < 20 ? 'Минимум 20 символов!' : '';
});

formFb.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!checkAuth()) {
    return;
  }

  const feedback = {
    productId: productSelect.value,
    text: reviewText.value,
    userId: currentUser.id,
    userName: currentUser.nickname || currentUser.name || currentUser.email,
  };
  await fetch('http://localhost:3001/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedback),
  });
  alert('Спасибо за отзыв!');
  formFb.reset();
});
