/**
 * Утилита для создания DOM-элементов
 * @param {string} tag - Имя HTML-тега.
 * @param {object} attributes - Объект атрибутов, включая 'listeners' и 'className'.
 * @param {(HTMLElement|string)[]} children - Массив дочерних элементов или строк.
 * @returns {HTMLElement} Созданный элемент.
 */
export function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);

    Object.keys(attributes).forEach(key => {
        const value = attributes[key];

        if (key === 'listeners') {
            Object.keys(value).forEach(event => {
                element.addEventListener(event, value[event]);
            });
        } else if (key === 'className') {
            element.className = value;
        } else {
            element.setAttribute(key, value);
        }
    });

    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement) {
            element.appendChild(child);
        }
    });

    return element;
}

/**
 * Функция debounce для ограничения частоты вызова функции (совет)
 * @param {Function} func - Функция, которую нужно отложить.
 * @param {number} delay - Задержка в миллисекундах.
 */
export function debounce(func, delay = 300) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}