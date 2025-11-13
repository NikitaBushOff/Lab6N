import { USERS_MAPPING, RU_POST_TITLES, RU_TODO_TITLES, RU_LOREM } from './ru_data.js';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

/**
 * Универсальная функция для получения данных с API и их локализации.
 * @param {string} endpoint - Например, '/users' или '/todos?userId=1'.
 */
export async function fetchData(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        if (!response.ok) {
            console.error('Ошибка API. Статус:', response.status);
            return [];
        }
        const data = await response.json();

        // 💡 ЛОКАЛИЗАЦИЯ ДАННЫХ (Подмена на русский контент)
        
        if (endpoint.startsWith('/users')) {
            // 1. Локализация списка пользователей
            return data.map(user => {
                // Если ID пользователя есть в нашей карте, используем русские данные
                const ruUser = USERS_MAPPING[user.id] || user;
                return {
                    ...user,
                    name: ruUser.name,
                    username: ruUser.username,
                    email: ruUser.email,
                    // Обновляем город в адресе
                    address: { ...user.address, city: ruUser.city || user.address.city }
                };
            });
        } 
        else if (endpoint.includes('/posts') && !endpoint.includes('/comments')) {
            // 2. Локализация постов (заголовки и текст)
            return data.map((post, index) => ({
                ...post,
                // Циклически выбираем заголовок из массива
                title: RU_POST_TITLES[index % RU_POST_TITLES.length] + ` (Пост ${post.id})`,
                body: RU_LOREM + `... (Оригинальный пост ID: ${post.id})`
            }));
        } 
        else if (endpoint.startsWith('/todos')) {
            // 3. Локализация задач (Todos)
            return data.map((todo, index) => ({
                ...todo,
                title: RU_TODO_TITLES[index % RU_TODO_TITLES.length] + ` (Задача ${todo.id})`
            }));
        }
        else if (endpoint.startsWith('/comments')) {
            // 4. Локализация комментариев
            return data.map((comment, index) => ({
                ...comment,
                name: `Комментарий ${index + 1} от ${USERS_MAPPING[comment.postId]?.name || 'Гостя'}`,
                body: RU_LOREM.substring(0, 150) + `... (Комм. ID: ${comment.id})`
            }));
        }

        // Если тип данных не определен, возвращаем как есть
        return data;

    } catch (error) {
        console.error('Ошибка получения данных:', error);
        return [];
    }
}