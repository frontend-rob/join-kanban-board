/**
 * Opens the task overlay by setting the overlay's display property to "flex" and populating it with task data.
 * This function is triggered when a task element is clicked.
 * 
 * @param {string} taskId - The ID of the task to be displayed in the overlay.
 */
function openTaskOverlay(taskId) {
    loadTasks().then(tasks => {
        const task = tasks[taskId];
        

        if (task) {
            const overlayContent = `
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
                        <span class="level">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                        <img src="../assets/icons/priority-${task.priority}.svg" alt="">
                    </div>
                </div>
                <div class="assigned-to">
                    <span class="assigned-to-text">Assigned To:</span>
                    <div class="persons">
                        ${task.assigned_to.map(person => `
                            <div class="user">
                                <div class="profile-icon" style="background-color: ${person.color};">
                                    <span style="color: white;">${person.initials}</span>
                                    </div>
                                    <span class="profile-name">${person.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="subtask-overlay">
                    <span class="subtask-header">Subtasks</span>
                    <div class="all-subtasks">
                        ${task.subtasks.map(subtask => `
                            <div class="single-subtask">
                                <img src="../assets/icons/${subtask.status === 'checked' ? 'checked' : 'unchecked'}.svg" alt="${subtask.status}"> 
                                <span>${subtask.text}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="action">
                    <div class="action-type" onclick="deleteTask()">
                        <img src="../assets/icons/delete.svg" alt="Delete Icon">
                        <span>Delete</span>
                    </div>
                    <div class="divider-vertical divider-action"></div>
                    <div class="action-type" onclick="editTask()">
                        <img src="../assets/icons/edit.svg" alt="Edit Icon">
                        <span>Edit</span>
                    </div>
                </div>
            `;

            // Overlay-Element holen und füllen
            const overlayElement = document.getElementById('overlay');
            overlayElement.querySelector('.overlay-content').innerHTML = overlayContent;

            // Overlay anzeigen
            overlayElement.style.display = 'flex';
        } else {
            console.error('Task not found');
        }
    });
}

/**
 * Closes the task overlay by setting the overlay's display property to "none".
 * This function is triggered when the user clicks the close ("X") button or outside the overlay.
 */
function closeTaskOverlay() {
    document.getElementById('overlay').style.display = 'none';
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
