const form = document.getElementById('registerForm');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const passError = document.getElementById('passError');
const confirmError = document.getElementById('confirmError');
const birthInput = document.getElementById('birthdate');
const birthError = document.getElementById('birthError');
const submitBtn = document.getElementById('submitBtn');
const nickname = document.getElementById('nickname');
const generateNickBtn = document.getElementById('generateNick');

// ===== Прелоадер =====
window.addEventListener('load', () => {
  const p = document.getElementById('preloader');
  if (p) setTimeout(() => p.setAttribute('hidden', ''), 250); // короткая задержка для красоты
});

let nickAttempts = 0;

function validatePassword(p) {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
  return regex.test(p);
}

password.addEventListener('input', () => {
  passError.textContent = validatePassword(password.value)
    ? ''
    : 'Пароль должен быть 8-20 символов, содержать заглавную, строчную букву, цифру и спецсимвол.';
});

confirmPassword.addEventListener('input', () => {
  confirmError.textContent =
    password.value === confirmPassword.value ? '' : 'Пароли не совпадают!';
});

birthInput.addEventListener('input', () => {
  const date = new Date(birthInput.value);
  const now = new Date();
  const age = now.getFullYear() - date.getFullYear();
  birthError.textContent = age < 16 ? 'Регистрация с 16 лет!' : '';
});

function generateNickname() {
  const first = document.getElementById('firstName').value.slice(0, 3);
  const last = document.getElementById('lastName').value.slice(0, 3);
  const rand = Math.floor(Math.random() * 900 + 100);
  const suffix = ['_x', '_pro', '_rb', ''][Math.floor(Math.random() * 4)];
  return first + last + rand + suffix;
}

generateNickBtn.addEventListener('click', () => {
  if (nickAttempts < 5) {
    nickname.value = generateNickname();
    nickAttempts++;
  } else {
    nickname.readOnly = false;
  }
});

form.addEventListener('input', () => {
  submitBtn.disabled =
    !form.checkValidity() ||
    passError.textContent ||
    confirmError.textContent ||
    birthError.textContent;
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = {
    fio: {
      first: document.getElementById('firstName').value,
      last: document.getElementById('lastName').value,
      middle: document.getElementById('middleName').value,
    },
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    birthdate: birthInput.value,
    nickname: nickname.value,
    role: 'user',
    password: password.value,
    registeredAt: new Date().toISOString(),
  };
  await fetch('http://localhost:3001/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  alert('Регистрация успешна!');
  form.reset();
});
