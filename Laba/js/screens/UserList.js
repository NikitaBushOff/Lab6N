// js/screens/UserList.js
import { createElement } from '../components/Component.js';
import { fetchData } from '../api.js';

const LOCAL_USERS_KEY = 'local_users'; 
let allUsers = [];

//-----------------------------------
// ЛОГИКА ДАННЫХ И ХРАНЕНИЯ
//-----------------------------------

/**
 * Получает данные о пользователях из API и LocalStorage.
 */
async function loadUsersData() {
    const apiUsers = await fetchData(`/users`); 
    const localUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    
    allUsers = [...apiUsers, ...localUsers];
    return allUsers;
}

/**
 * Сохраняет нового пользователя в LocalStorage.
 */
function saveNewLocalUser(newUser) {
    const localUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    localUsers.push(newUser);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
}

/**
 * НОВАЯ ФУНКЦИЯ: Удаляет локального пользователя по ID.
 */
function deleteLocalUser(userId, listContainer) {
    // 1. Удаляем пользователя из общего массива
    allUsers = allUsers.filter(user => user.id !== userId);
    
    // 2. Обновляем LocalStorage, записывая только оставшихся локальных пользователей
    const remainingLocalUsers = allUsers.filter(user => user.id < 0);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(remainingLocalUsers));
    
    // 3. Перерисовываем список
    listContainer.innerHTML = '';
    listContainer.appendChild(renderUserList(allUsers, listContainer));
}


/**
 * Обрабатывает форму добавления нового пользователя.
 */
function handleAddUser(e, listContainer) {
    e.preventDefault();

    const form = e.target;
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();

    if (!name || !email) {
        alert("Пожалуйста, заполните Имя и Email.");
        return;
    }

    const newUserId = Date.now() * -1;
    const newUser = {
        id: newUserId, 
        name: name,
        username: name.replace(/\s+/g, '_'), 
        email: email,
        address: { city: 'Локальный' }, 
        phone: 'N/A',
        website: 'N/A',
        company: { name: 'Локальная компания' }
    };
    
    allUsers.push(newUser);
    saveNewLocalUser(newUser);

    form.reset();

    listContainer.innerHTML = '';
    listContainer.appendChild(renderUserList(allUsers, listContainer));
}


//-----------------------------------
// РЕНДЕРИНГ
//-----------------------------------

/**
 * Рендерит форму для добавления нового пользователя.
 */
function renderAddUserForm(listContainer) {
    const form = createElement('form', { 
        listeners: { submit: (e) => handleAddUser(e, listContainer) },
        style: 'display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 30px; padding: 20px; border: 1px solid #ccc; border-radius: 4px;'
    }, [
        createElement('input', { type: 'text', name: 'name', placeholder: 'Имя', required: true, style: 'flex: 1 1 200px;' }),
        createElement('input', { type: 'email', name: 'email', placeholder: 'Email', required: true, style: 'flex: 1 1 200px;' }),
        createElement('button', { type: 'submit', style: 'flex-grow: 1; background-color: #3f51b5; color: white; border: none; padding: 10px; cursor: pointer;' }, ['➕ Добавить Пользователя'])
    ]);
    
    return createElement('div', { className: 'add-user-form-container' }, [
        createElement('h3', {}, ['Добавить Нового Пользователя']),
        form
    ]);
}


/**
 * Рендерит список пользователей.
 */
function renderUserList(users, listContainer) { // listContainer теперь передается
    if (users.length === 0) {
        return createElement('p', { style: 'text-align: center; color: #999;' }, ['Пользователи не найдены.']);
    }

    return createElement('ul', { className: 'card-list user-list' }, users.map(user => {
        const isLocal = user.id < 0; // Определяем локального пользователя по отрицательному ID

        // Ссылки на Посты и Todos для конкретного пользователя
        const linkToPosts = createElement('a', {
            href: `#users#posts?userId=${user.id}`,
            style: 'margin-right: 15px;'
        }, ['[Посты]']);
        
        const linkToTodos = createElement('a', {
            href: `#users#todos?userId=${user.id}`,
            style: 'margin-right: 15px;'
        }, ['[Задачи (Todos)]']);
        
        // Кнопка УДАЛИТЬ ТОЛЬКО ДЛЯ ЛОКАЛЬНЫХ ПОЛЬЗОВАТЕЛЕЙ
        const deleteButton = isLocal ? createElement('a', {
            href: '#',
            listeners: { click: (e) => { e.preventDefault(); deleteLocalUser(user.id, listContainer); } },
            style: 'color: red;'
        }, ['[Удалить]']) : null;


        return createElement('li', { style: 'flex-direction: column; align-items: flex-start;' }, [
            createElement('div', { style: 'margin-bottom: 5px;' }, [
                createElement('strong', {}, [user.name]),
                createElement('span', { style: 'color: #777; margin-left: 10px;' }, [`(@${user.username})`]),
                // Метка для локальных пользователей
                isLocal ? createElement('span', { style: 'color: #007bff; margin-left: 10px; font-weight: bold;' }, ['(ЛОКАЛЬНЫЙ)']) : null
            ]),
            createElement('div', { style: 'font-size: 0.9em; color: #555;' }, [
                `Город: ${user.address?.city || 'Не указан'}, Email: ${user.email}`
            ]),
            createElement('div', { style: 'margin-top: 10px;' }, [
                linkToPosts,
                linkToTodos,
                deleteButton // Добавляем кнопку удаления, если она существует
            ])
        ]);
    }));
}

/**
 * Главная функция рендеринга экрана UserList.
 */
export async function renderUserListScreen() {
    // 1. Загрузка данных
    const users = await loadUsersData(); 

    // 2. Создание контейнера для списка, который будем перерисовывать
    const listContainer = createElement('div', {});
    
    // 3. Рендеринг формы добавления, которая требует доступа к listContainer
    const formElement = renderAddUserForm(listContainer);

    // 4. Изначальный рендеринг списка
    listContainer.appendChild(renderUserList(users, listContainer));

    // 5. Сборка всего экрана
    return createElement('div', {}, [
        createElement('h2', {}, ['Список Пользователей']),
        formElement,
        createElement('h3', {}, ['Все Пользователи']),
        listContainer
    ]);
}