/**
 * toggles the visibility of the contact dropdown and rotates the dropdown icon.
 */
function toggleContactDropdownEditTask() {
    const contactDropdown = document.getElementById('contact-dropdown-edit-task');
    const contactDropdownIcon = document.getElementById('contact-dropdown-icon');

    contactDropdown.classList.toggle('hidden');
    contactDropdown.classList.toggle('show');
    contactDropdownIcon.classList.toggle('rotated');

    if (contactDropdown.classList.contains('show')) {
        renderContactsEditTask();
        setTimeout(() => {
            preselectAssignedContacts();
        }, 100);
    }
}


/**
 * closes the contact dropdown and resets the icon rotation.
 */
function closeContactDropdownEditTask() {
    const contactDropdown = document.getElementById('contact-dropdown-edit-task');
    const contactDropdownIcon = document.getElementById('contact-dropdown-icon');

    contactDropdown.classList.add('hidden');
    contactDropdown.classList.remove('show');
    contactDropdownIcon.classList.remove('rotated');
}


/**
 * closes the contact dropdown when a click occurs outside of the dropdown or input field.
 * 
 * @param {MouseEvent} event - the mouse event triggered by a click.
 */
document.addEventListener('click', function (event) {
    const assignedInput = document.getElementById('assigned-to-edit-task');
    const contactDropdown = document.getElementById('contact-dropdown-edit-task');

    if (
        assignedInput &&
        contactDropdown &&
        !assignedInput.contains(event.target) &&
        !contactDropdown.contains(event.target)
    ) {
        closeContactDropdownEditTask();
    }
});


/**
 * prepares the contact dropdown for rendering.
 * @returns {HTMLElement} the prepared contact dropdown element.
 */
function prepareContactDropdownEditTask() {
    const contactDropdown = document.getElementById('contact-dropdown-edit-task');
    contactDropdown.classList.remove('hidden');
    contactDropdown.innerHTML = '';
    return contactDropdown;
}


/**
 * filters contacts based on the search term and updates the dropdown display.
 */
function searchContactsEditTask() {
    const searchTerm = document.getElementById('assigned-to-edit-task').value.toLowerCase();
    const filteredContacts = allContacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm)
    );

    renderFilteredContacts(filteredContacts);
}


/**
 * fetches and renders contacts in the dropdown.
 * ensures the user contact appears first and the rest are sorted alphabetically.
 */
async function renderContactsEditTask() {
    const contactDropdown = prepareContactDropdownEditTask();

    const contacts = await fetchContacts();
    if (!contacts) {
        displayError(contactDropdown);
        return;
    }

    const sortedContacts = sortContactsAlphabetically(contacts);
    const updatedContacts = prioritizeUserContact(sortedContacts);
    renderContactList(contactDropdown, updatedContacts);
    initializeContactInteractions();
}

/**
 * Saves the edited task changes back to Firebase.
 * @param {Event} event - The form submission event.
 * @param {string} taskId - The ID of the task to update.
 */
async function saveTaskChanges(event, taskId) {
    event.preventDefault();

    try {
        const updatedTaskData = await gatherUpdatedTaskData();
        const response = await sendUpdateRequestToFirebase(taskId, updatedTaskData);
        updateTaskUIAndReloadBoard(taskId, updatedTaskData, response);
    } catch (error) {
        console.error('Error saving task:', error);
        showErrorMessage('Error updating the task');
    }
}

/**
 * Gathers all updated data for the task.
 * @returns {Object} The updated task data.
 */
async function gatherUpdatedTaskData() {
    const title = getTaskTitle();
    const description = getTaskDescription();
    const dueDate = getTaskDueDate();
    const priority = getTaskPriority();
    const assignedContacts = await getAssignedContacts();
    const subtasks = getSubtasks();

    return {
        title,
        description,
        due_date: dueDate,
        priority,
        assigned_to: assignedContacts,
        subtasks
    };
}

/**
 * Retrieves the title of the task from the form input.
 * @returns {string} The task title.
 */
function getTaskTitle() {
    return document.getElementById('task-title').value.trim();
}

/**
 * Retrieves the description of the task from the form input.
 * @returns {string} The task description.
 */
function getTaskDescription() {
    return document.getElementById('task-description').value.trim();
}

/**
 * Retrieves the due date for the task from the form input.
 * @returns {string} The due date.
 */
function getTaskDueDate() {
    return document.getElementById('due-date-edit-task').value;
}

/**
 * Retrieves the priority of the task based on the selected priority button.
 * @returns {string} The task priority.
 */
function getTaskPriority() {
    return document.querySelector('.prio-buttons .clicked')?.id.replace('-priority-button', '') || 'low';
}

/**
 * Retrieves the assigned contacts for the task based on the selected contacts in the UI.
 * @returns {Array<Object>} The list of assigned contacts.
 */
