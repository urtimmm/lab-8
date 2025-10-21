# Интернет-магазин MyShop

## Запуск проекта локально

### Предварительные требования

- Node.js (версия 14 или выше)
- Python 3 (для локального веб-сервера)

### Шаги для запуска:

1. **Установка зависимостей:**

   ```bash
   npm install
   ```

2. **Запуск JSON Server (бэкенд API):**

   ```bash
   npm start
   ```

   JSON Server будет доступен по адресу: http://localhost:3001

3. **Запуск веб-сервера (фронтенд):**
   ```bash
   python3 -m http.server 8080
   ```
   Веб-приложение будет доступно по адресу: http://localhost:8080

### Доступные страницы:

- **Главная страница:** http://localhost:8080/catalog.html
- **Каталог:** http://localhost:8080/catalog.html
- **Корзина:** http://localhost:8080/cart.html
- **Избранное:** http://localhost:8080/favorites.html
- **Заказы:** http://localhost:8080/orders.html
- **Отзывы:** http://localhost:8080/feedback.html
- **Регистрация:** http://localhost:8080/register.html
- **Вход:** http://localhost:8080/login.html
- **Админ панель:** http://localhost:8080/admin.html

### Тестовые аккаунты:

**Администратор:**

- Email: admin@myshop.com
- Пароль: Admin123!

**Пользователь:**

- Email: user@example.com
- Пароль: User123!

### API Endpoints:

- **Пользователи:** http://localhost:3001/users
- **Товары:** http://localhost:3001/products
- **Корзина:** http://localhost:3001/cart
- **Избранное:** http://localhost:3001/favorites
- **Заказы:** http://localhost:3001/orders
- **Отзывы:** http://localhost:3001/feedback

### Остановка серверов:

Для остановки серверов нажмите `Ctrl+C` в терминалах, где они запущены.

### Структура проекта:

- `db.json` - база данных JSON Server
- `*.html` - HTML страницы приложения
- `*.js` - JavaScript файлы
- `*.css` - стили
- `img/` - изображения и медиафайлы
