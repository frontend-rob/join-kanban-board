const overlayElement = document.getElementById('overlay');

/**
 * Opens the task overlay and displays task details.
 * 
 * @param {string} taskId - The ID of the task to be displayed.
 */
function getTaskOverlay(taskId) {
    const task = allTasks[taskId];

    if (!task) {
        console.error(`Task mit ID ${taskId} nicht gefunden.`);
        return;
    }

    const overlay = document.getElementById('overlay');
    const subtasksHTML = getSubtasksHTML(task.subtasks, taskId);

    overlay.querySelector('.overlay-content').innerHTML = getTaskOverlayContent(task);
    const subtasksContainer = overlay.querySelector('.all-subtasks');
    if (subtasksContainer) {
        subtasksContainer.id = `subtasks-${taskId}`;
        subtasksContainer.innerHTML = subtasksHTML;
    } else {
        console.error('Subtasks-Container nicht gefunden!');
    }

    overlay.style.display = 'flex';
    overlay.setAttribute('data-task-id', taskId);
    document.body.classList.add('no-scroll');
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
 * Generates HTML for assigned persons.
 * 
 * @param {Array} assignedTo - The list of assigned persons.
 * @returns {string} The generated HTML.
 */
function getAssignedToHTML(assignedTo) {
    const validAssignedTo = Array.isArray(assignedTo) ? assignedTo : [];

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
function getSubtasksHTML(subtasks = [], taskId) {
    if (!subtasks.length) return '<div class="no-subtasks">Keine Subtasks verfügbar</div>';

    return subtasks.map(({ status = 'unchecked', text = 'Unbenannte Subtask' }, index) => `
        <div class="single-subtask" onclick="toggleSubtask('${taskId}', ${index})">
            <img src="../assets/icons/${status === 'checked' ? 'checked' : 'unchecked'}.svg" alt="${status}">
            <span>${escapeHtml(text)}</span>
        </div>
    `).join('');
}



/**
 * Fetches data from Firebase.
 * 
 * @param {string} url - The Firebase URL to fetch data from.
 * @returns {Object} The fetched data.
 */
async function fetchFromFirebase(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fehler beim Abrufen von ${url}: ${response.statusText}`);
    }
    return await response.json();
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

async function editTask(taskId) {
    try {
        const taskData = await fetchFromFirebase(`${DB_URL}/tasks/${taskId}.json`);

        if (!taskData) {
            console.error('Task not found!');
            return;
        }
        

        const overlayContent = document.querySelector('.overlay-content');
        overlayContent.innerHTML = '';

        overlayContent.innerHTML = `
            <section id="edit-task-content" class="main-content">
            <span class="close" id="close-edit-task" onclick="closeTaskOverlay()">
                <img src="../assets/icons/Close.svg" alt="Close Icon">
            </span>
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
                                        <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-68-76a12,12,0,1,1-12-12A12,12,0,0,1,140,132Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,132ZM96,172a12,12,0,1,1-12-12A12,12,0,0,1,96,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,140,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,172Z"></path>
                                    </svg>
                                </div>
                            </div>
                            <div class="input-group">
                            <!-- Priority Buttons -->
                            <div class="prio-group">
                                <label>Prio</label>
                                <div class="prio-buttons">
                                    <button id="high-priority-button" class="btn btn-urgent ${taskData.priority === 'high' ? 'clicked' : ''}" type="button" onclick="setPriority(this)">
                                        Urgent
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                            <path d="M216.49,191.51a12,12,0,0,1-17,17L128,137,56.49,208.49a12,12,0,0,1-17-17l80-80a12,12,0,0,1,17,0Zm-160-63L128,57l71.51,71.52a12,12,0,0,0,17-17l-80-80a12,12,0,0,0-17,0l-80,80a12,12,0,0,0,17,17Z">
                                            </path>
                                        </svg>
                                    </button>
                                    <button id="mid-priority-button" class="btn btn-medium ${taskData.priority === 'mid' ? 'clicked' : ''}" type="button" onclick="setPriority(this)">
                                        Medium
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                            <path d="M228,160a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,160ZM40,108H216a12,12,0,0,0,0-24H40a12,12,0,0,0,0,24Z">
                                            </path>
                                        </svg>
                                    </button>
                                    <button id="low-priority-button" class="btn btn-low ${taskData.priority === 'low' ? 'clicked' : ''}" type="button" onclick="setPriority(this)">
                                        Low
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                            <path d="M216.49,127.51a12,12,0,0,1,0,17l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,1,1,17-17L128,199l71.51-71.52A12,12,0,0,1,216.49,127.51Zm-97,17a12,12,0,0,0,17,0l80-80a12,12,0,0,0-17-17L128,119,56.49,47.51a12,12,0,0,0-17,17Z">
                                            </path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <label for="assigned-to">Assigned to</label>
                            <div class="input-field">
                                <input type="text" id="assigned-to" placeholder="Select contacts to assign" onclick="toggleContactDropdown()" autocomplete="off">
                                <svg id="contact-dropdown-icon" class="dropdown-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                                </svg>
                                <div id="contact-dropdown" class="contact-dropdown hidden"></div>
                            </div>
                            <div id="selected-contacts" class="selected-contacts">
                                ${taskData.assigned_to ? taskData.assigned_to.map(contact => `
                                    <div class="selected-profile-icon" 
                                         style="background-color: ${contact.color};" 
                                         data-id="${contact.id}">
                                        ${contact.initials}
                                    </div>`).join('') : ''}
                            </div>
                            </div>
                        </div>
                    </div>

                    <!-- Subtask section -->
                    <div class="input-group addSubtask-container">
                        <label for="input-subtask">Subtasks</label>
                        <div class="input-field-subtask">
                            <input type="text" id="input-subtask" placeholder="Add new subtask" oninput="toggleIcons()" onkeydown="handleEnter(event)">
                            <div id="addSubtask-icons" class="subtask-icons">
                                <svg id="plus-icon" onclick="addSubtask()" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                    <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
                                </svg>
                                <div id="edit-icons" class="icon-wrapper hidden">
                                    <svg onclick="clearSubtaskInput()" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                                    </svg>
                                    <div class="edit-divider-vertical"></div>
                                    <svg onclick="addSubtask()" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div id="subtask-list">
                            ${taskData.subtasks ? taskData.subtasks.map(subtask => `
                                <div class="subtask-item">
                                    <input type="text" value="${subtask.text}" class="subtask-edit-input" readonly tabindex="-1" onclick="preventFocus(event)">
                                    <div class="subtask-edit-icons">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256" onclick="editSubtask(this)">
                                            <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path>
                                        </svg>
                                        <div class="edit-divider-vertical"></div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256" onclick="deleteSubtask(this)">
                                            <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                                        </svg>
                                    </div>
                                </div>
                            `).join('') : ''}
                        </div>

                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Speichern</button>
                    </div>
                </form>
            </section>
        `;

        initializeDatePicker("#due-date");

        
    } catch (error) {
        console.error('Error editing task:', error);
    }
}


/**
 * Saves the edited task changes back to Firebase.
 * 
 * @param {string} taskId - The ID of the task being edited.
 */
async function saveTaskChanges(event, taskId) {
    event.preventDefault();
    
    try {
        // Collect form data (existing code remains the same)
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const dueDate = document.getElementById('due-date').value;
        
        // Collect subtasks
        const subtaskElements = document.querySelectorAll('#subtask-list .subtask-item');
        const subtasks = Array.from(subtaskElements).map(subtask => ({
            text: subtask.querySelector('.subtask-edit-input').value,  // Geändert hier
            status: subtask.querySelector('.subtask-checkbox') ? subtask.querySelector('.subtask-checkbox').checked : false  // Optional, falls Checkbox vorhanden ist
        }));
        
        // Collect priority
        const priorityButtons = document.querySelectorAll('.prio-buttons .btn');
        let priority = '';
        priorityButtons.forEach(btn => {
            if (btn.classList.contains('active')) {
                priority = btn.textContent.toLowerCase();
            }
        });
        
        // Collect assigned contacts
        const assignedContacts = [];
        const selectedContactsContainer = document.getElementById('selected-contacts');
        const selectedContacts = selectedContactsContainer.querySelectorAll('.contact-chip');
        selectedContacts.forEach(contact => {
            assignedContacts.push({
                id: contact.dataset.contactId,
                name: contact.dataset.contactName,
                email: contact.dataset.contactEmail,
                initials: contact.dataset.contactInitials,
                color: contact.dataset.contactColor
            });
        });
        
        // Prepare data for Firebase
        const updatedTaskData = {
            title,
            description,
            due_date: dueDate,
            priority,
            subtasks,
            assigned_to: assignedContacts
        };
        
        // Send to Firebase
        const response = await fetch(`${DB_URL}/tasks/${taskId}.json`, {
            method: 'PATCH',
            body: JSON.stringify(updatedTaskData)
        });

        if (!response.ok) {
            throw new Error('Failed to update task');
        }

        // Reload tasks in the board similar to your addTask approach
        await reloadTasksInBoard(response, updatedTaskData);
        
        // Close overlay and show success message
        closeTaskOverlay();
        showSuccessMessage('Task erfolgreich aktualisiert');
    } catch (error) {
        console.error('Fehler beim Speichern der Task:', error);
        showErrorMessage('Fehler beim Aktualisieren der Task');
    }
}


// Hilfsfunktion zum Anzeigen von Erfolgsmeldungen
function showSuccessMessage(message) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('success-message');
    messageContainer.textContent = message;
    document.body.appendChild(messageContainer);
    
    setTimeout(() => {
        messageContainer.remove();
    }, 3000);
}

// Hilfsfunktion zum Anzeigen von Fehlermeldungen
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
 * @param {number} subtaskIndex - The index of the subtask to toggle.
 */
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
