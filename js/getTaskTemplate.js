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
 * @param {Object} tasks - The tasks to display.
 */
function getTaskTemplate(tasks) {
    const taskContainers = {
        todo: '',
        inprogress: '',
        awaitfeedback: '',
        done: ''
    };

    for (const taskId in tasks) {
        const task = tasks[taskId];
        const subtasksCompleted = task.subtasks.filter(subtask => subtask.status === "checked").length;
        const totalSubtasks = task.subtasks.length;
        const progressPercentage = totalSubtasks > 0 ? (subtasksCompleted / totalSubtasks) * 100 : 0;

        const assignedToHTML = task.assigned_to.map(person => `
            <div class="profile-icon" style="background-color: ${person.color};">
                ${person.initials}
            </div>
        `).join('');

        const taskTemplate = `
            <div class="task" draggable="true" ondragstart="drag(event)" id="${taskId}" onclick="openTaskOverlay('${taskId}')">
                <div class="task-type">${task.category}</div>
                <span class="task-title">${task.title}</span>
                <p class="task-description">${task.description}</p>
                <div class="subtask">
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${progressPercentage}%"></div>
                    </div>
                    <div class="subtask-text">${subtasksCompleted}/${totalSubtasks} Subtasks</div>
                </div>
                <div class="profile-icon-and-level">
                    <div class="icons">${assignedToHTML}</div>
                    <img class="level" src="../assets/icons/priority-${task.priority}.svg" alt="Priority Level">
                </div>
            </div>
        `;

        taskContainers[task.status] += taskTemplate;
    }

    // Check if there are no tasks in each drop zone and display the "No tasks" message if empty
    if (!taskContainers.todo) {
        taskContainers.todo = `
            <div class="no-tasks-field">
                <span class="no-tasks-text">No tasks To do</span>
            </div>
        `;
    }

    if (!taskContainers.inprogress) {
        taskContainers.inprogress = `
            <div class="no-tasks-field">
                <span class="no-tasks-text">No tasks In progress</span>
            </div>
        `;
    }

    if (!taskContainers.awaitfeedback) {
        taskContainers.awaitfeedback = `
            <div class="no-tasks-field">
                <span class="no-tasks-text">No tasks Awaiting feedback</span>
            </div>
        `;
    }

    if (!taskContainers.done) {
        taskContainers.done = `
            <div class="no-tasks-field">
                <span class="no-tasks-text">No tasks Done</span>
            </div>
        `;
    }

    // Inject the task templates into the respective drop zones
    document.getElementById('todo').innerHTML = taskContainers.todo;
    document.getElementById('inprogress').innerHTML = taskContainers.inprogress;
    document.getElementById('awaitfeedback').innerHTML = taskContainers.awaitfeedback;
    document.getElementById('done').innerHTML = taskContainers.done;
}



/**
 * Opens the task overlay and displays task details.
 * 
 * @param {string} taskId - The ID of the task to be displayed.
 */
function openTaskOverlay(taskId) {
    const task = allTasks[taskId];

    if (task) {
        const overlayContent = `
            <div class="task-type-and-close-container">
                <p class="overlay-task-type">${task.category}</p>
                <span class="close" onclick="closeTaskOverlay()">
                    <img src="../assets/icons/Close.svg" alt="Close Icon">
                </span>
            </div>
            <h2 class="overlay-task-title">${task.title}</h2>
            <p class="overlay-task-description">${task.description}</p>
            <div class="task-date">
                <span class="date-text">Due date:</span>
                <span class="date">${task.due_date}</span>
            </div>
            <div class="priority">
                <span class="priority-text">Priority:</span>
                <div class="priority-container">
                    <span class="level">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                    <img src="../assets/icons/priority-${task.priority}.svg" alt="">
                </div>
            </div>
            <div class="assigned-to">
                <span class="assigned-to-text">Assigned To:</span>
                <div class="persons">${getAssignedToHTML(task.assigned_to)}</div>
            </div>
            <div class="subtask-overlay">
                <span class="subtask-header">Subtasks</span>
                <div class="all-subtasks" id="subtasks-${taskId}">
                    ${getSubtasksHTML(task.subtasks, taskId)}
                </div>
            </div>
            <div class="action">
                <div class="action-type" onclick="deleteTask()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256">
                        <path
                            d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z">
                        </path>
                    </svg>                    
                <span>Delete</span>
            </div>
                <div class="divider-vertical divider-action"></div>
                <div class="action-type" onclick="editTask()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256">
                        <path
                            d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z">
                        </path>
                    </svg>
                    <span>Edit</span>
                </div>
            </div>
        `;

        const overlayElement = document.getElementById('overlay');
        overlayElement.querySelector('.overlay-content').innerHTML = overlayContent;
        overlayElement.setAttribute('data-task-id', taskId);
        overlayElement.style.display = 'flex';
    }
}

/**
 * Closes the task overlay.
 */
function closeTaskOverlay() {
    document.getElementById('overlay').style.display = 'none';
}

/**
 * Generates HTML for assigned persons.
 * 
 * @param {Array} assignedTo - The list of assigned persons.
 * @returns {string} The generated HTML.
 */
function getAssignedToHTML(assignedTo) {
    return assignedTo.map(person => `
        <div class="user">
            <div class="profile-icon" style="background-color: ${person.color};">
                <span style="color: white;">${person.initials}</span>
            </div>
            <span class="profile-name">${person.name}</span>
        </div>
    `).join('');
}

/**
 * Generates HTML for subtasks.
 * 
 * @param {Array} subtasks - The list of subtasks.
 * @param {string} taskId - The ID of the parent task.
 * @returns {string} The generated HTML.
 */
function getSubtasksHTML(subtasks, taskId) {
    return subtasks.map((subtask, index) => `
        <div class="single-subtask" onclick="toggleSubtask('${taskId}', ${index})">
            <img src="../assets/icons/${subtask.status === 'checked' ? 'checked' : 'unchecked'}.svg" alt="${subtask.status}"> 
            <span>${subtask.text}</span>
        </div>
    `).join('');
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
