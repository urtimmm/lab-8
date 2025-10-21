const cartDiv = document.getElementById('cart');
const totalDiv = document.getElementById('total');

let currentUser = null;

// Проверка авторизации
function checkAuth() {
  const userData = localStorage.getItem('currentUser');
  if (!userData) {
    cartDiv.innerHTML =
      "<p>⚠️ Для просмотра корзины необходимо <a href='login.html'>авторизоваться</a></p>";
    totalDiv.style.display = 'none';
    const checkoutBtn = document.querySelector("button[onclick='checkout()']");
    if (checkoutBtn) checkoutBtn.style.display = 'none';
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
    return;
  }

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

    const checkoutBtn = document.querySelector("button[onclick='checkout()']");
    if (checkoutBtn) {
      checkoutBtn.style.display = userCart.length ? 'block' : 'none';
    }
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

// Добавляем обработчик для кнопки оформления заказа
document.addEventListener('DOMContentLoaded', function () {
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', checkout);
  }
});

// Инициализация при загрузке страницы
loadCart();
