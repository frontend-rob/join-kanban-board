let taskPriority = '';
let taskStatus = 'todo';

/**
 * initializes the start content by rendering main page elements and
 * setting up navigation and orientation restrictions on mobile devices.
 * 
 * @async
 * @returns {Promise<void>} - a promise that resolves once the start content is fully initialized.
 */
async function initAddTask() {
    await renderAddTaskContent();
    await setUserDataFromLocalStorage();
    initializeNavigation();
    preventLandscapeOnMobileDevices();
    initializeDatePicker("#due-date");
    addInputEventListeners();
}


/**
 * renders the primary content for the page by loading templates into specific page components.
 * 
 * @async
 * @returns {Promise<void>} - a promise that resolves once the content has been successfully rendered.
 */
async function renderAddTaskContent() {
    const addTaskComponents = getAddTaskComponents();
    loadAddTaskTemplates(addTaskComponents);
}


/**
 * retrieves key components for the page by accessing relevant elements in the DOM.
 * 
 * @returns {Object} - an object containing references to essential page components.
 * @property {HTMLElement} header - the element for injecting header content.
 * @property {HTMLElement} navigation - the element for injecting navigation content.
 * @property {HTMLElement} landscapeModal - the element for injecting landscape modal content.
 */
function getAddTaskComponents() {
    return {
        header: document.getElementById('header-content'),
        navigation: document.getElementById('navigation-content'),
        landscapeModal: document.getElementById('landscape-wrapper')
    };
}


/**
 * loads HTML templates into specified elements on the page.
 * 
 * @param {Object} components - an object containing references to page elements.
 * @param {HTMLElement} components.header - the element for injecting header content.
 * @param {HTMLElement} components.navigation - the element for injecting navigation content.
 * @param {HTMLElement} components.landscapeModal - the element for injecting landscape modal content.
 */
function loadAddTaskTemplates({ header, navigation, landscapeModal }) {
    header.innerHTML = getHeaderContent();
    navigation.innerHTML = getNavigationContent();
    landscapeModal.innerHTML = getLandscapeModalContent();
}


/**
 * sets the task priority and updates button styles
 *
 * @param {HTMLElement} button - the clicked priority button
 */
function setPriority(button) {
    document.querySelectorAll('.prio-buttons .btn').forEach(btn => {
        btn.classList.remove('clicked');
    });

    button.classList.add('clicked');
    switch (button.id) {
        case 'high-priority-button':
            taskPriority = 'high';
            break;
        case 'medium-priority-button':
            taskPriority = 'medium';
            break;
        case 'low-priority-button':
            taskPriority = 'low';
            break;
    }
}



/**
 * initializes the Flatpickr date picker.
 * 
 * @param {string} selector - the ID of the input field to apply Flatpickr.
 */
function initializeDatePicker(selector) {
    flatpickr(selector, {
        minDate: "today",
        dateFormat: "Y-m-d",
        altInput: false,
        altFormat: "Y-m-d",
        disableMobile: "true",
        nextArrow: ">",
        prevArrow: "<"
    });
}


/**
 * toggles dropdown visibility and rotates icon when input is clicked
 */
function toggleCategoryDropdown() {
    const dropdown = document.getElementById('category-dropdown');
    const dropdownIcon = document.getElementById('dropdown-icon');

    dropdown.classList.toggle('hidden');
    dropdown.classList.toggle('show');
    dropdownIcon.classList.toggle('rotated');
}


/**
 * selects a category and closes the dropdown
 * 
 * @param {Event} event - the click event
 */
function selectCategory(event) {
    const selectedCategory = event.target.getAttribute('data-category');
    const categoryInput = document.getElementById('task-category');
    const errorElement = document.getElementById('error-task-category');

    categoryInput.value = selectedCategory;

    if (selectedCategory.trim() !== "") {
        categoryInput.classList.remove('input-error');
        errorElement.classList.remove('show');
    }

    closeCategoryDropdown();
}


/**
 * closes the dropdown and resets icon rotation
 */
function closeCategoryDropdown() {
    const dropdown = document.getElementById('category-dropdown');
    const dropdownIcon = document.getElementById('dropdown-icon');

    dropdown.classList.add('hidden');
    dropdown.classList.remove('show');
    dropdownIcon.classList.remove('rotated');
}


