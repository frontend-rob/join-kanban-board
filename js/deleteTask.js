/**
 * Deletes the selected task from the loaded task list and updates the user interface.
 * 
 * @function deleteTask
 */
async function deleteTask() {
    const overlay = document.getElementById('overlay');
    const taskId = overlay.getAttribute('data-task-id');

    if (!taskId) {
        return;
    }

    await removeTaskFromFirebase(taskId);
    updateTaskList(taskId);
}

/**
 * Sends a delete request to Firebase for the specified task.
 * 
 * @param {string} taskId - The ID of the task to be deleted.
 * @returns {Promise<void>}
 */
async function removeTaskFromFirebase(taskId) {
    try {
        await sendToFirebase(`${DB_URL}/tasks/${taskId}.json`, null, 'DELETE');
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

/**
 * Updates the task list and closes the task overlay.
 * 
 * @param {string} taskId - The ID of the task that was deleted.
 * @returns {void}
 */
function updateTaskList(taskId) {
    if (allTasks[taskId]) {
        delete allTasks[taskId];
        closeTaskOverlay(); 
        getTaskTemplate(allTasks);
    }
}
