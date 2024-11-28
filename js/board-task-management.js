/**
 * Updates the task status in local data.
 * 
 * @param {string} taskId - The ID of the task to be updated.
 * @param {string} newStatus - The new status of the task.
 */
function updateTaskStatusInLocalData(taskId, newStatus) {
    allTasks[taskId].status = newStatus;
}


/**
 * Sends a status update to Firebase.
 * 
 * @param {string} taskId - The ID of the task to be updated.
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
 * Updates the task status both locally and in Firebase.
 * 
 * @param {string} taskId - The ID of the task to be updated.
 * @param {string} newStatus - The new status of the task.
 * @returns {Promise<void>} - A promise that resolves when the task status is updated.
 */
/**
 * Updates the task status both locally and in Firebase.
 * 
 * @param {string} taskId - The ID of the task to be updated.
 * @param {string} newStatus - The new status of the task.
 * @returns {Promise<void>} - A promise that resolves when the task status is updated.
 */
async function updateTaskStatus(taskId, newStatus) {
    try {
        updateTaskStatusInLocalData(taskId, newStatus);

        const response = await sendStatusUpdateToFirebase(taskId, newStatus);

        if (!response.ok) {
            throw new Error(`Firebase update failed with status: ${response.status}`);
        }

        const updatedTasks = await loadTasks();
        getTaskTemplate(updatedTasks);

    } catch (error) {
        console.error('Error updating task status:', error);

        updateTaskStatusInLocalData(taskId, 'previous_status_here');
    }
}

