let allTasks = {};

/**
 * Loads tasks from Firebase and updates allTasks.
 * 
 * @returns {object} The loaded tasks.
 */
async function loadTasks() {
    try {
        const response = await fetch(`${DB_URL}/tasks.json`);
        const data = await response.json();
        allTasks = data ? { ...data } : {};
        return allTasks;
    } catch (error) {
        console.error('Error loading data:', error);
        return {};
    }
}

/**
 * Generates and displays task templates.
 * 
 * @param {object} tasks - The tasks to be displayed. If empty, displays all tasks.
 * @param {boolean} isSearchActive - Indicates if a search is active.
 */
function getTaskTemplate(tasks = allTasks, isSearchActive = false) {
    const taskContainers = {
        todo: '',
        inprogress: '',
        awaitfeedback: '',
        done: ''
    };

    if (!tasks || Object.keys(tasks).length === 0) {
        displayNoTasksMessage(isSearchActive);
        return;
    }

    for (const taskId in tasks) {
        const task = tasks[taskId];
        if (!task || typeof task !== "object") continue;

        const progressPercentage = calculateProgress(task);

        if (taskContainers[task.status] !== undefined) {
            const taskTemplate = createTaskTemplate(taskId, task, progressPercentage);
            taskContainers[task.status] += taskTemplate;
        }
    }

    handleEmptyStates(taskContainers, tasks, isSearchActive);
    updateTaskContainers(taskContainers);
}

/**
 * Displays a "No tasks found" message when no tasks exist or the search yields no results.
 * 
 * @param {boolean} isSearchActive - Indicates if the search is active.
 */
function displayNoTasksMessage(isSearchActive) {
    const message = isSearchActive
        ? `<div class="no-tasks-field"><span class="no-tasks-text">No tasks found</span></div>`
        : `<div class="no-tasks-field"><span class="no-tasks-text">No tasks available</span></div>`;

    document.getElementById('todo').innerHTML = message;
    document.getElementById('inprogress').innerHTML = message;
    document.getElementById('awaitfeedback').innerHTML = message;
    document.getElementById('done').innerHTML = message;
}

/**
 * Calculates the progress of a task based on its subtasks.
 * 
 * @param {object} task - The task object.
 * @returns {number} The calculated progress percentage.
 */
function calculateProgress(task) {
    if (!task.subtasks || task.subtasks.length === 0) {
        return 0;
    }

    const subtasksCompleted = task.subtasks.filter(subtask => subtask.status === "checked").length;
    const totalSubtasks = task.subtasks.length;
    return (subtasksCompleted / totalSubtasks) * 100;
}

/**
 * Creates the HTML template for a task.
 * 
 * @param {string} taskId - The ID of the task.
 * @param {Object} task - The task object.
 * @param {number} progressPercentage - The progress percentage of the task.
 * @returns {string} The HTML template for the task.
 */
function createTaskTemplate(taskId, task, progressPercentage) {
    const taskContent = getTaskContent(taskId, task, progressPercentage);
    return taskContent;
}

/**
 * Handles empty states for each task category.
 * @param {Object} taskContainers - The container for tasks in each status.
 * @param {Object} tasks - The tasks to be displayed.
 * @param {boolean} isSearchActive - Indicates if the search is active.
 */
function handleEmptyStates(taskContainers, tasks, isSearchActive) {
    if (isSearchActive && Object.keys(tasks).length === 0) {
        setAllCategoriesNoTasks(taskContainers);
    } else {
        handleEmptyStateForCategory(taskContainers.todo, 'todo', 'No tasks to do');
        handleEmptyStateForCategory(taskContainers.inprogress, 'inprogress', 'No tasks in progress');
        handleEmptyStateForCategory(taskContainers.awaitfeedback, 'awaitfeedback', 'No tasks awaiting feedback');
        handleEmptyStateForCategory(taskContainers.done, 'done', 'No tasks done');
    }
}

/**
 * Sets the "No tasks found" message for all categories when no tasks are found during a search.
 * @param {Object} taskContainers - The container for tasks in each status.
 */
