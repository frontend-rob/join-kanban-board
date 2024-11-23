const overlayElement = document.getElementById('overlay');

/**
 * Opens the task overlay and displays task details.
 * 
 * @param {string} taskId - The ID of the task to be displayed.
 */
function getTaskOverlay(taskId) {
    const task = allTasks[taskId];

    if (task) {
        const overlayContent = getTaskOverlayContent(task);

        const overlayElement = document.getElementById('overlay');
        overlayElement.querySelector('.overlay-content').innerHTML = overlayContent;

        overlayElement.setAttribute('data-task-id', taskId);

        const subtasksHTML = getSubtasksHTML(task.subtasks, taskId);
        const subtasksContainer = overlayElement.querySelector(`.all-subtasks`);
        if (subtasksContainer) {
            subtasksContainer.id = `subtasks-${taskId}`;
            subtasksContainer.innerHTML = subtasksHTML;
        } else {
            console.error('Subtasks-Container nicht gefunden!');
        }

        const assignedToHTML = getAssignedToHTML(task.assigned_to);
        const personsContainer = overlayElement.querySelector('.persons');
        if (personsContainer) {
            personsContainer.innerHTML = assignedToHTML;
        } else {
            console.error('Persons-Container nicht gefunden!');
        }

        overlayElement.style.display = 'flex';
        document.body.classList.add('no-scroll');
    } else {
        console.error(`Task mit ID ${taskId} nicht gefunden.`);
    }
}

/**
 * Closes the task overlay.
 */
function closeTaskOverlay() {
    const overlay = document.getElementById("overlay");
    if (overlay) {
        overlay.style.display = "none";
        document.body.classList.remove('no-scroll');
    }
}

/**
 * Handles editing of a task.
 * 
 * @param {string} taskId - The ID of the task to edit.
 */
