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
 * Handles the drop action by appending the dragged task to the drop zone.
 * 
 * @param {Event} event - The drop event that occurs when a task is dropped in a drop zone.
 */
function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("text");
    var draggedElement = document.getElementById(data);
    
    if (event.target.classList.contains('drop-zone')) {
        event.target.appendChild(draggedElement);
    }
    
    // Remove the highlight effect after dropping
    event.target.classList.remove('highlight');
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