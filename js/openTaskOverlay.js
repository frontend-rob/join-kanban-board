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
        overlayElement.style.display = 'flex';
        document.body.classList.add('no-scroll');
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
    return assignedTo.map(person => `
        <div class="user">
            <div class="profile-icon" style="background-color: ${person.color};">
                <span style="color: white;">${person.initials}</span>
            </div>
            <span class="profile-name">${person.name}</span>
        </div>
    `).join('');
}

/**
 * generates html for subtasks.
 * 
 * @param {array} subtasks - the list of subtasks.
 * @param {string} taskId - the id of the parent task.
 * @returns {string} the generated html.
 */
function getSubtasksHTML(subtasks, taskId) {
    // check if subtasks array exists and has elements
    if (!Array.isArray(subtasks) || subtasks.length === 0) {
        return '<div class="no-subtasks">No subtasks available</div>';
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
