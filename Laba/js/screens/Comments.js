// js/screens/Comments.js
import { createElement } from '../components/Component.js';
import { fetchData } from '../api.js';

const LOCAL_COMMENTS_KEY = 'local_comments'; // Новый ключ для локальных комментариев
let allComments = [];
let currentPostId = null;

//-----------------------------------
// ЛОГИКА ДАННЫХ И ХРАНЕНИЯ
//-----------------------------------

/**
 * Получает ID поста из URL-хэша.
 * @returns {number|null} ID поста.
 */
function getPostIdFromHash() {
    const hash = window.location.hash;
    const match = hash.match(/postId=(\d+|-\d+)/); 
    return match ? parseInt(match[1]) : null;
}

/**
 * Сохраняет новый комментарий в LocalStorage.
 */
function saveNewLocalComment(newComment) {
    const localComments = JSON.parse(localStorage.getItem(LOCAL_COMMENTS_KEY) || '[]');
    localComments.push(newComment);
    localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(localComments));
}

/**
 * Получает данные о комментариях из API и LocalStorage.
 */
async function loadCommentsData(postId) {
    // 1. Данные из API (только если пост API, ID положительный)
    const apiComments = postId > 0 ? await fetchData(`/comments?postId=${postId}`) : [];
    
    // 2. Данные из LocalStorage
    const localComments = JSON.parse(localStorage.getItem(LOCAL_COMMENTS_KEY) || '[]');
    // Фильтруем локальные комментарии только для текущего поста
    const postLocalComments = localComments.filter(c => c.postId === postId);
    
    allComments = [...apiComments, ...postLocalComments];
    return allComments;
}

//-----------------------------------
// ОБРАБОТЧИКИ СОБЫТИЙ И РЕНДЕРИНГ
//-----------------------------------

/**
 * Обрабатывает форму добавления нового комментария.
 */
function handleAddComment(e, listContainer) {
    e.preventDefault();

    const form = e.target;
    const nameInput = form.elements.name;
    const emailInput = form.elements.email;
    const bodyInput = form.elements.body;
    
    if (!nameInput.value || !emailInput.value || !bodyInput.value) {
        alert("Пожалуйста, заполните все поля комментария.");
        return;
    }

    // Создаем новый комментарий с фиктивным ID (отрицательным)
    const newComment = {
        postId: currentPostId,
        id: Date.now() * -1, 
        name: nameInput.value,
        email: emailInput.value,
        body: bodyInput.value
    };
    
    // 1. Добавляем в общий список и сохраняем в LocalStorage
    allComments.push(newComment);
    saveNewLocalComment(newComment);
    
    // 2. Очищаем форму
    form.reset();
    
    // 3. Перерисовываем список
    listContainer.innerHTML = '';
    listContainer.appendChild(renderCommentList(allComments));
}


/**
 * Рендерит список комментариев.
 */
function renderCommentList(comments) {
    if (comments.length === 0) {
        return createElement('p', { style: 'text-align: center; color: #999;' }, ['Комментарии не найдены.']);
    }

    return createElement('ul', { className: 'card-list comment-list' }, comments.map(comment => {
        const isLocal = comment.id < 0;
        
        return createElement('li', { style: 'flex-direction: column; align-items: flex-start;' }, [
            createElement('div', { style: 'margin-bottom: 5px; font-size: 1.1em;' }, [
                createElement('strong', {}, [comment.name]),
                isLocal ? createElement('span', { style: 'color: #007bff; margin-left: 10px; font-weight: bold;' }, ['(ЛОКАЛЬНЫЙ)']) : null
            ]),
            createElement('div', { style: 'font-size: 0.9em; color: #777; margin-bottom: 5px;' }, [
                `Email: ${comment.email}`
            ]),
            createElement('p', { style: 'font-size: 0.9em; color: #333;' }, [comment.body])
        ]);
    }));
}

/**
 * Рендерит форму добавления комментария (всегда доступна для локальных постов).
 */
function renderAddCommentForm(listContainer) {
    const form = createElement('form', { 
        listeners: { submit: (e) => handleAddComment(e, listContainer) },
        style: 'display: flex; flex-direction: column; gap: 10px; margin-bottom: 30px; padding: 20px; border: 1px solid #ccc; border-radius: 4px;'
    }, [
        createElement('input', { type: 'text', name: 'name', placeholder: 'Ваше имя', required: true }),
        createElement('input', { type: 'email', name: 'email', placeholder: 'Ваш Email', required: true }),
        createElement('textarea', { name: 'body', placeholder: 'Текст комментария', required: true, rows: 4 }),
        createElement('button', { type: 'submit', style: 'background-color: #00bcd4; color: white; border: none; padding: 10px; cursor: pointer;' }, ['➕ Добавить Комментарий'])
    ]);
    
    return createElement('div', { className: 'add-comment-form-container' }, [
        createElement('h3', {}, ['Добавить Новый Комментарий']),
        form
    ]);
}


/**
 * Главная функция рендеринга экрана Comments.
 */
export async function renderCommentsScreen() {
    currentPostId = getPostIdFromHash();
    if (!currentPostId) {
        return createElement('div', {}, ['Ошибка: Не указан ID поста.']);
    }

    await loadCommentsData(currentPostId);
    
    const listContainer = createElement('div', {});
    
    const elements = [
        createElement('h2', {}, [`Комментарии для Post ID: ${currentPostId}`])
    ];

    // Форма добавления комментария доступна для всех постов.
    // Если пост API, комментарий просто локальный. Если пост локальный, то это логично.
    const formElement = renderAddCommentForm(listContainer);
    elements.push(formElement);
    
    // Изначальный рендеринг списка
    listContainer.appendChild(renderCommentList(allComments));
    elements.push(listContainer);

    return createElement('div', {}, elements);
}