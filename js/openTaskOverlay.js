const overlayElement = document.getElementById('overlay');

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

/**
 * Opens the task overlay by fetching task data from Firebase and populating it in the overlay.
 * 
 * @param {string} taskId - The ID of the task to be displayed in the overlay.
 */
async function openTaskOverlay(taskId) {
    try {
        const task = await fetchFromFirebase(`${DB_URL}/tasks/${taskId}.json`);
        const overlayContent = createOverlayContent(task, taskId);
        overlayElement.querySelector('.overlay-content').innerHTML = overlayContent;
        overlayElement.style.display = 'flex';
    } catch (error) {
        console.error('Fehler beim Abrufen der Aufgabe:', error);
    }
}

/**
 * Creates the HTML content for the task overlay.
 * 
 * @param {Object} task - The task data fetched from Firebase.
 * @param {string} taskId - The ID of the task.
 * @returns {string} The HTML string for the overlay content.
 */
function createOverlayContent(task, taskId) {
    return `
        <div class="task-type-and-close-container">
            <p class="overlay-task-type">${task.category}</p>
            <span class="close" onclick="closeTaskOverlay()">
                <img src="../assets/icons/Close.svg" alt="Close Icon">
            </span>
        </div>
        <h2 class="overlay-task-title">${task.title}</h2>
        <p class="overlay-task-description">${task.description}</p>
        <div class="task-date">
            <span class="date-text">Due date:</span>
            <span class="date">${task.due_date}</span>
        </div>
        <div class="priority">
            <span class="priority-text">Priority:</span>
            <div class="priority-container">
                <span class="level">${capitalizeFirstLetter(task.priority)}</span>
                <img src="../assets/icons/priority-${task.priority}.svg" alt="">
            </div>
        </div>
        <div class="assigned-to">
            <span class="assigned-to-text">Assigned To:</span>
            <div class="persons">
                ${task.assigned_to.map(person => createPersonHTML(person)).join('')}
            </div>
        </div>
        <div class="subtask-overlay">
            <span class="subtask-header">Subtasks</span>
            <div class="all-subtasks" id="subtasks-${taskId}">
                ${task.subtasks.map((subtask, index) => getSubtaskTemplate(subtask, taskId, index)).join('')}
            </div>
        </div>
        <div class="action">
            <div class="action-type" onclick="deleteTask('${taskId}')">
                <img src="../assets/icons/delete.svg" alt="Delete Icon">
                <span>Delete</span>
            </div>
            <div class="divider-vertical divider-action"></div>
            <div class="action-type" onclick="editTask('${taskId}')">
                <img src="../assets/icons/edit.svg" alt="Edit Icon">
                <span>Edit</span>
            </div>
        </div>
    `;
}

/**
 * Creates the HTML for a person assigned to a task.
 * 
 * @param {Object} person - The person data containing name, initials, and color.
 * @returns {string} The HTML string for the person.
 */
function createPersonHTML(person) {
    return `
        <div class="user">
            <div class="profile-icon" style="background-color: ${person.color};">
                <span style="color: white;">${person.initials}</span>
            </div>
            <span class="profile-name">${person.name}</span>
        </div>
    `;
}

/**
 * Creates the HTML for a subtask.
 * 
 * @param {Object} subtask - The subtask data containing text and status.
 * @param {string} taskId - The ID of the parent task.
 * @param {number} index - The index of the subtask.
 * @returns {string} The HTML string for the subtask.
 */
function getSubtaskTemplate(subtask, taskId, index) {
    return `
        <div class="single-subtask" onclick="toggleSubtask('${taskId}', ${index})">
            <img src="../assets/icons/${subtask.status}.svg" alt="${subtask.status}"> 
            <span>${subtask.text}</span>
        </div>
    `;
}

/**
 * Capitalizes the first letter of a string.
 * 
 * @param {string} string - The string to capitalize.
 * @returns {string} The string with the first letter capitalized.
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Closes the task overlay by setting the overlay's display property to "none".
 */
function closeTaskOverlay() {
    overlayElement.style.display = 'none';
}

/**
 * Checks if the user clicks outside the overlay and closes the overlay if so.
 * 
 * @param {Event} event - The click event.
 */
window.onclick = function(event) {
    if (event.target === overlayElement) {
        closeTaskOverlay();
    }
}

/**
 * Edits a task.
 * 
 * @param {string} taskId - The ID of the task to be edited.
 */
async function editTask(taskId) {
    const newTitle = prompt('Gib den neuen Titel ein:');
    const newDescription = prompt('Gib die neue Beschreibung ein:');
    const newDueDate = prompt('Gib das neue Fälligkeitsdatum ein (YYYY-MM-DD):');

    const updatedData = {
        ...(newTitle && { title: newTitle }),
        ...(newDescription && { description: newDescription }),
        ...(newDueDate && { due_date: newDueDate })
    };

    if (Object.keys(updatedData).length > 0) {
        try {
            await sendToFirebase(`${DB_URL}/tasks/${taskId}.json`, updatedData, 'PATCH');
            // Optionally, refresh the overlay or UI to reflect changes
            openTaskOverlay(taskId);
        } catch (error) {
            console.error('Fehler beim Aktualisieren der Aufgabe:', error);
        }
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
        return; // Sicherstellen, dass die Aufgabe und die Subtask existieren
    }

    // Aktualisiere den Status der Subtask
    const subtask = task.subtasks[subtaskIndex];
    subtask.status = subtask.status === "checked" ? "unchecked" : "checked";

    // Aktualisiere den Fortschritt der Aufgabe
    await updateTaskProgress(taskId);

    // Aktualisiere die Subtask in Firebase
    const url = `${DB_URL}/tasks/${taskId}/subtasks/${subtaskIndex}.json`;
    await sendToFirebase(url, { status: subtask.status }, 'PATCH');

    // Aktualisiere die UI der Subtasks
    const subtasksContainer = document.getElementById(`subtasks-${taskId}`);
    subtasksContainer.innerHTML = getSubtasksHTML(task.subtasks, taskId);
}

/**
 * Updates the entire subtasks array in Firebase.
 * 
 * @param {string} taskId - The ID of the task.
 * @param {Array} subtasks - The updated subtasks array.
 */
async function updateSubtasks(taskId, subtasks) {
    await sendToFirebase(`${DB_URL}/tasks/${taskId}/subtasks.json`, subtasks, 'PUT');
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