async function editTask(taskId) {
    try {
        const taskData = await fetchFromFirebase(`${DB_URL}/tasks/${taskId}.json`);
        if (!taskData) {
            throw new Error('Task nicht gefunden');
        }

        const priority = taskData.priority || 'low';
        const overlayContent = document.querySelector('.overlay-content');
        overlayContent.innerHTML = '';

        overlayContent.innerHTML = `
            <section id="edit-task-content" class="edit-task-content">
                <div class="edit-task-close">
                    <span class="close" onclick="closeTaskOverlay()">
                        <img src="../assets/icons/Close.svg" alt="Close Icon">
                    </span>
                </div>
                <form id="edit-task-form" class="edit-task-form" onsubmit="saveTaskChanges(event, '${taskId}'); return false;" novalidate>
                    <div class="left-column">
                        <div class="input-group">
                            <label for="task-title">Title</label>
                            <div class="input-field">
                                <input type="text" id="task-title" placeholder="Enter a title" value="${taskData.title || ''}" required>
                                <p id="error-task-title" class="error-message">
                                    *This field is required.
                                </p>
                            </div>
                        </div>
                        <div class="input-group">
                            <label for="task-description">Description</label>
                            <div class="input-field">
                                <textarea id="task-description" placeholder="Enter a description" rows="5">${taskData.description || ''}</textarea>
                            </div>
                        </div>
                        <div class="right-column">
                            <div class="input-group date-input">
                                <label for="due-date">Due date</label>
                                <div class="input-field">
                                    <input type="date" id="due-date" value="${taskData.due_date || ''}" required>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                        <path
                                            d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-68-76a12,12,0,1,1-12-12A12,12,0,0,1,140,132Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,132ZM96,172a12,12,0,1,1-12-12A12,12,0,0,1,96,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,140,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,172Z">
                                        </path>
                                    </svg>
                                </div>
                            </div>
                            <div class="input-group">
                                <div class="prio-group">
                                    <label>Prio</label>
                                    <div class="prio-buttons">
                                        <button id="high-priority-button" class="btn btn-urgent ${priority === 'high' ? 'clicked' : ''}" type="button" onclick="setPriority(this, 'high')">
                                            <span class="prio-text">Urgent</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                                <path
                                                    d="M216.49,191.51a12,12,0,0,1-17,17L128,137,56.49,208.49a12,12,0,0,1-17-17l80-80a12,12,0,0,1,17,0Zm-160-63L128,57l71.51,71.52a12,12,0,0,0,17-17l-80-80a12,12,0,0,0-17,0l-80,80a12,12,0,0,0,17,17Z">
                                                </path>
                                            </svg>
                                        </button>
                                        <button id="mid-priority-button" class="btn btn-medium ${priority === 'mid' ? 'clicked' : ''}" type="button" onclick="setPriority(this, 'mid')">
                                            <span class="prio-text">Medium</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                                <path d="M228,160a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,160ZM40,108H216a12,12,0,0,0,0-24H40a12,12,0,0,0,0,24Z"></path>
                                            </svg>
                                        </button>
                                        <button id="low-priority-button" class="btn btn-low ${priority === 'low' ? 'clicked' : ''}" type="button" onclick="setPriority(this, 'low')">
                                            <span class="prio-text">Low</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                                <path
                                                    d="M216.49,127.51a12,12,0,0,1,0,17l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,1,1,17-17L128,199l71.51-71.52A12,12,0,0,1,216.49,127.51Zm-97,17a12,12,0,0,0,17,0l80-80a12,12,0,0,0-17-17L128,119,56.49,47.51a12,12,0,0,0-17,17Z">
                                                </path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <label for="assigned-to">Assigned to</label>
                                <div class="input-field">
                                    <input type="text" id="assigned-to" placeholder="Select contacts to assign" onclick="toggleContactDropdown()" autocomplete="off">
                                    <svg id="contact-dropdown-icon" class="dropdown-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z">
                                        </path>
                                    </svg>
                                    <div id="contact-dropdown" class="contact-dropdown hidden"></div>
                                </div>
                                <div id="selected-contacts" class="selected-contacts">
                                    ${taskData.assigned_to ? taskData.assigned_to.map(contact => `
                                    <div class="selected-profile-icon" style="background-color: ${contact.color};" data-id="${contact.id}">
                                        ${contact.initials}
                                    </div>`).join('') : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="input-group addSubtask-container">
                        <label for="input-subtask">Subtasks</label>
                        <div class="input-field-subtask">
                            <input type="text" id="input-subtask" placeholder="Add new subtask" oninput="toggleIcons()" onkeydown="handleEnter(event)">
                            <div id="addSubtask-icons" class="subtask-icons">
                                <svg id="plus-icon" onclick="addSubtask()" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                    <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z">
                                    </path>
                                </svg>
                                <div id="edit-icons" class="icon-wrapper hidden">
                                    <svg onclick="clearSubtaskInput()" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                        <path
                                            d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z">
                                        </path>
                                    </svg>
                                    <div class="edit-divider-vertical"></div>
                                    <svg onclick="addSubtask()" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z">
                                        </path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <ul id="subtask-list" class="subtask-list">
                            ${taskData.subtasks ? taskData.subtasks.map(subtask => `
                            <li class="subtask-item">
                                <input type="text" value="${subtask.text}" class="subtask-edit-input" readonly tabindex="-1" onclick="preventFocus(event)">
                                <div class="subtask-edit-icons">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256" onclick="editSubtask(this)">
                                        <path
                                            d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z">
                                        </path>
                                    </svg>
                                    <div class="edit-divider-vertical"></div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256" onclick="deleteSubtask(this)">
                                        <path
                                            d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z">
                                        </path>
                                    </svg>
                                </div>
                            </li>
                            `).join('') : ''}
                        </ul>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Ok
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#ffffff" viewBox="0 0 256 256">
                                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z">
                                    </path>
                                </svg>
                            </button>
                        </div>
                </form>
            </section>
        `;

        initializeDatePicker("#due-date");

    } catch (error) {
        console.error('Error editing task:', error);
        showErrorMessage('Fehler beim Laden der Task');
    }
}

/**
 * Saves the edited task changes back to Firebase.
 */
