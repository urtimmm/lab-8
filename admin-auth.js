// Дополнительная защита админ-панели
document.addEventListener('DOMContentLoaded', function () {
  const userData = localStorage.getItem('currentUser');
  if (!userData) {
    alert('Необходима авторизация!');
    window.location.href = 'login.html';
    return;
  }

  const user = JSON.parse(userData);
  if (!user.role || user.role !== 'admin') {
    alert('Доступ запрещен! Только для администраторов.');
    window.location.href = 'catalog.html';
    return;
  }
});
