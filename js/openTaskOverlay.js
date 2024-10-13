/**
 * Opens the task overlay by setting the overlay's display property to "flex".
 * This function is triggered when a task element is clicked.
 */
function openTaskOverlay() {
    document.getElementById("overlay").style.display = "flex";
}

/**
 * Closes the task overlay by setting the overlay's display property to "none".
 * This function is triggered when the user clicks the close ("X") button or outside the overlay.
 */
function closeTaskOverlay() {
    document.getElementById("overlay").style.display = "none";
}

/**
 * Checks if the user clicks outside the overlay and closes the overlay if so.
 * 
 * @param {Event} event - The click event that tracks where the user clicked on the page.
 */
window.onclick = function(event) {
    var overlay = document.getElementById("overlay");
    
    // Check if the clicked target is the overlay itself (not the overlay content).
    if (event.target == overlay) {
        closeTaskOverlay();
    }
}