async function saveTaskChanges(event, taskId) {
    event.preventDefault();

    try {
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const dueDate = document.getElementById('due-date').value;
        const priority = document.querySelector('.prio-buttons .clicked')?.id.replace('-priority-button', '') || 'low';

        const assignedContacts = Array.from(document.querySelectorAll('.contact-item.active')).map(contactItem => {
            const id = contactItem.dataset.id;
            const initials = contactItem.querySelector('.profil-icon').textContent.trim();
            const color = contactItem.querySelector('.profil-icon').style.backgroundColor;
            const name = contactItem.querySelector('.contact-name').textContent.trim();
            return { id, initials, color, name };
        });

        const subtasks = Array.from(document.querySelectorAll('.subtask-item')).map(subtaskItem => {
            return {
                text: subtaskItem.querySelector('.subtask-edit-input').value,
                status: 'unchecked'
            };
        });

        const updatedTaskData = {
            title,
            description,
            due_date: dueDate,
            priority,
            assigned_to: assignedContacts,
            subtasks
        };

        const response = await fetch(`${DB_URL}/tasks/${taskId}.json`, {
            method: 'PATCH',
            body: JSON.stringify(updatedTaskData),
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error('Failed to update task');
        }

        allTasks[taskId] = { ...allTasks[taskId], ...updatedTaskData };

        closeTaskOverlay();
        // showSuccessMessage('Task erfolgreich aktualisiert');
        updateTaskInUI(taskId, updatedTaskData);
        reloadTasksInBoard(response, updatedTaskData);
        localStorage.removeItem('checkboxStates');
        clearInputForm()
    } catch (error) {
        console.error('Fehler beim Speichern der Task:', error);
        showErrorMessage('Fehler beim Aktualisieren der Task');
    }
}

/**
 * Generates HTML for assigned persons.
 * 
 * @param {Array} assignedTo - The list of assigned persons.
 * @returns {string} The generated HTML.
 */
function getAssignedToHTML(assignedTo) {
    const validAssignedTo = Array.isArray(assignedTo) ? assignedTo : [];

    if (!validAssignedTo || validAssignedTo.length === 0) {
        return `<div class="no-assigned-contacts" style="padding: 10px 0;">
                    <span style="color: #666; font-size: 14px; margin-left: 0.5rem">No contacts assigned</span>
                </div>`;
    }

    return validAssignedTo.map(person => `
        <div class="user">
            <div class="profile-icon" style="background-color: ${person.color};">
                <span style="color: white;">${person.initials}</span>
            </div>
            <span class="profile-name">${person.name}</span>
        </div>
    `).join('');
}

/**
 * Generates HTML for subtasks.
 * 
 * @param {array} subtasks - The list of subtasks.
 * @param {string} taskId - The id of the parent task.
 * @returns {string} the generated html.
 */
function getSubtasksHTML(subtasks, taskId) {
    if (!subtasks || subtasks.length === 0) {
        return '<div class="no-subtasks" style="color: #666; font-size: 14px;">Keine Subtasks verfügbar</div>';
    }

    return subtasks.map((subtask, index) => `
        <div class="single-subtask" onclick="toggleSubtask('${taskId}', ${index})">
            <img src="../assets/icons/${subtask.status === 'checked' ? 'checked' : 'unchecked'}.svg" alt="${subtask.status}"> 
            <span>${escapeHtml(subtask.text)}</span>
        </div>
    `).join('');
}

/**
 * Fügt eine neue Subtask hinzu.
 */
function addSubtask() {
    const inputField = document.getElementById('input-subtask');
    const subtaskText = inputField.value.trim();

    if (subtaskText) {
        const subtaskList = document.querySelector('.subtask-list');
        const newSubtask = `
            <div class="subtask-item">
                <input type="text" value="${subtaskText}" class="subtask-edit-input" readonly tabindex="-1" onclick="preventFocus(event)">
                <div class="subtask-edit-icons">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256" onclick="editSubtask(this)">
                        <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256" onclick="deleteSubtask(this)">
                        <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                    </svg>
                </div>
            </div>
        `;
        subtaskList.insertAdjacentHTML('beforeend', newSubtask);
        inputField.value = ''; // Clear the input field after adding
    }
}

function handleEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission
        addSubtask();
    }
}

function toggleIcons() {
    const plusIcon = document.getElementById('plus-icon');
    if (plusIcon) {
        plusIcon.style.display = 'block';
    }
}

function editSubtask(icon) {
    const subtaskItem = icon.closest('.subtask-item');
    const input = subtaskItem.querySelector('.subtask-edit-input');
    const originalValue = input.value;

    input.readOnly = false;
    input.focus();

    input.onblur = () => {
        if (input.value.trim() === '') {
            input.value = originalValue;
        }
        input.readOnly = true;
    };

    input.onkeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (input.value.trim() === '') {
                input.value = originalValue;
            }
            input.readOnly = true;
            input.blur();
        }
    };
}

function deleteSubtask(icon) {
    const subtaskItem = icon.closest('.subtask-item');
    if (subtaskItem) {
        subtaskItem.remove();
    }
}

function preventFocus(event) {
    event.preventDefault();
}

// Funktion zum Bearbeiten einer Subtask
function editSubtask(icon) {
    const subtaskItem = icon.closest('.subtask-item');
    const input = subtaskItem.querySelector('.subtask-edit-input');
    const originalValue = input.value;

    input.readOnly = false;
    input.focus();

    // Speichern beim Verlassen des Fokus
    input.onblur = () => {
        if (input.value.trim() === '') {
            input.value = originalValue;
        }
        input.readOnly = true;
    };

    // Speichern bei Enter
    input.onkeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (input.value.trim() === '') {
                input.value = originalValue;
            }
            input.readOnly = true;
            input.blur();
        }
    };
}

// Funktion zum Löschen einer Subtask
function deleteSubtask(icon) {
    const subtaskItem = icon.closest('.subtask-item');
    if (subtaskItem) {
        subtaskItem.style.animation = 'fadeOut 0.3s';
        setTimeout(() => {
            subtaskItem.remove();
        }, 300);
    }
}

