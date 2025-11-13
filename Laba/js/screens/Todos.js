import { createElement, debounce } from '../components/Component.js';
import { fetchData } from '../api.js';

const LOCAL_STORAGE_KEY = 'local_todos';
let allTodos = [];
let currentUserId = null;
let showCompletedOnly = false; 

//-----------------------------------
// ЛОГИКА ДАННЫХ И ХРАНЕНИЯ
//-----------------------------------

/**
 * Извлекает ID пользователя из URL-хэша.
 */
function getUserIdFromHash() {
    const hash = window.location.hash;
    const match = hash.match(/userId=(\d+|-\d+)/); 
    return match ? parseInt(match[1]) : null;
}

/**
 * Получает данные о todos из API и LocalStorage.
 */
async function loadTodosData(userId) {
    const apiTodos = await fetchData(`/todos?userId=${userId}`);
    const localTodos = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const userLocalTodos = localTodos.filter(t => t.userId === userId);
    allTodos = [...apiTodos, ...userLocalTodos];
    return allTodos;
}

/**
 * Сохраняет весь массив локальных todos в LocalStorage (используется для создания и обновления).
 */
function updateLocalTodos(todosArray) {
    // Выбираем только те todos, которые являются локальными (id < 0)
    const localTodos = todosArray.filter(t => t.id < 0);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localTodos));
}

/**
 * НОВАЯ ФУНКЦИЯ: Удаляет локальную Todo по ID.
 */
function deleteLocalTodo(todoId, listContainer, searchInput) {
    // 1. Удаляем задачу из общего массива
    allTodos = allTodos.filter(todo => todo.id !== todoId);
    
    // 2. Обновляем LocalStorage, записывая только оставшиеся локальные задачи
    updateLocalTodos(allTodos); 
    
    // 3. Перерисовываем список, сохраняя текущие фильтры
    applyFiltersAndRender(searchInput.value, listContainer);
}

//-----------------------------------
// ОБРАБОТЧИКИ СОБЫТИЙ И РЕНДЕРИНГ
//-----------------------------------

/**
 * Применяет текущий фильтр и поисковый запрос к списку задач.
 */
function applyFiltersAndRender(query = '', listElement) {
    let filteredTodos = allTodos;

    // 1. Фильтр по статусу (чекбокс "Только завершенные")
    if (showCompletedOnly) {
        filteredTodos = filteredTodos.filter(todo => todo.completed);
    }
    
    // 2. Фильтр по поисковому запросу
    if (query) {
        const search = query.toLowerCase();
        filteredTodos = filteredTodos.filter(todo => todo.title.toLowerCase().includes(search));
    }

    listElement.innerHTML = '';
    listElement.appendChild(renderTodoList(filteredTodos, listElement));
}

/**
 * Обрабатывает поиск и фильтрует список (с использованием debounce).
 */
const handleSearch = debounce((query, listElement) => {
    applyFiltersAndRender(query, listElement);
}, 300);

/**
 * Обрабатывает фильтрацию по статусу "Завершено".
 */
function handleFilterByCompleted(checkbox, listElement, searchInput) {
    showCompletedOnly = checkbox.checked;
    applyFiltersAndRender(searchInput.value, listElement);
}

/**
 * Обрабатывает переключение статуса Todo (по клику на элемент).
 */
function handleToggleTodoStatus(todoId, listContainer, searchInput) {
    const todoToUpdate = allTodos.find(t => t.id === todoId);
    if (!todoToUpdate) return;

    todoToUpdate.completed = !todoToUpdate.completed;

    if (todoToUpdate.id < 0) {
        updateLocalTodos(allTodos); 
    }

    applyFiltersAndRender(searchInput.value, listContainer);
}

/**
 * Рендерит список todos.
 */
