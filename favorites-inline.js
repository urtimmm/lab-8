const favAPI = 'http://localhost:3001/favorites';
const favDiv = document.getElementById('favorites');

async function loadFavorites() {
  const res = await fetch(favAPI);
  const data = await res.json();
  favDiv.innerHTML = data.length
    ? data
        .map(
          (p) => `
    <div class="card">
      <img src="${p.image}">
      <h3>${p.title}</h3>
      <p class="price">${p.price} BYN</p>
      <div class="actions">
        <button onclick="removeFav(${p.id})" class="btn-danger">Удалить</button>
        <button onclick="addToCart(${p.id})" class="btn">🛒 В корзину</button>
      </div>
    </div>
  `
        )
        .join('')
    : '<p>❌ Избранное пусто</p>';
}

async function removeFav(id) {
  await fetch(`${favAPI}/${id}`, { method: 'DELETE' });
  loadFavorites();
}

async function addToCart(id) {
  const res = await fetch(`${favAPI}/${id}`);
  const product = await res.json();

  const item = {
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
    quantity: 1,
  };

  await fetch('http://localhost:3001/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });

  alert('✅ Добавлено в корзину!');
}

// Инициализация при загрузке страницы
loadFavorites();
