// Функция для получения имени пользователя
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

// Функция для показа профиля
function showProfile() {
  const modal = document.getElementById('profile-modal');
  modal.style.display = 'flex';

  // Добавляем обработчики
  setupProfileHandlers();
}

// Функция для переключения темы
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
}

// Настройка обработчиков профиля
function setupProfileHandlers() {
  const form = document.getElementById('user-form');
  const resetBtn = document.getElementById('reset-settings');

  // Обработчик отправки формы
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Анимация загрузки
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Сохранение...';

    setTimeout(() => {
      // Показываем уведомление об успехе
      showNotification('Профиль успешно обновлён!', 'success');

      // Восстанавливаем кнопку
      submitBtn.classList.remove('loading');
      submitBtn.textContent = originalText;

      // Закрываем модальное окно
      setTimeout(() => {
        document.getElementById('profile-modal').style.display = 'none';
      }, 1000);
    }, 800);
  });

  // Обработчик сброса настроек
  resetBtn.addEventListener('click', () => {
    // Используем простой confirm для демо
    if (
      confirm(
        '⚠️ Подтверждение сброса\n\nВы уверены, что хотите сбросить все настройки? Это действие нельзя отменить.'
      )
    ) {
      // Показываем уведомление о сбросе
      showNotification('Сброс настроек...', 'warning');

      // Закрываем модальное окно профиля
      setTimeout(() => {
        document.getElementById('profile-modal').style.display = 'none';
      }, 1000);

      // Сброс через небольшую задержку
      setTimeout(() => {
        // Очищаем все данные localStorage
        localStorage.clear();

        // Устанавливаем значения по умолчанию
        localStorage.setItem('lang', 'ru');
        localStorage.setItem('theme', 'light');

        // Перезагружаем страницу
        location.reload();
      }, 1500);
    }
  });

  // Обработчик для кнопки закрытия
  const profileCloseBtn = document.querySelector('.profile-close');
  if (profileCloseBtn) {
    profileCloseBtn.addEventListener('click', () => {
      document.getElementById('profile-modal').style.display = 'none';
    });
  }

  // Закрытие модального окна по клику вне его
  document.getElementById('profile-modal').addEventListener('click', (e) => {
    if (e.target.id === 'profile-modal') {
      document.getElementById('profile-modal').style.display = 'none';
    }
  });
}

// Функция для показа уведомлений
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `profile-notification profile-notification-${type}`;
  notification.innerHTML = `
          <span>${type === 'success' ? '✅' : '⚠️'}</span>
          <span>${message}</span>
      `;

  const profileBody = document.querySelector('.profile-body');
  profileBody.insertBefore(notification, profileBody.firstChild);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // Добавляем обработчик для закрытия модального окна по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.getElementById('profile-modal').style.display = 'none';
    }
  });
});
