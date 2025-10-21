// Функция для получения имени пользователя (исправленная версия)
function getUserName(user) {
  if (!user) return '';

  // Если fio - объект, собираем полное имя
  if (user.fio && typeof user.fio === 'object') {
    const { first = '', last = '', middle = '' } = user.fio;
    const nameParts = [first, middle, last].filter(
      (part) => part && part.trim()
    );
    return nameParts.join(' ').trim();
  }

  // Если fio - строка
  if (user.fio && typeof user.fio === 'string') {
    return user.fio;
  }

  // Если есть name
  if (user.name) {
    return user.name;
  }

  return '';
}

// Функция для отображения результата
function showResult(title, user, result) {
  const resultDiv = document.getElementById('test-result');
  const outputDiv = document.getElementById('test-output');

  outputDiv.textContent = `${title}

Исходные данные пользователя:
${JSON.stringify(user, null, 2)}

Результат getUserName():
"${result}"

Статус: ${result === '[object Object]' ? '❌ ОШИБКА' : '✅ ИСПРАВЛЕНО'}`;

  resultDiv.style.display = 'block';
  resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// Тестовые сценарии
function testScenario1() {
  const user = {
    id: '1',
    fio: {
      first: 'Иван',
      last: 'Иванов',
      middle: 'Иванович',
    },
    email: 'ivan@example.com',
  };

  const result = getUserName(user);
  showResult('Сценарий 1: Объект fio', user, result);
}

function testScenario2() {
  const user = {
    id: '2',
    fio: 'Петр Петров',
    email: 'petr@example.com',
  };

  const result = getUserName(user);
  showResult('Сценарий 2: Строка fio', user, result);
}

function testScenario3() {
  const user = {
    id: '3',
    name: 'Сергей Сергеев',
    email: 'sergey@example.com',
  };

  const result = getUserName(user);
  showResult('Сценарий 3: Только name', user, result);
}

function testScenario4() {
  const user = {
    id: '4',
    email: 'empty@example.com',
  };

  const result = getUserName(user);
  showResult('Сценарий 4: Пустой пользователь', user, result);
}

// Демонстрация проблемы (старый способ)
function demonstrateOldProblem() {
  const user = {
    id: '5',
    fio: {
      first: 'Анна',
      last: 'Петрова',
      middle: 'Сергеевна',
    },
    email: 'anna@example.com',
  };

  // Старый способ (проблемный)
  const oldWay = user.fio || user.name || '';

  // Новый способ (исправленный)
  const newWay = getUserName(user);

  const resultDiv = document.getElementById('test-result');
  const outputDiv = document.getElementById('test-output');

  outputDiv.textContent = `Демонстрация проблемы:

Исходные данные:
${JSON.stringify(user, null, 2)}

Старый способ (user.fio || user.name || ''):
"${oldWay}"

Новый способ (getUserName(user)):
"${newWay}"

Статус: ${oldWay === '[object Object]' ? '❌ ПРОБЛЕМА' : '✅ ИСПРАВЛЕНО'}`;

  resultDiv.style.display = 'block';
  resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// Добавляем кнопку для демонстрации проблемы
document.addEventListener('DOMContentLoaded', () => {
  const scenariosDiv = document.querySelector('.test-scenarios');
  const problemDiv = document.createElement('div');
  problemDiv.className = 'test-scenario';
  problemDiv.innerHTML = `
              <h3>⚠️ Демонстрация проблемы</h3>
              <p>Показать, как выглядел старый способ</p>
              <button class="test-btn" onclick="demonstrateOldProblem()">Показать проблему</button>
          `;
  scenariosDiv.appendChild(problemDiv);
});
