let enterCounter = 0;

/**
 * Allows the drop action by preventing the default behavior.
 * 
 * @param {Event} event - The dragover event that occurs when the task is dragged over a drop zone.
 */
function allowDrop(event) {
    event.preventDefault();
}

/**
 * Stores the ID of the dragged element when dragging starts.
 * 
 * @param {Event} event - The dragstart event that occurs when a task is dragged.
 */
function drag(event) {
    const target = event.target;
    event.dataTransfer.setData("text", target.id);
    target.classList.add('dragging');
}


/**
 * Handles the drop action by adding the dragged task to the drop zone.
 * 
 * @param {Event} event - The drop event that occurs when a task is dragged into a drop zone.
 */
async function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
    const dropZone = event.target.closest('.drop-zone');

    draggedElement.classList.remove('dragging');

    if (dropZone) {
        dropZone.appendChild(draggedElement);
        draggedElement.style.pointerEvents = "none"; 
        await updateTaskStatus(data, dropZone.id);
        resetHighlights();
    }
}

/**
 * Updates the status of a task in the local `allTasks` object.
 * @param {string} taskId - The ID of the task to update.
 * @param {string} newStatus - The new status of the task.
 */
function updateTaskStatusInLocalData(taskId, newStatus) {
    allTasks[taskId].status = newStatus;
}

/**
 * Sends a PATCH request to Firebase to update the task status.
 * @param {string} taskId - The ID of the task to update.
 * @param {string} newStatus - The new status of the task.
 * @returns {Promise<Response>} - The response from the Firebase request.
 */
async function sendStatusUpdateToFirebase(taskId, newStatus) {
    const response = await fetch(`${DB_URL}/tasks/${taskId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
    });

    return response;
}

/**
 * Updates the task status in both local data and Firebase.
 * @param {string} taskId - The ID of the task to update.
 * @param {string} newStatus - The new status of the task.
 */
async function updateTaskStatus(taskId, newStatus) {
    try {
        updateTaskStatusInLocalData(taskId, newStatus);
        const response = await sendStatusUpdateToFirebase(taskId, newStatus);

        if (!response.ok) {
            throw new Error('Error updating task status');
        }

        const updatedTasks = await loadTasks();
        getTaskTemplate(updatedTasks); 
    } catch (error) {
        console.error('Error updating task status in Firebase:', error);
    }
}

/**
 * Adds a highlight effect when a draggable element is over a drop zone.
 * 
 * @param {DragEvent} event - The drag event.
 */
function handleDragOver(event) {
    event.preventDefault();
}

/**
 * Handles drag enter events to highlight the drop zone.
 * 
 * @param {DragEvent} event - The drag event.
 */
function handleDragEnter(event) {
    const dropZone = event.target.closest('.drop-zone');
    if (dropZone) {
        enterCounter++;
        resetHighlights(); 
        dropZone.classList.add('highlight');
    }
}

/**
 * Handles drag leave events to manage the enter counter.
 * 
 * @param {DragEvent} event - The drag event.
 */
function handleDragLeave(event) {
    const dropZone = event.target.closest('.drop-zone');
    if (dropZone) {
        enterCounter--;
        if (enterCounter === 0) {
            dropZone.classList.remove('highlight');
        }
    }
}

/**
 * Resets the highlight effect for all drop zones.
 */
function resetHighlights() {
    const dropZones = document.querySelectorAll('.drop-zone');
    dropZones.forEach(zone => zone.classList.remove('highlight'));
}

/**
 * Initializes all drop zones and adds event listeners for drag-and-drop functionality.
 */
function initializeDropZones() {
    const dropZones = document.querySelectorAll('.drop-zone');

    dropZones.forEach(dropZone => {
        dropZone.addEventListener('dragover', allowDrop);
        dropZone.addEventListener('dragenter', handleDragEnter);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', drop);
    });

}

// Event listeners for page loading
document.addEventListener('DOMContentLoaded', () => {
    initializeDropZones();
    loadTasks().then(getTaskTemplate);
});
