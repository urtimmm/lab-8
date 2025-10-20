const formFb = document.getElementById('feedbackForm');
const productSelect = document.getElementById('productSelect');
const reviewText = document.getElementById('reviewText');
const reviewError = document.getElementById('reviewError');

// ===== Прелоадер =====
window.addEventListener('load', () => {
  const p = document.getElementById('preloader');
  if (p) setTimeout(() => p.setAttribute('hidden', ''), 250); // короткая задержка для красоты
});

async function loadProducts() {
  const res = await fetch('http://localhost:3001/products');
  const data = await res.json();
  productSelect.innerHTML = data
    .map((p) => `<option value="${p.id}">${p.title}</option>`)
    .join('');
}
loadProducts();

reviewText.addEventListener('input', () => {
  reviewError.textContent =
    reviewText.value.length < 20 ? 'Минимум 20 символов!' : '';
});

formFb.addEventListener('submit', async (e) => {
  e.preventDefault();
  const feedback = {
    productId: productSelect.value,
    text: reviewText.value,
    userId: 1, // в реальном проекте берём текущего авторизованного пользователя
  };
  await fetch('http://localhost:3001/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedback),
  });
  alert('Спасибо за отзыв!');
  formFb.reset();
});
