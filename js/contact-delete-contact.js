/**
 * Deletes a contact from the database and refreshes the contact list.
 * @async
 * @function
 */
let isDeletingContact = false;

async function deleteContact() {
    if (isDeletingContact) return;
    isDeletingContact = true;

    const overlay = document.getElementById('overlay');
    const contactId = overlay.getAttribute('data-contact-id');

    if (!contactId) {
        console.error("No contact ID found");
        isDeletingContact = false;
        return;
    }

    await deleteContactFromDatabase(contactId);
    await removeContactFromTasks(contactId);
    hideContactDetails();
    handleContactDeletion();
    closeEditOverlay();

    isDeletingContact = false;
}

/**
 * Deletes the contact from the database.
 * @param {string} contactId - The ID of the contact to be deleted.
 * @returns {Promise<void>}
 */
async function deleteContactFromDatabase(contactId) {
    try {
        const response = await fetch(`${DB_URL}/contacts/${contactId}.json`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error('Error deleting contact');
        }
    } catch (error) {
        console.error('Error deleting contact:', error);
    }
}

/**
 * Loads the updated contacts, closes the overlay, and clears contact details.
 * @returns {void}
 */
async function handleContactDeletion() {
    await closeTaskOverlay();
    clearContactDetails();
    await loadContacts();
}


/**
 * Clears the contact details section after deleting a contact.
 * @function
 */
function clearContactDetails() {
    const contactDetailsContainer = document.querySelector('.contact-details');
    contactDetailsContainer.innerHTML = '';
}


/**
 * Removes a contact from the assigned_to list in all tasks.
 * @param {string} contactId - The ID of the contact to be removed.
 * @returns {Promise<void>}
 */
async function removeContactFromTasks(contactId) {
    try {
        const tasks = await fetchTasks();
        if (!tasks) return;

        const taskUpdates = getTaskUpdates(tasks, contactId);
        await executeTaskUpdates(taskUpdates);

    } catch (error) {
        console.error('Error updating tasks:', error);
    }
}

/**
 * Fetches all tasks from the database.
 * @returns {Promise<Object>} - Returns the tasks object or null if no tasks are found.
 */
async function fetchTasks() {
    try {
        const response = await fetch(`${DB_URL}/tasks.json`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return null;
    }
}

/**
 * Prepares the task updates by removing the specified contact from assigned_to lists.
 * @param {Object} tasks - All tasks from the database.
 * @param {string} contactId - The ID of the contact to be removed.
 * @returns {Array<Promise>} - Array of fetch requests to update tasks.
 */
function getTaskUpdates(tasks, contactId) {
    const taskUpdates = [];

    for (const taskId in tasks) {
        const task = tasks[taskId];
        const updatedTask = removeContactFromTask(task, contactId);

        if (updatedTask) {
            taskUpdates.push(updateTaskInDatabase(taskId, updatedTask));
        }
    }

    return taskUpdates;
}

/**
 * Removes the specified contact from a task's assigned_to list.
 * @param {Object} task - The task object to modify.
 * @param {string} contactId - The ID of the contact to remove.
 * @returns {Object|null} - Returns the updated task or null if no changes were made.
 */
function removeContactFromTask(task, contactId) {
    const assignedTo = Array.isArray(task.assigned_to) ? task.assigned_to : [];
    const updatedAssignedTo = assignedTo.filter(contact => contact.id !== contactId);

    if (updatedAssignedTo.length !== assignedTo.length) {
        task.assigned_to = updatedAssignedTo;
        return task;
    }

    return null;
}

/**
 * Updates a task in the database.
 * @param {string} taskId - The ID of the task to update.
 * @param {Object} task - The updated task object.
 * @returns {Promise} - A fetch request to update the task.
 */
function updateTaskInDatabase(taskId, task) {
    return fetch(`${DB_URL}/tasks/${taskId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
    });
}

/**
 * Executes all task updates in parallel.
 * @param {Array<Promise>} taskUpdates - An array of fetch requests.
 * @returns {Promise<void>} - Resolves when all updates are complete.
 */
async function executeTaskUpdates(taskUpdates) {
    try {
        await Promise.all(taskUpdates);
    } catch (error) {
        console.error('Error executing task updates:', error);
    }
}
