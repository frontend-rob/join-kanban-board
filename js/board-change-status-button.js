let openMenuForTask = null;

/**
 * Shows the status menu for a specific task.
 * @param {string} taskId - The ID of the task to show the menu for.
 * @param {Event} event - The click event that triggered the menu display.
 */
function showStatusMenu(taskId, event) {
    event.stopPropagation();

    if (openMenuForTask && openMenuForTask !== taskId) {
        closeStatusMenu(openMenuForTask);
    }

    if (openMenuForTask === taskId) {
        closeStatusMenu(taskId);
        return;
    }

    openMenuForTask = taskId;

    let statusMenu = getStatusMenu(taskId);
    if (!statusMenu) {
        statusMenu = createStatusMenu(taskId);
        document.body.appendChild(statusMenu);
    }

    positionMenu(statusMenu, taskId);
    statusMenu.style.display = 'block';
}

/**
 * Gets the status menu for a specific task.
 * @param {string} taskId - The ID of the task to get the menu for.
 * @returns {HTMLElement} - The status menu element for the task.
 */
function getStatusMenu(taskId) {
    return document.querySelector(`#menu-for-${taskId}`);
}

/**
 * Creates the status menu if it doesn't exist for the task.
 * @param {string} taskId - The ID of the task to create the menu for.
 * @returns {HTMLElement} - The newly created status menu element.
 */
function createStatusMenu(taskId) {
    const statusMenu = document.createElement('div');
    statusMenu.id = `menu-for-${taskId}`;
    statusMenu.className = 'mobile-menu-status';

    const task = allTasks[taskId];
    const status = task.status;

    let menuButtons = generateMenuButtons(status, taskId);
    statusMenu.innerHTML = menuButtons;

    return statusMenu;
}

/**
 * Generates the buttons for the status menu based on the task's status.
 * @param {string} status - The current status of the task.
 * @param {string} taskId - The ID of the task to generate the buttons for.
 * @returns {string} - HTML string for the menu buttons.
 */
function generateMenuButtons(status, taskId) {
    let menuButtons = '';

    if (status !== 'todo') {
        menuButtons += `<button class="nav-link" onclick="handleMenuClick(event, '${taskId}', 'todo')">Todo</button>`;
    }
    if (status !== 'inprogress') {
        menuButtons += `<button class="nav-link" onclick="handleMenuClick(event, '${taskId}', 'inprogress')">In Progress</button>`;
    }
    if (status !== 'awaitfeedback') {
        menuButtons += `<button class="nav-link" onclick="handleMenuClick(event, '${taskId}', 'awaitfeedback')">Await Feedback</button>`;
    }
    if (status !== 'done') {
        menuButtons += `<button class="nav-link" onclick="handleMenuClick(event, '${taskId}', 'done')">Done</button>`;
    }

    return menuButtons;
}

/**
 * Handles the click on a menu button to update the task status and close the menu.
 * @param {Event} event - The click event that triggered the status update.
 * @param {string} taskId - The ID of the task to update.
 * @param {string} newStatus - The new status to set for the task.
 */
function handleMenuClick(event, taskId, newStatus) {
    event.stopPropagation();
    updateTaskStatus(taskId, newStatus);
    closeStatusMenu(taskId);
}

/**
 * Closes the status menu for a specific task.
 * @param {string} taskId - The ID of the task whose menu should be closed.
 */
function closeStatusMenu(taskId) {
    const statusMenu = document.querySelector(`#menu-for-${taskId}`);
    if (statusMenu) {
        statusMenu.style.display = 'none';
    }
    openMenuForTask = null;
}

/**
 * Moves a task to a new category based on its status.
 * @param {string} taskId - The ID of the task to move.
 * @param {string} newStatus - The new status (category) for the task.
 */
function moveTaskToCategory(taskId, newStatus) {
    const taskElement = document.getElementById(taskId);
    const newCategoryContainer = document.getElementById(newStatus);
    newCategoryContainer.appendChild(taskElement);
}

/**
 * Positions the status menu near the button that triggered it.
 * @param {HTMLElement} menu - The menu element to position.
 * @param {string} taskId - The ID of the task to locate the button.
 */
function positionMenu(menu, taskId) {
    const taskElement = document.getElementById(taskId);
    const buttonElement = taskElement.querySelector('.mobile-status-button');
    if (!buttonElement) return;

    const rect = buttonElement.getBoundingClientRect();

    let menuLeftPosition = rect.left - menu.offsetWidth;

    if (menuLeftPosition < 0) {
        menuLeftPosition = rect.right;
    }

    const menuTopPosition = rect.top + window.scrollY + buttonElement.offsetHeight;

    menu.style.position = 'absolute';
    menu.style.left = `${menuLeftPosition - 140}px`;
    menu.style.top = `${menuTopPosition - 20}px`;
    menu.style.zIndex = '1000';
    menu.style.display = 'block';
}

/**
 * Event listener that handles clicks on the body to open the overlay only if no menu is open.
 * @param {Event} event - The click event on the document body.
 */
document.body.addEventListener('click', function(event) {
    if (!event.target.closest('.mobile-status-button') && openMenuForTask === null) {
    }
});

// Add event listeners for scrolling
window.addEventListener('scroll', closeMenuOnScroll);
window.addEventListener('wheel', closeMenuOnScroll);
window.addEventListener('touchmove', closeMenuOnScroll); // For mobile devices

/**
 * Closes the status menu if the user starts scrolling.
 */
function closeMenuOnScroll() {
    if (openMenuForTask !== null) {
        closeStatusMenu(openMenuForTask);
    }
}
