/**
 * validates the task form.
 *
 * @returns {boolean} true if the form is valid, false otherwise.
 */
function validateTaskForm() {
    const inputs = getTaskFormInputs();
    const validations = validateTaskInputs(inputs);
    return areAllTaskValid(validations);
}


/**
 * retrieves the form input elements for the task form.
 *
 * @returns {Object} an object containing the input elements.
 */
function getTaskFormInputs() {
    return {
        title: document.getElementById('task-title'),
        dueDate: document.getElementById('due-date'),
        category: document.getElementById('task-category')
    };
}


/**
 * validates all input fields in the task form.
 *
 * @param {Object} inputs - the form input elements.
 * @returns {Object} an object containing validation results.
 */
function validateTaskInputs(inputs) {
    return {
        isTitleValid: validateTitle(inputs.title),
        isDueDateValid: validateDueDate(inputs.dueDate),
        isCategoryValid: validateCategory(inputs.category)
    };
}


/**
 * checks if all validations are true.
 * 
 * @param {Object} validations - the validation results.
 * @returns {boolean} true if all validations are valid, false otherwise.
 */
function areAllTaskValid(validations) {
    return Object.values(validations).every(valid => valid);
}


/**
 * clears the task form inputs.
 * 
 * @param {Object} inputs - the form input elements.
 */
function clearTaskForm(inputs) {
    inputs.title.value = '';
    inputs.dueDate.value = '';
    inputs.category.value = '';
}


/**
 * updates the error state of a task input field and its corresponding error message.
 * 
 * @param {HTMLElement} input - the input element to update.
 * @param {HTMLElement} errorElement - the corresponding error message element.
 * @param {boolean} isValid - whether the input is valid or not.
 */
function setTaskInputErrorState(input, errorElement, isValid) {
    if (isValid) {
        input.classList.remove('input-error');
        errorElement.classList.remove('show');
    } else {
        input.classList.add('input-error');
        errorElement.classList.add('show');
    }
}


/**
 * validates the task title input.
 * checks if the title is not empty.
 * 
 * @param {HTMLInputElement} titleInput - the task title input element.
 * @returns {boolean} true if the title is valid, false otherwise.
 */
function validateTitle(titleInput) {
    const errorTitle = document.getElementById('error-task-title');
    const isValid = titleInput.value.trim() !== '';

    setTaskInputErrorState(titleInput, errorTitle, isValid);
    return isValid;
}


/**
 * validates the task due date input.
 * checks if the due date is selected.
 *
 * @param {HTMLInputElement} dueDateInput - the task due date input element.
 * @returns {boolean} true if the due date is valid, false otherwise.
 */
function validateDueDate(dueDateInput) {
    const errorDueDate = document.getElementById('error-due-date');
    const isValid = dueDateInput.value.trim() !== '';

    setTaskInputErrorState(dueDateInput, errorDueDate, isValid);
    return isValid;
}


/**
 * validates the task category input.
 * checks if the category is selected.
 *
 * @param {HTMLSelectElement} categoryInput - the task category select element.
 * @returns {boolean} true if the category is valid, false otherwise.
 */
function validateCategory(categoryInput) {
    const errorCategory = document.getElementById('error-task-category');
    const isValid = categoryInput.value.trim() !== '';

    setTaskInputErrorState(categoryInput, errorCategory, isValid);
    return isValid;
}


/**
 * adds event listeners to inputs for real-time error handling.
 */
function addInputEventListeners() {
    const titleInput = document.getElementById('task-title');
    const dueDateInput = document.getElementById('due-date');
    const categoryInput = document.getElementById('task-category');

    titleInput.addEventListener('input', function () {
        const errorTitle = document.getElementById('error-task-title');
        setTaskInputErrorState(titleInput, errorTitle, titleInput.value.trim() !== '');
    });

    dueDateInput.addEventListener('input', function () {
        const errorDueDate = document.getElementById('error-due-date');
        setTaskInputErrorState(dueDateInput, errorDueDate, dueDateInput.value.trim() !== '');
    });

    categoryInput.addEventListener('input', function () {
        const errorCategory = document.getElementById('error-task-category');
        setTaskInputErrorState(categoryInput, errorCategory, categoryInput.value.trim() !== '');
    });
}
