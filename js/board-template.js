/**
 * Constructs the complete HTML for a task card using the prepared data.
 *
 * @param {string} taskId - The unique ID of the task.
 * @param {Object} task - The task object containing its details.
 * @param {number} progressPercentage - The progress percentage of the task's subtasks.
 * @param {Object} assignedTo - The processed assigned users data.
 * @param {Object} subtasks - The processed subtasks data.
 * @param {string} escapedDescription - The escaped HTML-safe task description.
 * @returns {string} The HTML string representing the task card.
 */
function renderTaskHTML(taskId, task, progressPercentage, assignedTo, subtasks, escapedDescription) {
    const assignedToHTML = renderAssignedIcons(assignedTo);

    return `
        <div 
            class="task" 
            draggable="true" 
            ondragstart="drag(event)" 
            id="${taskId}" 
            ontouchstart="handleTouchStart(event, '${taskId}')"
            ontouchmove="handleTouchMove(event)"
            ontouchend="handleTouchEnd(event)"
            onclick="handleTaskClick(event, '${taskId}')"
        >
            <div class="task-type ${task.category === 'Technical Task' ? 'technical-task' : 'user-story'}">
                ${escapeHtml(task.category)}
            </div>
            <span class="task-title">${escapeHtml(task.title)}</span>
            <p class="task-description">${escapedDescription}</p>
            <div class="${subtasks.subtaskClass}">
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${progressPercentage}%"></div>
                </div>
                <div class="subtask-text">${subtasks.completed}/${subtasks.total} Subtasks</div>
            </div>
            <div class="profile-icon-and-level">
                <div class="icons">${assignedToHTML}</div>
                <img class="level" src="../assets/icons/priority-${task.priority}.svg" alt="Priority Level">
            </div>
        </div>
    `;
}


/**
 * Creates the HTML template for the task overlay.
 * 
 * @param {Object} task - The task object to display.
 * @returns {string} - The HTML template for the task overlay.
 */
function getTaskOverlayContent(task) {
    return `
        <div class="task-details">
            <div class="task-type-and-close-container">
                <div class="task-type-overlay ${task.category === 'Technical Task' ? 'technical-task' : 'user-story'}">
                    ${escapeHtml(task.category)}
                </div>
                <span class="close" onclick="closeTaskOverlay()">
                    <img src="../assets/icons/Close.svg" alt="Close Icon">
                </span>
            </div>
            <h2 class="overlay-task-title">${escapeHtml(task.title)}</h2>
            <p class="overlay-task-description">${escapeHtml(task.description)}</p>
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
                <div class="all-subtasks" id="subtasks-${task.id}">
                    ${getSubtasksHTML(task.subtasks, task.id)}
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
                <div class="action-type" onclick="editTask(document.getElementById('overlay').getAttribute('data-task-id'))">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256">
                        <path
                            d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z">
                        </path>
                    </svg>
                    <span>Edit</span>
                </div>
            </div>
        </div>
    `;
}


/**
 * Generates the HTML content for the "Add Task" overlay.
 *
 * @returns {string} The HTML string representing the "Add Task" overlay content.
 *
 * This function constructs and returns the HTML structure for the "Add Task" form. 
 * It includes various input fields for entering task details such as title, description, 
 * assigned users, due date, priority, category, and subtasks. 
 * The form also includes interactive elements like dropdowns for categories and contacts, 
 * and buttons to add subtasks or clear the form.
 */
