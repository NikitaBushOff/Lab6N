import { initRouter } from './router.js';

// Запускаем роутинг, который инициализирует все приложение
initRouter();

// Если хэш пуст при первом запуске, устанавливаем дефолтный маршрут
if (!window.location.hash) {
    window.location.hash = '#users';
}