let enterCounter = 0; // Zähler für die Anzahl der Drag-Eintritte in die Drop-Zone

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
 * @param {Event} event - The dragstart event that occurs when a task starts being dragged.
 */
function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

/**
 * Handles the drop action by adding the dragged task element to the new drop zone
 * and updating the task's status.
 * 
 * @param {Event} event - The drop event that occurs when a task is dragged into a drop zone.
 */
async function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);

    const dropZone = event.target.closest('.drop-zone');
    if (dropZone) {
        dropZone.appendChild(draggedElement);
        draggedElement.style.pointerEvents = "none"; // Disable dragging again

        // Update task status in Firebase
        await updateTaskStatus(data, dropZone.id);
        
        // Reset highlights after drop
        resetHighlights();
    }
}

/**
 * Updates the status of the task in Firebase and re-renders the board.
 * 
 * @param {string} taskId - The ID of the task to update.
 * @param {string} newStatus - The new status of the task (e.g., "to-do", "in-progress").
 */
async function updateTaskStatus(taskId, newStatus) {
    allTasks[taskId].status = newStatus;

    try {
        const response = await fetch(`${DB_URL}/tasks/${taskId}.json`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
            throw new Error('Error updating task status');
        }

        // Reload tasks and update UI
        const updatedTasks = await loadTasks();
        getTaskTemplate(updatedTasks); // Update the board with new tasks
    } catch (error) {
        console.error('Error updating task status in Firebase:', error);
    }
}

/**
 * Adds the "highlight" effect when a draggable element is dragged over a drop zone.
 * 
 * @param {DragEvent} event - The drag event.
 */
function handleDragOver(event) {
    event.preventDefault();
}

/**
 * Handles drag enter events to manage the enter counter and highlight the drop zone.
 * 
 * @param {DragEvent} event - The drag event.
 */
function handleDragEnter(event) {
    const dropZone = event.target.closest('.drop-zone');
    if (dropZone) {
        enterCounter++;
        resetHighlights(); // Remove highlights from all drop zones
        dropZone.classList.add('highlight'); // Highlight the current drop zone
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
 * Initializes all drop zones and adds the necessary event listeners
 * for the drag-and-drop functionality.
 */
function initializeDropZones() {
    const dropZones = document.querySelectorAll('.drop-zone');

    dropZones.forEach((dropZone) => {
        dropZone.addEventListener('dragover', allowDrop);
        dropZone.addEventListener('dragenter', handleDragEnter);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', drop);
    });
}

// Event listeners für das Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    initializeDropZones();
    loadTasks().then(getTaskTemplate); // Load tasks and render board
});
