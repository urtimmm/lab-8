const feedbackAPI = 'http://localhost:3001/feedback';
const form = document.getElementById('feedbackForm');
const list = document.getElementById('feedbackList');

async function loadFeedback() {
  const res = await fetch(feedbackAPI);
  const data = await res.json();
  list.innerHTML = data.length
    ? data
        .map(
          (f) => `
    <div class="card">
      <h3>${f.name}</h3>
      <p>${f.message}</p>
      <small>${new Date(f.date).toLocaleString()}</small>
    </div>
  `
        )
        .join('')
    : '<p>Пока отзывов нет</p>';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const feedback = {
    name: document.getElementById('name').value,
    message: document.getElementById('message').value,
    date: new Date().toISOString(),
  };
  await fetch(feedbackAPI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedback),
  });
  form.reset();
  loadFeedback();
});

// Инициализация при загрузке страницы
loadFeedback();