/**
 * closes the dropdown if a click occurs outside
 * 
 * @param {Event} event - the click event
 */
document.addEventListener('click', function (event) {
    const categoryInput = document.getElementById('task-category');
    const dropdown = document.getElementById('category-dropdown');

    if (!categoryInput.contains(event.target) && !dropdown.contains(event.target)) {
        closeCategoryDropdown();
    }
});



/**
 * handles the task addition process by validating the form, gathering data,
 * collecting subtasks, and saving the task to the database.
 * @param {Event} event - the submit event triggered by the form.
 */
async function addTask(event) {
    event.preventDefault();

    if (!validateTaskForm()) return;

    const taskData = gatherTaskData();
    const subtasks = collectSubtasks();

    taskData.subtasks = subtasks;

    try {
        const response = await saveTaskToDatabase(taskData);
        if (!response.ok) throw new Error('error adding task to firebase.');

        handleTaskSuccess();
        await reloadTasksInBoard(response, taskData);

    } catch (error) {
        handleTaskError();
    }
}

/**
 * processes the task response by checking if the 'add-task-content' element exists,
 * and if so, updates the task data and the task template.
 * @param {Object} response - the response object from the database.
 * @param {Object} taskData - the task data to be updated.
 */
async function reloadTasksInBoard(response, taskData) {
    const addTaskContent = document.getElementById('add-task-content');
    if (!addTaskContent) {
        return;
    }

    const responseData = await response.json();
    const newTaskId = responseData.name;
    taskData.id = newTaskId;
    allTasks[newTaskId] = taskData;
    getTaskTemplate(allTasks);
}


/**
 * gathers the task data from the form inputs.
 * @returns {object} - the task data object containing title, description, 
 * due date, category, priority, and assigned contacts.
 */
function gatherTaskData() {
    const taskTitle = document.getElementById('task-title').value;
    const taskDescription = document.getElementById('task-description').value;
    const dueDate = document.getElementById('due-date').value;
    const taskCategory = document.getElementById('task-category').value;
    const taskPriority = getTaskPriority();
    const selectedContacts = getSelectedContacts();

    return {
        title: taskTitle,
        description: taskDescription,
        due_date: dueDate,
        category: taskCategory,
        status: taskStatus,
        priority: taskPriority,
        assigned_to: selectedContacts
    };
}


/**
 * retrieves the priority of the task, defaults to 'medium' if not set.
 * @returns {string} - the priority of the task.
 */
function getTaskPriority() {
    return taskPriority || 'medium';
}


/**
 * collects the selected contacts from the UI.
 * @returns {array} - an array of selected contact objects.
 */
function getSelectedContacts() {
    const selectedIcons = document.querySelectorAll('.selected-profile-icon');
    const selectedContacts = [];

    selectedIcons.forEach(icon => {
        const contactId = icon.getAttribute('data-id');
        const contact = allContacts.find(c => c.id === contactId);
        if (contact) {
            selectedContacts.push({
                id: contactId,
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                initials: contact.initials,
                color: contact.color,
                status: contact.status
            });
        }
    });

    return selectedContacts;
}


/**
 * saves the task data to the database.
 * @param {object} taskData - the task data to be saved.
 * @returns {Promise<Response>} - the fetch response from the database.
 */
async function saveTaskToDatabase(taskData) {
    const response = await fetch(`${DB_URL}/tasks.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
    });
    return response;
}


/**
 * handles the success scenario after a task is added.
 */
async function handleTaskSuccess() {
    if (document.getElementById('add-task-content')) {
        closeAddTaskOverlay();
    }

    await showTaskAddedModal();
    await clearInputForm();

    setTimeout(() => {
        window.location.href = '/pages/board.html';
    }, 2000);
}


/**
 * handles the error scenario if there was an issue adding the task.
 */
function handleTaskError() {
    alert('error adding task. please try again later.');
}


/**
 * displays the modal for failed login attempts and hides it after 2 seconds.
 * 
 * @function
 * @param {HTMLInputElement} emailInput - the input field for the email.
 * @param {HTMLInputElement} passwordInput - the input field for the password.
 * @returns {Promise<void>} a promise that resolves after the modal is hidden.
 */
function showTaskAddedModal() {
    const modal = document.getElementById('task-added-modal');
    modal.classList.remove('hidden');
    modal.classList.add('show');

    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('show');
    }, 2000);
}