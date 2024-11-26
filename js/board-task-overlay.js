const overlayElement = document.getElementById('overlay');

/**
 * Displays a task overlay with detailed task information.
 * 
 * @param {string} taskId - The ID of the task to display in the overlay.
 */
function getTaskOverlay(taskId) {
    const task = allTasks[taskId];

    if (task) {
        const overlayElement = document.getElementById('overlay');
        overlayElement.querySelector('.overlay-content').innerHTML = getTaskOverlayContent(task);
        overlayElement.setAttribute('data-task-id', taskId);

        updateSubtasksContainer(task.subtasks, taskId, overlayElement);
        updateAssignedToContainer(task.assigned_to, overlayElement);

        overlayElement.style.display = 'flex';
        document.body.classList.add('no-scroll');
    } else {
        console.error(`Task with ID ${taskId} not found.`);
    }
}

/**
 * Updates the subtasks section inside the overlay.
 * 
 * @param {Array} subtasks - The list of subtasks for the task.
 * @param {string} taskId - The ID of the task.
 * @param {HTMLElement} overlayElement - The overlay element to update.
 */
function updateSubtasksContainer(subtasks, taskId, overlayElement) {
    const subtasksHTML = getSubtasksHTML(subtasks, taskId);
    const subtasksContainer = overlayElement.querySelector('.all-subtasks');
    if (subtasksContainer) {
        subtasksContainer.id = `subtasks-${taskId}`;
        subtasksContainer.innerHTML = subtasksHTML;
    } else {
        console.error('Subtasks container not found!');
    }
}

/**
 * Updates the assigned users section inside the overlay.
 * 
 * @param {Array} assignedTo - The list of assigned users for the task.
 * @param {HTMLElement} overlayElement - The overlay element to update.
 */
function updateAssignedToContainer(assignedTo, overlayElement) {
    const assignedToHTML = getAssignedToHTML(assignedTo);
    const personsContainer = overlayElement.querySelector('.persons');
    if (personsContainer) {
        personsContainer.innerHTML = assignedToHTML;
    } else {
        console.error('Persons container not found!');
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
 * Adds a new subtask to the list. 
 * It retrieves the subtask text from the input field, creates a new subtask element,
 * and appends it to the subtask list.
 */
function addSubtask() {
    const inputField = document.getElementById('input-subtask');
    const subtaskText = inputField.value.trim();

    if (subtaskText) {
        const subtaskList = document.querySelector('.subtask-list');
        const newSubtask = createSubtaskHTML(subtaskText);
        subtaskList.insertAdjacentHTML('beforeend', newSubtask);
        inputField.value = '';
    }
}

/**
 * Adds a new subtask to the edit task list. 
 * It retrieves the subtask text from the input field, creates a new subtask element,
 * and appends it to the subtask list. This also toggles icons for edit task mode.
 */
function addSubtaskEditTask() {
    const inputField = document.getElementById('input-subtask-edit-task');
    const subtaskText = inputField.value.trim();

    if (subtaskText) {
        const subtaskList = document.querySelector('.subtask-list');
        const newSubtask = createSubtaskEditTaskHTML(subtaskText);
        subtaskList.insertAdjacentHTML('beforeend', newSubtask);
        inputField.value = '';
        toggleIconsEditTask();
    }
}

/**
 * Handles the Enter key press event to add a new subtask when Enter is pressed.
 * 
 * @param {KeyboardEvent} event - The keypress event triggered when Enter is pressed.
 */
function handleEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addSubtask();
    }
}

/**
 * Handles the Enter key press event to add a new subtask in the edit task mode when Enter is pressed.
 * 
 * @param {KeyboardEvent} event - The keypress event triggered when Enter is pressed.
 */
function handleEnterEditTask(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addSubtaskEditTask();
    }
}

/**
 * Edits an existing subtask input field by making it editable and focusing on it.
 * 
 * @param {HTMLElement} icon - The edit icon that was clicked to initiate the subtask editing.
 */
