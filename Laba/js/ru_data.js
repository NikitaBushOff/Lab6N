// js/ru_data.js

// 1. Русские пользователи для подмены
export const USERS_MAPPING = {
    // ID: { name: 'Имя Фамилия', username: 'Логин', email: 'Email', city: 'Город' }
    1: { name: 'Иван Петров', username: 'Ivan_P', email: 'ivan.petrov@example.ru', city: 'Москва' },
    2: { name: 'Мария Смирнова', username: 'Mariya_S', email: 'm.smirnova@example.ru', city: 'Санкт-Петербург' },
    3: { name: 'Алексей Кузнецов', username: 'Alexey_K', email: 'alexey.k@example.ru', city: 'Екатеринбург' },
    4: { name: 'Дарья Васильева', username: 'Darya_V', email: 'd.vasilieva@example.ru', city: 'Новосибирск' },
    5: { name: 'Никита Савицкий', username: 'Nikita_S', email: 'n.savitsky@example.ru', city: 'Казань' }, //
    6: { name: 'Анна Гневчинская', username: 'Anna_G', email: 'a.gnevchinskaya@example.ru', city: 'Воронеж' }, //
    7: { name: 'Дмитрий Соколов', username: 'Dmitry_S', email: 'd.sokolov@example.ru', city: 'Краснодар' },
    8: { name: 'Ольга Букреева', username: 'Olga_B', email: 'o.bukreeva@example.ru', city: 'Самара' }, //
    9: { name: 'Тимофей Кузнецов', username: 'Timofey_K', email: 't.kuznetsov@example.ru', city: 'Ростов-на-Дону' }, //
    10: { name: 'Юлия Ярмольчик', username: 'Yulia_Ya', email: 'y.yarmolchik@example.ru', city: 'Пермь' } //
};

// 2. Шаблоны для перевода постов, todos и комментариев
export const RU_POST_TITLES = [
    'Срочный анализ данных проекта',
    'Обновление системы безопасности сервера',
    'Обзор новых технологий в веб-разработке',
    'План миграции базы данных на PostgreSQL',
    'Итоги прошедшего квартала и цели на следующий'
];

export const RU_TODO_TITLES = [
    'Написать отчёт по ошибкам в релизе',
    'Запланировать встречу с командой тестирования',
    'Проверить все ссылки на главной странице',
    'Сделать резервную копию рабочего проекта',
    'Изучить новый синтаксис ES2024'
];

export const RU_LOREM = `
    Это тестовый текст, который заменяет оригинальный 'lorem ipsum'. 
    Он используется для демонстрации того, как будет выглядеть контент на русском языке. 
    Текст предназначен исключительно для заполнения, и его содержание не несет смысловой нагрузки.
    Мы успешно локализовали данные для этого приложения.
`;