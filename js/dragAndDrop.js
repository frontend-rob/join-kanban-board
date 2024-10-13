/**
 * Allows the drop action by preventing the default behavior.
 * 
 * @param {Event} event - The dragover event that occurs when the task is dragged over a drop zone.
 */
function allowDrop(event) {
    event.preventDefault(); // Necessary to allow dropping
}

/**
 * Stores the ID of the dragged element when dragging starts.
 * 
 * @param {Event} event - The dragstart event that occurs when a task starts being dragged.
 */
function drag(event) {
    event.dataTransfer.setData("text", event.target.id); // Stores the ID of the task being dragged
}

/**
 * Handles the drop action by appending the dragged task to the drop zone.
 * 
 * @param {Event} event - The drop event that occurs when a task is dropped in a drop zone.
 */
function drop(event) {
    event.preventDefault(); // Prevents the default behavior
    
    var data = event.dataTransfer.getData("text"); // Retrieves the ID of the dragged task
    var draggedElement = document.getElementById(data); // Gets the task element by its ID
    
    if (event.target.classList.contains('drop-zone')) {
        event.target.appendChild(draggedElement); // Append the dragged task to the drop zone
    }
}
