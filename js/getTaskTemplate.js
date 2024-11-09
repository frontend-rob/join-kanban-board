let allTasks = {};

/**
 * loads tasks from firebase and updates allTasks.
 * 
 * @returns {object} the loaded tasks.
 */
async function loadTasks() {
    try {
        const response = await fetch(`${DB_URL}/tasks.json`, { cache: "no-store" }); // prevents caching
        const data = await response.json();
        allTasks = data ? { ...data } : {}; // ensures data is fully copied
        return allTasks;
    } catch (error) {
        console.error('error loading data:', error);
        return {};
    }
}

/**
 * generates and displays the task templates.
 * 
 * @param {object} tasks - the tasks to display. if empty, displays all tasks.
 * @param {boolean} isSearchActive - indicates if a search is active.
 */
function getTaskTemplate(tasks = allTasks, isSearchActive = false) {
    // exit function if no tasks exist or tasks object is empty
    if (!tasks || Object.keys(tasks).length === 0) return;

    const taskContainers = {
        todo: '',
        inprogress: '',
        awaitfeedback: '',
        done: ''
    };

    const tasksToDisplay = Object.keys(tasks).length ? tasks : allTasks;

    for (const taskId in tasksToDisplay) {
        const task = tasksToDisplay[taskId];

        // ensure task object is valid
        if (!task || typeof task !== "object") continue;

        const progressPercentage = calculateProgress(task);

        // check if task.status is a valid status before adding the template
        if (taskContainers[task.status] !== undefined) {
            const taskTemplate = createTaskTemplate(taskId, task, progressPercentage);
            taskContainers[task.status] += taskTemplate;
        }
    }

    handleEmptyStates(taskContainers, tasks, isSearchActive);

    // force html content override
    document.getElementById('todo').innerHTML = taskContainers.todo;
    document.getElementById('inprogress').innerHTML = taskContainers.inprogress;
    document.getElementById('awaitfeedback').innerHTML = taskContainers.awaitfeedback;
    document.getElementById('done').innerHTML = taskContainers.done;
}

/**
 * calculates the progress percentage of a task's subtasks.
 * 
 * @param {object} task - the task object containing subtasks.
 * @returns {number} - the progress percentage.
 */
function calculateProgress(task) {
    if (!task.subtasks || task.subtasks.length === 0) {
        return 0; // default value if no subtasks are present
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
 * @returns {string} - The HTML template for the task.
 */
function createTaskTemplate(taskId, task, progressPercentage) {
    const taskContent = getTaskContent(taskId, task, progressPercentage);
    return taskContent;
}

/**
 * Handles the empty states for each task category.
 * @param {Object} taskContainers - The container for tasks in each status.
 * @param {Object} tasks - The tasks to display.
 * @param {boolean} isSearchActive - Indicates if a search is currently active.
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
 * Sets "No tasks found" for all categories when no tasks are found during a search.
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
    if (!container) {
        container = `
            <div class="no-tasks-field">
                <span class="no-tasks-text">${message}</span>
            </div>
        `;
    }
}


/**
 * Calculates the progress percentage of a task based on its subtasks.
 * 
 * @param {Object} task - The task object.
 * @returns {number} - The calculated progress percentage.
 */
function calculateTaskProgressPercentage(task) {
    const subtasksCompleted = task.subtasks.filter(subtask => subtask.status === "checked").length;
    const totalSubtasks = task.subtasks.length;
    return totalSubtasks > 0 ? (subtasksCompleted / totalSubtasks) * 100 : 0;
}


/**
 * Updates the task UI with the calculated progress and subtask count.
 * 
 * @param {string} taskId - The ID of the task to update.
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
            const task = allTasks[taskId]; // Retrieving the task again here
            const subtasksCompleted = task.subtasks.filter(subtask => subtask.status === "checked").length;
            const totalSubtasks = task.subtasks.length;
            subtaskText.textContent = `${subtasksCompleted}/${totalSubtasks} Subtasks`;
        }
    }
}


/**
 * Updates the progress of the task in the UI.
 * 
 * @param {string} taskId - The ID of the task to update.
 */
function updateTaskProgress(taskId) {
    const task = allTasks[taskId];
    const progressPercentage = calculateTaskProgressPercentage(task);
    updateTaskUIWithProgress(taskId, progressPercentage);
}


/**
 * Closes the overlay when clicking outside of it.
 */
window.onclick = function(event) {
    const overlay = document.getElementById("overlay");
    if (event.target === overlay) {
        closeTaskOverlay();
    }
}

/**
 * Loads tasks when the document is fully loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
    loadTasks().then(getTaskTemplate);
});

/**
 * Filters tasks based on search input and updates the display.
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