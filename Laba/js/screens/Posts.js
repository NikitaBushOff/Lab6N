// js/screens/Posts.js
import { createElement, debounce } from '../components/Component.js';
import { fetchData } from '../api.js';

const LOCAL_POSTS_KEY = 'local_posts'; // Новый ключ для локальных постов
let allPosts = [];
let currentUserId = null;

//-----------------------------------
// ЛОГИКА ДАННЫХ И ХРАНЕНИЯ
//-----------------------------------

/**
 * Получает ID пользователя из URL-хэша.
 * @returns {number|null} ID пользователя.
 */
function getUserIdFromHash() {
    const hash = window.location.hash;
    // Может быть положительным (API) или отрицательным (локальный)
    const match = hash.match(/userId=(\d+|-\d+)/); 
    return match ? parseInt(match[1]) : null;
}

/**
 * Сохраняет новый пост в LocalStorage.
 * Используется для добавления.
 * @param {object} newPost - Новый объект поста.
 */
function saveNewLocalPost(newPost) {
    const localPosts = JSON.parse(localStorage.getItem(LOCAL_POSTS_KEY) || '[]');
    localPosts.push(newPost);
    localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(localPosts));
}

/**
 * Получает данные о постах из API и LocalStorage.
 */
async function loadPostsData(userId) {
    // 1. Данные из API (только если пользователь API)
    const apiPosts = userId > 0 ? await fetchData(`/posts?userId=${userId}`) : [];
    
    // 2. Данные из LocalStorage
    const localPosts = JSON.parse(localStorage.getItem(LOCAL_POSTS_KEY) || '[]');
    // Фильтруем локальные посты только для текущего пользователя
    const userLocalPosts = localPosts.filter(p => p.userId === userId);
    
    allPosts = [...apiPosts, ...userLocalPosts];
    return allPosts;
}

//-----------------------------------
// ОБРАБОТЧИКИ СОБЫТИЙ И РЕНДЕРИНГ
//-----------------------------------

/**
 * Обрабатывает форму добавления нового поста.
 */
function handleAddPost(e, listContainer) {
    e.preventDefault();

    const form = e.target;
    const titleInput = form.elements.title;
    const bodyInput = form.elements.body;
    
    if (!titleInput.value || !bodyInput.value) {
        alert("Заголовок и текст поста не могут быть пустыми.");
        return;
    }

    // Создаем новый пост с фиктивным ID (отрицательным)
    const newPost = {
        userId: currentUserId,
        id: Date.now() * -1, 
        title: titleInput.value,
        body: bodyInput.value
    };
    
    // 1. Добавляем в общий список и сохраняем в LocalStorage
    allPosts.push(newPost);
    saveNewLocalPost(newPost);
    
    // 2. Очищаем форму
    form.reset();
    
    // 3. Перерисовываем список
    listContainer.innerHTML = '';
    listContainer.appendChild(renderPostList(allPosts));
}


/**
 * Рендерит список постов.
 * (В этой версии не реализовано отображение комментариев)
 */
function renderPostList(posts) {
    if (posts.length === 0) {
        return createElement('p', { style: 'text-align: center; color: #999;' }, ['Посты не найдены.']);
    }

    return createElement('ul', { className: 'card-list post-list' }, posts.map(post => {
        const isLocal = post.id < 0;
        
        // Ссылка на комментарии
        const linkToComments = createElement('a', {
            href: `#users#posts#comments?postId=${post.id}`,
            style: 'margin-right: 15px; font-weight: 500;'
        }, ['[Комментарии]']);
        
        return createElement('li', { style: 'flex-direction: column; align-items: flex-start;' }, [
            createElement('div', { style: 'margin-bottom: 5px; font-size: 1.1em;' }, [
                createElement('strong', {}, [post.title]),
                isLocal ? createElement('span', { style: 'color: #007bff; margin-left: 10px; font-weight: bold;' }, ['(ЛОКАЛЬНЫЙ)']) : null
            ]),
            createElement('p', { style: 'font-size: 0.9em; color: #555; margin-bottom: 10px;' }, [post.body]),
            createElement('div', { style: 'margin-top: 5px;' }, [
                linkToComments
            ])
        ]);
    }));
}

/**
 * Рендерит форму добавления поста (только для локальных пользователей).
 */
function renderAddPostForm(listContainer) {
    const form = createElement('form', { 
        listeners: { submit: (e) => handleAddPost(e, listContainer) },
        style: 'display: flex; flex-direction: column; gap: 10px; margin-bottom: 30px; padding: 20px; border: 1px solid #ccc; border-radius: 4px;'
    }, [
        createElement('input', { type: 'text', name: 'title', placeholder: 'Заголовок поста', required: true }),
        createElement('textarea', { name: 'body', placeholder: 'Текст поста', required: true, rows: 4 }),
        createElement('button', { type: 'submit', style: 'background-color: #f44336; color: white; border: none; padding: 10px; cursor: pointer;' }, ['➕ Добавить Пост'])
    ]);
    
    return createElement('div', { className: 'add-post-form-container' }, [
        createElement('h3', {}, ['Добавить Новый Пост']),
        form
    ]);
}


/**
 * Главная функция рендеринга экрана Posts.
 */
export async function renderPostsScreen() {
    currentUserId = getUserIdFromHash();
    if (!currentUserId) {
        return createElement('div', {}, ['Ошибка: Не указан ID пользователя.']);
    }

    await loadPostsData(currentUserId);
    
    const listContainer = createElement('div', {});
    
    const elements = [
        createElement('h2', {}, [`Посты для User ID: ${currentUserId}`])
    ];

    // Если пользователь локальный (ID отрицательный), добавляем форму
    if (currentUserId < 0) {
        const formElement = renderAddPostForm(listContainer);
        elements.push(formElement);
    }
    
    // Изначальный рендеринг списка
    listContainer.appendChild(renderPostList(allPosts));
    elements.push(listContainer);

    return createElement('div', {}, elements);
}