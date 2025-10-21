const usersAPI = 'http://localhost:3001/users';
const regForm = document.getElementById('registerForm');

regForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = {
    name: document.getElementById('regName').value,
    email: document.getElementById('regEmail').value,
    password: document.getElementById('regPass').value,
  };
  await fetch(usersAPI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  alert('✅ Регистрация прошла успешно!');
  regForm.reset();
});
