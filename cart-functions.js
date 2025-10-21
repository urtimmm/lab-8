// Функция оформления заказа
function checkout() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  if (!currentUser) {
    alert('Необходима авторизация!');
    return;
  }

  try {
    const allCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItems = allCart.filter((item) => item.userId === currentUser.id);

    if (!cartItems.length) {
      alert('Корзина пуста!');
      return;
    }

    const order = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
      userId: currentUser.id,
      userName:
        currentUser.nickname || currentUser.fio?.first || currentUser.name,
      userEmail: currentUser.email,
      date: new Date().toISOString(),
      items: cartItems.map((item) => ({
        productId: item.productId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      total: cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      status: 'pending',
    };

    // Сохраняем заказ
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    allOrders.push(order);
    localStorage.setItem('orders', JSON.stringify(allOrders));

    // Очищаем корзину пользователя
    const updatedCart = allCart.filter(
      (item) => item.userId !== currentUser.id
    );
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    alert('✅ Заказ успешно оформлен!');

    // Перезагружаем корзину если функция loadCart доступна
    if (typeof loadCart === 'function') {
      loadCart();
    }
  } catch (error) {
    alert('❌ Ошибка при оформлении заказа');
    console.error(error);
  }
}
