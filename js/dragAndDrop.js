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
function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("text");
    var draggedElement = document.getElementById(data);

    // Überprüfen, ob das Ziel ein Drop-Zone-Element ist
    if (event.target.classList.contains('drop-zone')) {
        event.target.appendChild(draggedElement);

        var newStatus = event.target.id;
        updateTaskStatus(data, newStatus);
    }
    
    // Das Highlight entfernen
    event.target.classList.remove('highlight');
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

        getTaskTemplate(allTasks);
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
    if (event.target.classList.contains('drop-zone')) {
        event.target.classList.add('highlight');
    }
}

/**
 * Removes the "highlight" effect when the draggable element leaves the drop zone.
 * 
 * @param {DragEvent} event - The drag event.
 */
function handleDragLeave(event) {
    if (event.target.classList.contains('drop-zone')) {
        event.target.classList.remove('highlight');
    }
}

/**
 * Initializes all drop zones on the page and adds the necessary event listeners
 * for drag-and-drop functionality.
 */
function initializeDropZones() {
    const dropZones = document.querySelectorAll('.drop-zone');

    dropZones.forEach((dropZone) => {
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', drop);
    });
}
