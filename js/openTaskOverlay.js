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
function getSubtasksHTML(subtasks, taskId) {
    if (!subtasks || subtasks.length === 0) {
        return '<div class="no-subtasks">Keine Subtasks verfügbar</div>';
    }

    return subtasks.map((subtask, index) => `
        <div class="single-subtask" onclick="toggleSubtask('${taskId}', ${index})">
            <img src="../assets/icons/${subtask.status === 'checked' ? 'checked' : 'unchecked'}.svg" alt="${subtask.status}"> 
            <span>${subtask.text}</span>
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
                            <label for="task-title">Title<span class="required">*</span></label>
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
                                <label for="due-date">Due date<span class="required">*</span></label>
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
                                    <button id="high-priority-button" class="btn btn-urgent" type="button" onclick="setPriority(this)">
                                        Urgent
                                    </button>
                                    <button id="mid-priority-button" class="btn btn-medium" type="button" onclick="setPriority(this)">
                                        Medium
                                    </button>
                                    <button id="low-priority-button" class="btn btn-low" type="button" onclick="setPriority(this)">
                                        Low
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
                            <div id="selected-contacts" class="selected-contacts"></div>
                        </div>
                    </div>

                    <div class="input-group category-container">
                        <label for="task-category">Category<span class="required">*</span></label>
                        <div class="input-field">
                            <input type="text" id="task-category" placeholder="Select a category" value="${taskData.category || ''}" required autocomplete="off">
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
                            ${taskData.subtasks ? taskData.subtasks.map(subtask => 
                                `<div class="subtask-item">
                                    <input type="checkbox" ${subtask.completed ? 'checked' : ''} class="subtask-checkbox">
                                    <label class="subtask-text">${subtask.text}</label>
                                </div>`).join('') : ''}
                        </div>
                    </div>
                </form>
            </section>
        `;

        
    } catch (error) {
        console.error('Error editing task:', error);
    }
}


/**
 * Saves the edited task changes back to Firebase.
 * 
 * @param {string} taskId - The ID of the task being edited.
 */
async function saveTaskChanges(taskId) {
    const updatedTask = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-description').value,
        due_date: document.getElementById('due-date').value,
        category: document.getElementById('task-category').value,
        priority: getCurrentPriority(),
        assigned_to: getSelectedContacts(),
        subtasks: getUpdatedSubtasks(),
    };

    try {
        // Speichere die Änderungen in Firebase
        await sendToFirebase(`${DB_URL}/tasks/${taskId}.json`, updatedTask, 'PATCH');
        alert('Task updated successfully!');
        closeEditForm();
    } catch (error) {
        console.error('Error saving task changes:', error);
    }
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
