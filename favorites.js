const favAPI = 'http://localhost:3001/favorites';
const cartAPI = 'http://localhost:3001/cart';
const favDiv = document.getElementById('favorites');

// ===== Прелоадер =====
window.addEventListener('load', () => {
  const p = document.getElementById('preloader');
  if (p) setTimeout(() => p.setAttribute('hidden', ''), 250); // короткая задержка для красоты
});

let currentUser = null;

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

async function loadFavorites() {
  if (!checkAuth()) return;

  try {
    const res = await fetch(`${favAPI}?userId=${currentUser.id}`);
    const data = await res.json();

    favDiv.innerHTML = data.length
      ? data
          .map(
            (p) => `
      <div class="card">
        <img src="${p.image}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p class="price">${p.price} BYN</p>
        <div class="actions">
          <button onclick="removeFav(${p.id})" class="btn-danger">Удалить</button>
          <button onclick="addToCart(${p.productId})" class="btn">🛒 В корзину</button>
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

async function removeFav(id) {
  if (!confirm('Удалить из избранного?')) return;

  try {
    await fetch(`${favAPI}/${id}`, { method: 'DELETE' });
    loadFavorites();
  } catch (error) {
    alert('❌ Ошибка при удалении');
  }
}

async function addToCart(productId) {
  if (!currentUser) return;

  // Проверяем, есть ли товар уже в корзине
  const checkRes = await fetch(
    `${cartAPI}?userId=${currentUser.id}&productId=${productId}`
  );
  const existing = await checkRes.json();

  if (existing.length > 0) {
    // Увеличиваем количество
    const item = existing[0];
    await fetch(`${cartAPI}/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: item.quantity + 1 }),
    });
    alert('✅ Количество товара в корзине увеличено!');
    return;
  }

  // Получаем данные из избранного
  const favRes = await fetch(
    `${favAPI}?userId=${currentUser.id}&productId=${productId}`
  );
  const favItems = await favRes.json();

  if (favItems.length === 0) return;

  const favItem = favItems[0];

  const cartItem = {
    userId: currentUser.id,
    productId: favItem.productId,
    title: favItem.title,
    price: favItem.price,
    image: favItem.image,
    quantity: 1,
    addedAt: new Date().toISOString(),
  };

  try {
    await fetch(cartAPI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cartItem),
    });
    alert('✅ Добавлено в корзину!');
  } catch (error) {
    alert('❌ Ошибка при добавлении в корзину');
  }
}

loadFavorites();