// Hilfsfunktion zum Aktualisieren der Subtasks
function updateSubtasks(taskId, subtasks) {
    if (taskId && allTasks[taskId]) {
        allTasks[taskId].subtasks = subtasks;
        // Optional: Speichern in Firebase
        const url = `${DB_URL}/tasks/${taskId}/subtasks.json`;
        sendToFirebase(url, subtasks, 'PUT')
            .catch(error => console.error('Fehler beim Speichern der Subtasks:', error));
    }
}

/**
 * Fetches data from Firebase.
 * 
 * @param {string} url - The Firebase URL to fetch data from.
 * @returns {Object} The fetched data.
 */
async function fetchFromFirebase(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fehler beim Fetch:', error);
        throw error;
    }
}

/**
 * Sends data to Firebase.
 * 
 * @param {string} url - The Firebase URL to send data to.
 * @param {Object|null} data - The data to send (can be null for DELETE requests).
 * @param {string} method - The HTTP method to use (POST, PATCH, PUT, DELETE).
 */
async function sendToFirebase(url, data, method) {
    const response = await fetch(url, {
        method: method,
        body: data ? JSON.stringify(data) : undefined,
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`Fehler beim Senden an ${url}: ${response.statusText}`);
    }
}

/**
 * Updates the task in the UI with new data.
 * 
 * @param {string} taskId - The ID of the task to update.
 * @param {Object} updatedTaskData - The new task data.
 */
function updateTaskInUI(taskId, updatedTaskData) {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
        const assignedToContainer = taskElement.querySelector('.assigned-to');
        if (assignedToContainer) {
            assignedToContainer.innerHTML = getAssignedToHTML(updatedTaskData.assigned_to);
        }

        const priorityIcon = taskElement.querySelector('.priority-icon');
        if (priorityIcon) {
            priorityIcon.src = `assets/icons/priority-${updatedTaskData.priority}.svg`;
        }

        const personsContainer = taskElement.querySelector('.persons');
        if (personsContainer) {
            personsContainer.innerHTML = getAssignedToHTML(updatedTaskData.assigned_to);
        }

        const subtasksContainer = taskElement.querySelector('.subtasks');
        if (subtasksContainer) {
            subtasksContainer.innerHTML = getSubtasksHTML(updatedTaskData.subtasks, taskId);
        }
    }
}

/**
 * Shows a success message to the user.
 * 
 * @param {string} message - The message to show.
 */
function showSuccessMessage(message) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('success-message');
    messageContainer.textContent = message;
    document.body.appendChild(messageContainer);

    setTimeout(() => {
        messageContainer.remove();
    }, 3000);
}

/**
 * Shows an error message to the user.
 * 
 * @param {string} message - The message to show.
 */
function showErrorMessage(message) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('error-message');
    messageContainer.textContent = message;
    document.body.appendChild(messageContainer);

    setTimeout(() => {
        messageContainer.remove();
    }, 3000);
}

/**
 * Toggles the status of a subtask.
 * 
 * @param {string} taskId - The ID of the task containing the subtask.
 * @param {number} subtaskIndex - The index of the subtask to toggle.
 */
async function toggleSubtask(taskId, subtaskIndex) {
    const task = allTasks[taskId];

    if (!task || !task.subtasks[subtaskIndex]) {
        return;
    }

    const subtask = task.subtasks[subtaskIndex];
    subtask.status = subtask.status === "checked" ? "unchecked" : "checked";

    await updateTaskProgress(taskId);
    await updateSubtaskStatus(taskId, subtaskIndex, subtask);
    const subtasksContainer = document.getElementById(`subtasks-${taskId}`);
    subtasksContainer.innerHTML = getSubtasksHTML(task.subtasks, taskId);
}

/**
 * Updates the status of a subtask in Firebase.
 * 
 * @param {string} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 * @param {Object} subtask - The updated subtask data.
 */
async function updateSubtaskStatus(taskId, subtaskIndex, subtask) {
    const url = `${DB_URL}/tasks/${taskId}/subtasks/${subtaskIndex}.json`;
    await sendToFirebase(url, { status: subtask.status }, 'PATCH');
}

/**
 * Updates the progress of the task based on its subtasks.
 * 
 * @param {string} taskId - The ID of the task to update.
 */
async function updateTaskProgress(taskId) {
    try {
        const task = await fetchFromFirebase(`${DB_URL}/tasks/${taskId}.json`);
        if (task && task.subtasks) {
            const totalSubtasks = task.subtasks.length;
            const completedSubtasks = task.subtasks.filter(subtask => subtask.status === 'checked').length;
            const progress = (totalSubtasks === 0) ? 0 : (completedSubtasks / totalSubtasks) * 100;

            await sendToFirebase(`${DB_URL}/tasks/${taskId}.json`, { progress }, 'PATCH');
        }
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Fortschritts:', error);
    }
}