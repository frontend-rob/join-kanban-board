/**
 * toggles the visibility of an element based on a condition.
 * 
 * @param {HTMLElement} element - the element to toggle visibility for
 * @param {boolean} shouldShow - if true, the element will be shown, otherwise hidden
 */
function toggleVisibility(element, shouldShow) {
    element.classList.toggle('hidden', !shouldShow);
    element.classList.toggle('show', shouldShow);
}


/**
 * toggles the visibility of icons based on the state of the input field.
 * if the input field is empty, the plus icon is shown and other icons are hidden, 
 * otherwise, the other icons are shown and the plus icon is hidden.
 */
function toggleIcons() {
    const inputField = document.getElementById('input-subtask');
    const iconWrapper = document.getElementById('edit-icons');
    const plusIcon = document.getElementById('plus-icon');
    const isInputEmpty = inputField.value.trim() === "";

    toggleVisibility(iconWrapper, !isInputEmpty);
    toggleVisibility(plusIcon, isInputEmpty);
}

/**
 * toggles the visibility of icons based on the state of the input field.
 * if the input field is empty, the plus icon is shown and other icons are hidden, 
 * otherwise, the other icons are shown and the plus icon is hidden.
 */
function toggleIconsEditTask() {
    const inputField = document.getElementById('input-subtask-edit-task');
    const iconWrapper = document.getElementById('edit-icons-edit-task');
    const plusIcon = document.getElementById('plus-icon-edit-task');
    const isInputEmpty = inputField.value.trim() === "";

    toggleVisibility(iconWrapper, !isInputEmpty);
    toggleVisibility(plusIcon, isInputEmpty);
}


/**
 * escapes input values to ensure that special characters are safely used in HTML attributes.
 * this will encode characters like double quotes, ampersands, etc.
 * 
 * @function
 * @param {string} text - the text to escape.
 * @returns {string} the escaped text.
 */
function escapeHTMLTags(text) {
    return text.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}


/**
 * adds a subtask to the list.
 * creates a new subtask HTML element and appends it to the subtask list.
 * also clears the input field and resets the icons.
 */
function addSubtask() {
    const inputField = document.getElementById('input-subtask');
    const subtaskText = inputField.value.trim();

    if (subtaskText === "") return;

    const escapedSubTaskText = escapeHTMLTags(subtaskText);

    const subtaskList = document.getElementById('subtask-list');
    const newSubtaskHTML = `
        <li class="subtask-item">
            <input type="text" value="${escapedSubTaskText}" class="subtask-edit-input" readonly tabindex="-1" onclick="preventFocus(event)">
            <div class="subtask-edit-icons">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256" onclick="editSubtask(this)">
                    <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path>
                </svg>
                <div class="edit-divider-vertical"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256" onclick="deleteSubtask(this)">
                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                </svg>
            </div>
        </li>
    `;

    subtaskList.insertAdjacentHTML('beforeend', newSubtaskHTML);

    inputField.value = "";
    toggleIcons();
    addDoubleClickListenerToSubtasks();
}



/**
 * adds a double-click event listener to all subtasks.
 * enables editing mode when a subtask item is double-clicked.
 */
function addDoubleClickListenerToSubtasks() {
    const subtaskItems = document.querySelectorAll('.subtask-item');

    subtaskItems.forEach(subtaskItem => {
        if (!subtaskItem.hasAttribute('data-doubleclick-bound')) {
            subtaskItem.addEventListener('dblclick', function () {
                const editIcon = subtaskItem.querySelector('.subtask-edit-icons svg');
                if (editIcon) {
                    editSubtask(editIcon);
                }
            });
            subtaskItem.setAttribute('data-doubleclick-bound', 'true');
        }
    });
}


/**
 * handles the enter key event in the input field.
 * prevents form submission and calls the addSubtask function when enter is pressed.
 */
function handleEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addSubtask();
    }
}


/**
 * enables editing mode for a subtask when the edit icon is clicked.
 * changes the edit icon to a save icon.
 */
function editSubtask(icon) {
    const subtaskItem = icon.closest('.subtask-item');
    const subtaskInput = subtaskItem.querySelector('.subtask-edit-input');

    if (!subtaskInput.readOnly) return;

    subtaskInput.readOnly = false;
    subtaskInput.tabIndex = 0;
    subtaskInput.focus();

    icon.outerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256" onclick="saveSubtask(this)">
            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
        </svg>
    `;
}


/**
 * saves the edited subtask when the save icon is clicked.
 * changes the save icon back to the edit icon.
 */
function saveSubtask(icon) {
    const subtaskItem = icon.closest('.subtask-item');
    const subtaskInput = subtaskItem.querySelector('.subtask-edit-input');

    subtaskInput.readOnly = true;
    subtaskInput.tabIndex = -1;

    icon.outerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256" onclick="editSubtask(this)">
            <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path>
        </svg>
    `;
}


/**
 * prevents focusing on a read-only input field.
 * this function is triggered by a click event on the input field.
 * @param {Event} event - the click event that triggered the function.
 */
function preventFocus(event) {
    const inputField = event.target;
    if (inputField.readOnly) {
        event.preventDefault();
    }
}


/**
 * deletes a subtask when the delete icon is clicked.
 * removes the entire subtask item from the list.
 * @param {HTMLElement} icon - the delete icon that was clicked.
 */
function deleteSubtask(icon) {
    icon.closest('.subtask-item').remove();
}


/**
 * clears the text in the subtask input field.
 * resets the input field and toggles the icons back to the default state.
 */
function clearSubtaskInput() {
    const inputField = document.getElementById('input-subtask');
    inputField.value = "";
    toggleIcons();
}


/**
 * clears the text in the subtask input field.
 * resets the input field and toggles the icons back to the default state.
 */
function clearSubtaskInputEditTask() {
    const inputField = document.getElementById('input-subtask-edit-task');
    inputField.value = "";
    toggleIconsEditTask();
}

/**
 * collects all subtasks from the current task form.
 * each subtask is stored with its text and a default status of 'unchecked'.
 * 
 * @returns {Array} list of subtasks with text and status
 */
function collectSubtasks() {
    const subtasks = [];
    const subtaskItems = document.querySelectorAll('.subtask-item');

    subtaskItems.forEach(item => {
        const subtaskText = item.querySelector('.subtask-edit-input').value;
        subtasks.push({
            text: subtaskText,
            status: 'unchecked'
        });
    });

    return subtasks;
}