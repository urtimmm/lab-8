const cartDiv = document.getElementById('cart');
const totalDiv = document.getElementById('total');

// ===== Прелоадер =====
window.addEventListener('load', () => {
  const p = document.getElementById('preloader');
  if (p) setTimeout(() => p.setAttribute('hidden', ''), 250); // короткая задержка для красоты
});

let currentUser = null;

// Функция управления видимостью кнопки "войти"
function updateLoginButtonVisibility() {
  const loginLink = document.getElementById('login-link');
  const mobileLoginLink = document.getElementById('mobile-login-link');
  const userIcon = document.getElementById('user-icon');
  const logoutBtn = document.getElementById('logout-btn');
  const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

  if (currentUser) {
    // Пользователь авторизован - скрываем кнопку "войти"
    if (loginLink) loginLink.style.display = 'none';
    if (mobileLoginLink) mobileLoginLink.style.display = 'none';

    // Показываем элементы для авторизованного пользователя
    if (userIcon) userIcon.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'block';
    if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'block';
  } else {
    // Пользователь не авторизован - показываем кнопку "войти"
    if (loginLink) loginLink.style.display = 'inline-block';
    if (mobileLoginLink) mobileLoginLink.style.display = 'block';

    // Скрываем элементы для авторизованного пользователя
    if (userIcon) userIcon.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'none';
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
          <button onclick="changeQty('${p.id}', ${p.quantity + 1})">+</button>
          <button onclick="changeQty('${p.id}', ${p.quantity - 1})">-</button>
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