async function getAssignedContacts() {
    const selectedContactIds = Array.from(document.querySelectorAll('#selected-contacts-edit-task .selected-profile-icon'))
        .map(contactIcon => contactIcon.dataset.id);

    const assignedContacts = await Promise.all(selectedContactIds.map(async (contactId) => {
        const contactData = await getContactDataFromFirebase(contactId);
        return contactData ? {
            id: contactId,
            initials: contactData.initials,
            color: contactData.color,
            name: contactData.name
        } : null;
    }));

    return assignedContacts.filter(contact => contact !== null);
}

/**
 * Retrieves the subtasks for the task from the UI.
 * @returns {Array<Object>} The list of subtasks.
 */
function getSubtasks() {
    return Array.from(document.querySelectorAll('.subtask-item')).map(subtaskItem => {
        return {
            text: subtaskItem.querySelector('.subtask-edit-input').value,
            status: 'unchecked'
        };
    });
}

/**
 * Sends an update request to Firebase to update the task data.
 * @param {string} taskId - The ID of the task to update.
 * @param {Object} updatedTaskData - The updated task data.
 * @returns {Promise<Response>} The response from the server.
 */
async function sendUpdateRequestToFirebase(taskId, updatedTaskData) {
    const response = await fetch(`${DB_URL}/tasks/${taskId}.json`, {
        method: 'PATCH',
        body: JSON.stringify(updatedTaskData),
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        throw new Error('Failed to update task');
    }

    return response;
}

/**
 * Updates the task UI and reloads the task board after a successful update.
 * @param {string} taskId - The ID of the updated task.
 * @param {Object} updatedTaskData - The updated task data.
 * @param {Response} response - The response from the update request.
 */
function updateTaskUIAndReloadBoard(taskId, updatedTaskData, response) {
    allTasks[taskId] = { ...allTasks[taskId], ...updatedTaskData };

    closeTaskOverlay();
    updateTaskInUI(taskId, updatedTaskData);
    reloadTasksInBoard(response, updatedTaskData);

    localStorage.removeItem('checkboxStates');
    localStorage.removeItem('selectedContacts');
    clearInputForm();
}

/**
 * Retrieves contact data from Firebase by ID.
 * @param {string} contactId - The ID of the contact to fetch.
 * @returns {Object|null} The contact data or null if not found.
 */
async function getContactDataFromFirebase(contactId) {
    try {
        const response = await fetch(`${DB_URL}/contacts/${contactId}.json`);
        if (!response.ok) {
            throw new Error('Failed to fetch contact data');
        }
        const contactData = await response.json();

        return {
            name: contactData.name,
            initials: contactData.initials,
            color: contactData.color
        };
    } catch (error) {
        console.error('Error retrieving contact data:', error);
        return null;
    }
}


/**
 * Fetches the contact data from Firebase for a specific contact ID.
 * 
 * @param {string} contactId - The ID of the contact.
 * @returns {Promise<Object>} The contact data, including name, initials, and color.
 */
async function getContactDataFromFirebase(contactId) {
    try {
        const response = await fetch(`${DB_URL}/contacts/${contactId}.json`);
        if (!response.ok) {
            throw new Error('Failed to fetch contact data');
        }
        const contactData = await response.json();

        return {
            name: contactData.name,
            initials: contactData.initials,
            color: contactData.color
        };
    } catch (error) {
        console.error('Error fetching contact data:', error);
        return null;
    }
}


/**
 * Sends a PATCH request to Firebase to update the task data.
 * 
 * @param {string} taskId - The ID of the task to update.
 * @param {Object} updatedTaskData - The data to update the task with.
 * @returns {Promise<Response>} The response from the Firebase API.
 */
async function sendUpdateRequestToFirebase(taskId, updatedTaskData) {
    const response = await fetch(`${DB_URL}/tasks/${taskId}.json`, {
        method: 'PATCH',
        body: JSON.stringify(updatedTaskData),
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        throw new Error('Failed to update task');
    }

    return response;
}

/**
 * Updates the task UI and reloads the task board.
 * 
 * @param {string} taskId - The task ID to update in the UI.
 * @param {Object} updatedTaskData - The updated task data.
 * @param {Response} response - The response from the Firebase API.
 */
function updateTaskUIAndReloadBoard(taskId, updatedTaskData, response) {
    allTasks[taskId] = { ...allTasks[taskId], ...updatedTaskData };
    closeTaskOverlay();
    updateTaskInUI(taskId, updatedTaskData);
    reloadTasksInBoard(response, updatedTaskData);
    localStorage.removeItem('checkboxStates');
    localStorage.removeItem('selectedContacts');
    clearInputForm();
}


/**
 * Handles editing of a task.
 * 
 * @param {string} taskId - The ID of the task to edit.
 */
async function editTask(taskId) {
    try {
        const taskData = await fetchFromFirebase(`${DB_URL}/tasks/${taskId}.json`);
        if (!taskData) {
            throw new Error('Task nicht gefunden');
        }

        document.body.classList.add('no-scroll');

        const overlayContent = document.querySelector('.overlay-content');
        overlayContent.innerHTML = generateEditTaskHTML(taskData, taskId);
        initializeDatePicker("#due-date-edit-task");
    } catch (error) {
        console.error('Error fetching task data:', error);
    }
}