function editSubtaskInput(icon) {
    const subtaskItem = icon.closest('.subtask-item');
    const input = subtaskItem.querySelector('.subtask-edit-input');
    const originalValue = input.value;

    input.readOnly = false;
    input.focus();

    setupSubtaskEventListeners(input, originalValue);
}

/**
 * Sets up the blur and keydown event listeners for the subtask input.
 * 
 * @param {HTMLInputElement} input - The subtask input element.
 * @param {string} originalValue - The original value of the subtask before editing.
 */
function setupSubtaskEventListeners(input, originalValue) {
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


/**
 * Deletes a subtask when the delete icon is clicked. 
 * The subtask is removed from the DOM after a brief fade-out animation.
 * 
 * @param {HTMLElement} icon - The delete icon that was clicked to remove the subtask.
 */
function deleteSubtask(icon) {
    const subtaskItem = icon.closest('.subtask-item');
    if (subtaskItem) {
        subtaskItem.style.animation = 'fadeOut 0.3s';
        setTimeout(() => {
            subtaskItem.remove();
        }, 300);
    }
}

/**
 * Prevents the input field from being focused when clicked.
 * This is useful when clicking on read-only inputs to prevent user interaction.
 * 
 * @param {MouseEvent} event - The click event triggered on the input field.
 */
function preventFocus(event) {
    event.preventDefault();
}

/**
 * Updates the subtasks for a given task in the Firebase database. 
 * It sends the updated subtasks array to Firebase.
 * 
 * @param {string} taskId - The ID of the task for which subtasks are being updated.
 * @param {Array} subtasks - The updated list of subtasks.
 */
function updateSubtasks(taskId, subtasks) {
    if (taskId && allTasks[taskId]) {
        allTasks[taskId].subtasks = subtasks;
        const url = `${DB_URL}/tasks/${taskId}/subtasks.json`;
        sendToFirebase(url, subtasks, 'PUT')
            .catch(error => console.error('Error saving subtasks:', error));
    }
}

/**
 * Fetches data from Firebase using the provided URL.
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
        console.error('Error fetching data:', error);
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
 * Updates the assigned-to section of a task element.
 * 
 * @param {HTMLElement} taskElement - The task element to update.
 * @param {Object} assignedToData - The new assigned-to data.
 */
function updateAssignedTo(taskElement, assignedToData) {
    const assignedToContainer = taskElement.querySelector('.assigned-to');
    if (assignedToContainer) {
        assignedToContainer.innerHTML = getAssignedToHTML(assignedToData);
    }
}

/**
 * Updates the priority icon of a task element.
 * 
 * @param {HTMLElement} taskElement - The task element to update.
 * @param {string} priority - The priority level of the task.
 */
function updatePriorityIcon(taskElement, priority) {
    const priorityIcon = taskElement.querySelector('.priority-icon');
    if (priorityIcon) {
        priorityIcon.src = `assets/icons/priority-${priority}.svg`;
    }
}

/**
 * Updates the persons section of a task element.
 * 
 * @param {HTMLElement} taskElement - The task element to update.
 * @param {Object} assignedToData - The new assigned-to data.
 */
function updatePersons(taskElement, assignedToData) {
    const personsContainer = taskElement.querySelector('.persons');
    if (personsContainer) {
        personsContainer.innerHTML = getAssignedToHTML(assignedToData);
    }
}

/**
 * Updates the subtasks section of a task element.
 * 
 * @param {HTMLElement} taskElement - The task element to update.
 * @param {Array} subtasks - The new subtasks data.
 * @param {string} taskId - The task ID.
 */
function updateSubtasks(taskElement, subtasks, taskId) {
    const subtasksContainer = taskElement.querySelector('.subtasks');
    if (subtasksContainer) {
        subtasksContainer.innerHTML = getSubtasksHTML(subtasks, taskId);
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
        updateAssignedTo(taskElement, updatedTaskData.assigned_to);
        updatePriorityIcon(taskElement, updatedTaskData.priority);
        updatePersons(taskElement, updatedTaskData.assigned_to);
        updateSubtasks(taskElement, updatedTaskData.subtasks, taskId);
    }
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