function renderTodoList(todos, listContainer) {
    const searchInput = document.querySelector('.search-container input[type="text"]');
    
    return createElement('ul', { className: 'card-list todo-list' }, todos.map(todo => {
        const isCompleted = todo.completed;
        const isLocal = todo.id < 0;

        // Кнопка УДАЛИТЬ ТОЛЬКО ДЛЯ ЛОКАЛЬНЫХ ЗАДАЧ
        const deleteButton = isLocal ? createElement('a', {
            href: '#',
            listeners: { 
                click: (e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); // Важно: предотвращает срабатывание handleToggleTodoStatus
                    deleteLocalTodo(todo.id, listContainer, searchInput); 
                } 
            },
            style: 'color: red; margin-left: 10px;'
        }, ['[Удалить]']) : null;


        return createElement('li', {
            className: isCompleted ? 'todo-completed' : 'todo-pending',
            style: `cursor: pointer; background-color: ${isCompleted ? '#e8f5e9' : '#ffebee'}; border-left: 5px solid ${isCompleted ? '#4caf50' : '#f44336'};`,
            listeners: { 
                // Переключение статуса по клику на элемент списка
                click: () => handleToggleTodoStatus(todo.id, listContainer, searchInput) 
            }
        }, [
            createElement('span', { style: `text-decoration: ${isCompleted ? 'line-through' : 'none'}; flex-grow: 1;` }, [
                todo.title + (isLocal ? ' (ЛОКАЛЬНАЯ)' : '')
            ]),
            createElement('span', { style: 'white-space: nowrap;' }, [
                isCompleted ? '✅ Готово' : '⏳ В работе',
                deleteButton // Добавляем кнопку удаления
            ])
        ]);
    }));
}

/**
 * Обрабатывает форму добавления новой Todo.
 */
function handleAddTodo(e, listContainer, searchInput) {
    e.preventDefault();
    const titleInput = e.target.elements.title;
    const completedInput = e.target.elements.completed; 
    
    if (!titleInput.value) return;

    const newTodo = {
        userId: currentUserId,
        id: Date.now() * -1, 
        title: titleInput.value,
        completed: completedInput ? completedInput.checked : false 
    };
    
    allTodos.push(newTodo);
    updateLocalTodos(allTodos); 
    
    titleInput.value = '';
    if (completedInput) completedInput.checked = false;

    applyFiltersAndRender(searchInput.value, listContainer);
}


/**
 * Главная функция рендеринга экрана Todos.
 */
export async function renderTodosScreen() {
    currentUserId = getUserIdFromHash();
    if (!currentUserId) {
        return createElement('div', {}, ['Ошибка: Не указан ID пользователя.']);
    }

    await loadTodosData(currentUserId);
    
    const listContainer = createElement('div', {});
    
    // 1. Строка поиска
    const searchInput = createElement('input', {
        type: 'text',
        placeholder: 'Поиск по заголовку Todo...'
    });
    searchInput.addEventListener('input', () => handleSearch(searchInput.value, listContainer));
    
    // 2. Чекбокс для ФИЛЬТРАЦИИ
    const filterCheckbox = createElement('input', { 
        type: 'checkbox', 
        name: 'filterCompleted',
        checked: showCompletedOnly 
    });
    filterCheckbox.addEventListener('change', (e) => handleFilterByCompleted(e.target, listContainer, searchInput));
    
    // Контейнер для поиска и фильтрации
    const filterAndSearchContainer = createElement('div', { 
        style: 'display: flex; gap: 20px; align-items: center; margin-bottom: 20px;' 
    }, [
        createElement('div', { className: 'search-container', style: 'flex-grow: 1;' }, [searchInput]),
        createElement('label', { style: 'white-space: nowrap;' }, [
            filterCheckbox,
            ' Только завершенные' 
        ])
    ]);
    
    // 3. Форма добавления Todo
    const todoForm = createElement('form', { 
        listeners: { submit: (e) => handleAddTodo(e, listContainer, searchInput) },
        style: 'display: flex; gap: 10px; align-items: center; margin-bottom: 20px;'
    }, [
        createElement('input', { type: 'text', name: 'title', placeholder: 'Введите текст новой Todo', required: true, style: 'flex-grow: 1;' }),
        createElement('label', { style: 'white-space: nowrap;' }, [
            createElement('input', { type: 'checkbox', name: 'completed' }),
            ' Завершено' 
        ]),
        createElement('button', { type: 'submit' }, ['➕ Добавить Todo'])
    ]);
    
    // Изначальный рендеринг списка
    listContainer.appendChild(renderTodoList(allTodos, listContainer));

    return createElement('div', {}, [
        createElement('h2', {}, [`Список Todos для User ID: ${currentUserId}`]),
        filterAndSearchContainer, 
        createElement('div', { className: 'add-form-container' }, [todoForm]),
        listContainer
    ]);
}