function getAddTaskContent() {
    return `
        <section id="add-task-content" class="main-content add-task-overlay-main-content">
            <div class="section-headline">
                <h1 class="main-headline">Add Task</h1>
            </div>
            <form id="add-task-form" class="add-task-form add-task-overlay" onsubmit="addTask(event); return false;" novalidate>
                <div class="left-column">
                    <div class="input-group">
                        <label for="task-title">Title<span class="required">*</span></label>
                        <div class="input-field">
                            <input type="text" id="task-title" placeholder="Enter a title" required>
                            <p id="error-task-title" class="error-message">
                                *This field is required.
                            </p>
                        </div>
                    </div>
                    <div class="input-group">
                        <label for="task-description">Description</label>
                        <div class="input-field">
                            <textarea id="task-description" placeholder="Enter a Description" rows="5"></textarea>
                        </div>
                    </div>
                    <div class="input-group">
                        <label for="assigned-to">Assigned to</label>
                        <div class="input-field">
                            <input type="text" id="assigned-to" placeholder="Select contacts to assign" onclick="toggleContactDropdown()" oninput="searchContacts()" autocomplete="off">
                            <svg id="contact-dropdown-icon" class="dropdown-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z">
                                </path>
                            </svg>
                            <div id="contact-dropdown" class="contact-dropdown absolute hidden"></div>
                        </div>
                        <div id="selected-contacts" class="selected-contacts"></div>
                    </div>
                </div>


                <div class="right-column">
                    <div class="input-group date-input">
                        <label for="due-date">Due date<span class="required">*</span></label>
                        <div class="input-field">
                            <input type="date" id="due-date" placeholder="yyyy-mm-dd" required>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                <path
                                    d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-68-76a12,12,0,1,1-12-12A12,12,0,0,1,140,132Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,132ZM96,172a12,12,0,1,1-12-12A12,12,0,0,1,96,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,140,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,172Z">
                                </path>
                            </svg>
                            <p id="error-due-date" class="error-message">
                                *This field is required.
                            </p>
                        </div>
                    </div>
                    <div class="prio-group">
                        <label>Prio</label>
                        <div class="prio-buttons">
                            <button id="high-priority-button" class="btn btn-urgent" type="button" onclick="setPriority(this)">
                                <span class="prio-text">Urgent</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                    <path
                                        d="M216.49,191.51a12,12,0,0,1-17,17L128,137,56.49,208.49a12,12,0,0,1-17-17l80-80a12,12,0,0,1,17,0Zm-160-63L128,57l71.51,71.52a12,12,0,0,0,17-17l-80-80a12,12,0,0,0-17,0l-80,80a12,12,0,0,0,17,17Z">
                                    </path>
                                </svg>
                            </button>
                            <button id="mid-priority-button" class="btn btn-medium clicked" type="button" onclick="setPriority(this)">
                                <span class="prio-text">Medium</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                    <path d="M228,160a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,160ZM40,108H216a12,12,0,0,0,0-24H40a12,12,0,0,0,0,24Z">
                                    </path>
                                </svg>
                            </button>
                            <button id="low-priority-button" class="btn btn-low" type="button" onclick="setPriority(this)">
                                <span class="prio-text">Low</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                    <path
                                        d="M216.49,127.51a12,12,0,0,1,0,17l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,1,1,17-17L128,199l71.51-71.52A12,12,0,0,1,216.49,127.51Zm-97,17a12,12,0,0,0,17,0l80-80a12,12,0,0,0-17-17L128,119,56.49,47.51a12,12,0,0,0-17,17Z">
                                    </path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="input-group category-container">
                        <label for="task-category">Category<span class="required">*</span></label>
                        <div class="input-field">
                            <input type="text" id="task-category" placeholder="Select a category" required onclick="toggleCategoryDropdown()" autocomplete="off">
                            <svg id="dropdown-icon" class="dropdown-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z">
                                </path>
                            </svg>
                            <div id="category-dropdown" class="category-dropdown absolute hidden" onclick="selectCategory(event)">
                                <div class="category-dropdown-item" data-category="Technical Task">Technical Task
                                </div>
                                <div class="category-dropdown-item" data-category="User Story">User Story</div>
                            </div>
                            <p id="error-task-category" class="error-message">
                                *This field is required.
                            </p>
                        </div>
                    </div>
                    <div class="input-group addSubtask-container">
                        <label for="input-subtask">Subtasks</label>
                            <div class="input-field-subtask">
                                <input type="text" id="input-subtask" placeholder="Add new subtask" oninput="toggleIcons()" onkeydown="handleEnter(event)">
                                <div id="addSubtask-icons" class="subtask-icons">
                                    <svg id="plus-icon" onclick="addSubtask()" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                        <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z">
                                        </path>
                                    </svg>
                                    <div id="edit-icons" class="icon-wrapper hidden">
                                        <svg onclick="clearSubtaskInput()" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                            <path
                                                d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z">
                                            </path>
                                        </svg>
                                        <div class="edit-divider-vertical"></div>
                                        <svg onclick="addSubtask()" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z">
                                            </path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        <ul id="subtask-list" class="subtask-list"></ul>
                    </div>
                </div>
            </form>
            <footer class="add-task-footer" id="add-task-footer-overlay">
                <div class="footer-text"><span class="required">*</span> This field is required</div>
                <div class="form-buttons" id="form-buttons-overlay">
                    <button class="btn btn-outline" onclick="clearInputForm()">
                        Clear
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                            <path
                                d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z">
                            </path>
                        </svg>
                    </button>
                    <button type="submit" form="add-task-form" class="btn btn-lg">
                        Create Task
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                            <path d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z">
                            </path>
                        </svg>
                    </button>
                </div>
            </footer>
        </section>
    `;
}