function setAllCategoriesNoTasks(taskContainers) {
    const noTasksMessage = `
        <div class="no-tasks-field">
            <span class="no-tasks-text">No tasks found</span>
        </div>
    `;
    taskContainers.todo = taskContainers.inprogress = taskContainers.awaitfeedback = taskContainers.done = noTasksMessage;
}

/**
 * Handles the empty state for a specific task category.
 * @param {string} container - The container where tasks are stored.
 * @param {string} category - The task category (e.g. "todo", "inprogress").
 * @param {string} message - The message to display when there are no tasks in the category.
 */
function handleEmptyStateForCategory(container, category, message) {
    if (!container || container.trim() === '') {
        container = `
            <div class="no-tasks-field">
                <span class="no-tasks-text">${message}</span>
            </div>
        `;
    }
}

/**
 * Updates the task UI with the progress and the number of subtasks.
 * 
 * @param {string} taskId - The ID of the task.
 * @param {number} progressPercentage - The calculated progress percentage.
 */
function updateTaskUIWithProgress(taskId, progressPercentage) {
    const taskElement = document.getElementById(taskId);
    if (taskElement) {
        const progressBar = taskElement.querySelector('.progress-bar');
        const subtaskText = taskElement.querySelector('.subtask-text');

        if (progressBar) {
            progressBar.style.width = `${progressPercentage}%`;
        }
        if (subtaskText) {
            const task = allTasks[taskId];
            const subtasksCompleted = task.subtasks.filter(subtask => subtask.status === "checked").length;
            const totalSubtasks = task.subtasks.length;
            subtaskText.textContent = `${subtasksCompleted}/${totalSubtasks} Subtasks`;
        }
    }
}

/**
 * Updates the task containers with the corresponding task HTML.
 * 
 * @param {Object} taskContainers - The task containers to update.
 */
function updateTaskContainers(taskContainers) {
    const categories = ['todo', 'inprogress', 'awaitfeedback', 'done'];

    categories.forEach(category => {
        const container = taskContainers[category] || getNoTasksHTML(`No tasks ${getCategoryText(category)}`);
        document.getElementById(category).innerHTML = container;
    });
}

/**
 * Returns the display text for a task category.
 * 
 * @param {string} category - The task category (e.g., "todo", "inprogress").
 * @returns {string} The display text for the category.
 */
function getCategoryText(category) {
    const categoryTexts = {
        todo: 'to do',
        inprogress: 'in progress',
        awaitfeedback: 'awaiting feedback',
        done: 'done'
    };
    return categoryTexts[category] || category;
}

/**
 * Returns the HTML for the "No tasks" message for a given category.
 * 
 * @param {string} message - The message to display.
 * @returns {string} The HTML string for the "No tasks" message.
 */
function getNoTasksHTML(message) {
    return `<div class="no-tasks-field"><span class="no-tasks-text">${message}</span></div>`;
}

/**
 * Updates the progress of a task.
 * 
 * @param {string} taskId - The ID of the task.
 */
function updateTaskProgress(taskId) {
    const task = allTasks[taskId];
    const progressPercentage = calculateProgress(task);
    updateTaskUIWithProgress(taskId, progressPercentage);
}

/**
 * Filters tasks based on the search input and updates the display.
 * 
 * @param {string} query - The search query entered by the user.
 */
function searchTasks(query) {
    const filteredTasks = {};
    const isSearchActive = query.length > 0;

    for (const taskId in allTasks) {
        const task = allTasks[taskId];
        if (
            task.title.toLowerCase().includes(query.toLowerCase()) ||
            task.description.toLowerCase().includes(query.toLowerCase())
        ) {
            filteredTasks[taskId] = task;
        }
    }

    getTaskTemplate(filteredTasks, isSearchActive);
}

document.querySelectorAll('.search').forEach(searchBar => {
    searchBar.querySelector('input').addEventListener('input', (event) => {
        const query = event.target.value;
        searchTasks(query);
    });
});


// This function is triggered when a click occurs outside the overlay.
window.onclick = function(event) {
    const overlay = document.getElementById("overlay");
    if (overlay && event.target === overlay) {
        closeTaskOverlay();
    }
};


