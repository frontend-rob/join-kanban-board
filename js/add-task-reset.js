/**
 * retrieves all form elements from the dom.
 * @returns {object} an object containing references to all form elements.
 */
function getFormElements() {
    return {
        taskTitle: document.getElementById('task-title'),
        taskDescription: document.getElementById('task-description'),
        assignedTo: document.getElementById('assigned-to'),
        selectedContacts: document.getElementById('selected-contacts'),
        dueDate: document.getElementById('due-date'),
        taskCategory: document.getElementById('task-category'),
        subtaskInput: document.getElementById('input-subtask'),
        subtaskList: document.getElementById('subtask-list'),
        errorTaskTitle: document.getElementById('error-task-title'),
        errorDueDate: document.getElementById('error-due-date'),
        errorTaskCategory: document.getElementById('error-task-category'),
        mediumPriorityButton: document.getElementById('medium-priority-button')
    };
}


/**
 * clears the entire input form by resetting the fields and removing error classes.
 */
function clearInputForm() {
    const elements = getFormElements();
    resetFormFields(elements);
    clearFlatpickr(elements.dueDate);
    resetPriority(elements.mediumPriorityButton);
    removeErrorClasses(elements);
}


/**
 * resets all form fields to their default state (empty values).
 * @param {object} elements - the form elements to reset.
 */
function resetFormFields(elements) {
    elements.taskTitle.value = "";
    elements.taskDescription.value = "";
    elements.assignedTo.value = "";
    elements.selectedContacts.innerHTML = "";
    elements.dueDate.value = "";
    elements.taskCategory.value = "";
    elements.subtaskInput.value = "";
    elements.subtaskList.innerHTML = "";
    localStorage.removeItem('checkboxStates');
}


/**
 * clears the flatpickr date picker, if it exists.
 * @param {object} duedateelement - the due date input element.
 */
function clearFlatpickr(dueDateElement) {
    const datePicker = dueDateElement._flatpickr;
    if (datePicker) datePicker.clear();
}


/**
 * resets the task priority to medium.
 * @param {object} mediumprioritybutton - the button element for setting the priority.
 */
function resetPriority(mediumPriorityButton) {
    if (mediumPriorityButton) setPriority(mediumPriorityButton);
}

/**
 * removes error classes from the input fields.
 * @param {object} elements - the form elements containing inputs and error messages.
 */
function removeErrorClasses(elements) {
    const fields = [
        { input: elements.taskTitle, error: elements.errorTaskTitle },
        { input: elements.dueDate, error: elements.errorDueDate },
        { input: elements.taskCategory, error: elements.errorTaskCategory },
    ];

    fields.forEach(({ input, error }) => {
        input.classList.remove('input-error');
        error.classList.remove('show');
    });
}