import { renderBreadcrumbs } from './components/Breadcrumbs.js';
import { renderUserListScreen } from './screens/UserList.js';
// НОВЫЕ ИМПОРТЫ:
import { renderTodosScreen } from './screens/Todos.js';
import { renderPostsScreen } from './screens/Posts.js';
import { renderCommentsScreen } from './screens/Comments.js';

const appRoot = document.getElementById('app-root');

// Карта маршрутов: [хэш-фрагмент]: функция рендеринга
const routes = {
    '#users': renderUserListScreen,
    // НОВЫЕ МАРШРУТЫ:
    '#users#todos': renderTodosScreen,
    '#users#posts': renderPostsScreen,
    '#users#posts#comments': renderCommentsScreen
};

/**
 * Основная функция роутера. Определяет, какой экран рендерить.
 */
async function router() {
    appRoot.innerHTML = ''; // Очищаем контейнер

    const hash = window.location.hash || '#users'; // Дефолтный маршрут
    const routeKey = hash.split('?')[0]; // Берем только "корень" маршрута

    // 1. Рендер хлебных крошек
    const breadcrumbs = renderBreadcrumbs();
    appRoot.appendChild(breadcrumbs);

    // 2. Рендер содержимого экрана
    const renderFunc = routes[routeKey];
    
    if (renderFunc) {
        try {
            const screenContent = await renderFunc();
            appRoot.appendChild(screenContent);
        } catch (error) {
            console.error('Ошибка рендеринга экрана:', error);
            appRoot.appendChild(document.createTextNode('Ошибка загрузки страницы.'));
        }
    } else {
        appRoot.appendChild(document.createTextNode(`Страница не найдена для маршрута: ${routeKey}`));
    }
}

/**
 * Запускает роутер и подписывается на изменения хэша.
 */
export function initRouter() {
    // 1. Слушаем событие изменения хэша
    window.addEventListener('hashchange', router);
    
    // 2. Первый запуск роутера при загрузке страницы
    window.addEventListener('load', router);
}