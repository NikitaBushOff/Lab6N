// js/components/Breadcrumbs.js

// ИСПРАВЛЕНО: Правильный импорт из Component.js
import { createElement } from './Component.js';

const ROUTES_MAP = {
    'users': 'Пользователи',
    'todos': 'Список Todos',
    'posts': 'Посты',
    'comments': 'Комментарии'
};

/**
 * Рендерит компонент "Хлебные крошки" на основе текущего URL-хэша.
 * @returns {HTMLElement} Элемент Breadcrumbs.
 */
export function renderBreadcrumbs() {
    const hash = window.location.hash.slice(1); // Убираем '#'
    const segments = hash.split('#').filter(s => s); // ['users', 'todos?userId=1']

    let path = '';
    const breadcrumbs = segments.map((segment, index) => {
        // Убираем параметры, если есть (e.g., 'todos?userId=1' -> 'todos')
        const [endpoint] = segment.split('?');
        const title = ROUTES_MAP[endpoint] || endpoint;

        // Строим полный путь для ссылки
        const currentSegment = index === 0 ? '#' + segment : '#' + path.slice(1) + '#' + segment;
        path = currentSegment;
        
        // Если это последний элемент, он не должен быть ссылкой
        if (index === segments.length - 1) {
            return createElement('span', { className: 'breadcrumb-item' }, [title]);
        } else {
            return createElement('a', { href: currentSegment, className: 'breadcrumb-item' }, [title]);
        }
    });

    // Вставляем разделители
    const itemsWithSeparators = breadcrumbs.reduce((acc, item) => {
        if (acc.length > 0) {
            acc.push(createElement('span', { className: 'separator' }, [' / ']));
        }
        acc.push(item);
        return acc;
    }, []);

    return createElement('nav', { className: 'breadcrumbs' }, itemsWithSeparators);
}