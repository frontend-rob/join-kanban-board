let allTasks = {};

/**
 * Loads tasks from Firebase.
 * 
 * @returns {Object} The loaded tasks.
 */
async function loadTasks() {
    try {
        const response = await fetch(`${DB_URL}/tasks.json`);
        const data = await response.json();
        allTasks = data || {};
        return allTasks;
    } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        return {};
    }
}

/**
 * Generates and displays the task templates.
 * 
 * @param {Object} tasks - The tasks to display. If empty, display all tasks.
 * @param {boolean} isSearchActive - Indicates if a search is currently active.
 */
function getTaskTemplate(tasks = allTasks, isSearchActive = false) {
    const taskContainers = {
        todo: '',
        inprogress: '',
        awaitfeedback: '',
        done: ''
    };

    const tasksToDisplay = Object.keys(tasks).length ? tasks : allTasks;

    for (const taskId in tasksToDisplay) {
        const task = tasksToDisplay[taskId];
        const progressPercentage = calculateProgress(task);

        const taskTemplate = createTaskTemplate(taskId, task, progressPercentage);
        taskContainers[task.status] += taskTemplate;
    }

    handleEmptyStates(taskContainers, tasks, isSearchActive);

    document.getElementById('todo').innerHTML = taskContainers.todo;
    document.getElementById('inprogress').innerHTML = taskContainers.inprogress;
    document.getElementById('awaitfeedback').innerHTML = taskContainers.awaitfeedback;
    document.getElementById('done').innerHTML = taskContainers.done;
}

/**
 * Calculate the progress percentage of the task's subtasks.
 * 
 * @param {Object} task - The task object containing subtasks.
 * @returns {number} - The progress percentage.
 */
function calculateProgress(task) {
    const subtasksCompleted = task.subtasks.filter(subtask => subtask.status === "checked").length;
    const totalSubtasks = task.subtasks.length;
    return totalSubtasks > 0 ? (subtasksCompleted / totalSubtasks) * 100 : 0;
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
 * 
 * @param {Object} taskContainers - The container for tasks in each status.
 * @param {Object} tasks - The tasks to display.
 * @param {boolean} isSearchActive - Indicates if a search is currently active.
 */

function handleEmptyStates(taskContainers, tasks, isSearchActive) {
    if (isSearchActive && Object.keys(tasks).length === 0) {
        taskContainers.todo = taskContainers.inprogress = taskContainers.awaitfeedback = taskContainers.done = `
            <div class="no-tasks-field">
                <span class="no-tasks-text">No tasks found</span>
            </div>
        `;
    } else {
        if (!taskContainers.todo) {
            taskContainers.todo = `
                <div class="no-tasks-field">
                    <span class="no-tasks-text">No tasks to do</span>
                </div>
            `;
        }

        if (!taskContainers.inprogress) {
            taskContainers.inprogress = `
                <div class="no-tasks-field">
                    <span class="no-tasks-text">No tasks in progress</span>
                </div>
            `;
        }

        if (!taskContainers.awaitfeedback) {
            taskContainers.awaitfeedback = `
                <div class="no-tasks-field">
                    <span class="no-tasks-text">No tasks awaiting feedback</span>
                </div>
            `;
        }

        if (!taskContainers.done) {
            taskContainers.done = `
                <div class="no-tasks-field">
                    <span class="no-tasks-text">No tasks done</span>
                </div>
            `;
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
    const subtasksCompleted = task.subtasks.filter(subtask => subtask.status === "checked").length;
    const totalSubtasks = task.subtasks.length;
    const progressPercentage = totalSubtasks > 0 ? (subtasksCompleted / totalSubtasks) * 100 : 0;

    const taskElement = document.getElementById(taskId);
    if (taskElement) {
        const progressBar = taskElement.querySelector('.progress-bar');
        const subtaskText = taskElement.querySelector('.subtask-text');

        if (progressBar) {
            progressBar.style.width = `${progressPercentage}%`;
        }
        if (subtaskText) {
            subtaskText.textContent = `${subtasksCompleted}/${totalSubtasks} Subtasks`;
        }
    }
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

document.getElementById('search-bar').querySelector('input').addEventListener('input', (event) => {
    const query = event.target.value;
    searchTasks(query);
});
