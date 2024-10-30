function getHeaderContent() {
    return `
        <a href="../pages/summary.html" class="logo-container">
            <img class="logo-header" src="../assets/img/join-logo-dark.svg" alt="Join Logo" />
        </a>
        <span class="project-name">Kanban Project Managment Tool</span>
        <div id="header-menu" class="header-menu">
            <a class="help-icon" href="../pages/help.html">
                <img src="../assets/icons/help.svg" alt="help" />
            </a>
            <button id="menu-toggle-button" class="profile-button" onclick="toggleMobileMenu()">
                <span id="current-user-initials" class="profile-initials">SM</span>
            </button>
            <div id="mobile-menu" class="mobile-menu hidden">
                <a href="../pages/help.html" class="mobile-nav-help nav-link">Help</a>
                <a href="../pages/privacy-policy.html" class="nav-link">Privacy Policy</a>
                <a href="../pages/legal-notice.html" class="nav-link">Legal Notice</a>
                <a href="#" onclick="logOut()">Log out</a>
            </div>
        </div>
    `;
}

function getNavigationContent() {
    return `
        <nav role="navigation">
            <a href="../pages/summary.html" class="nav-logo">
                <img src="../assets/img/join-logo.svg" alt="Join Logo" />
            </a>
            <div id="main-menu" class="menu">
                <a href="../pages/summary.html" class="nav-link">
                    <div class="menu-item">
                        <img class="nav-icon" src="../assets/icons/layout.svg" alt="Summary Icon" />
                        Summary
                    </div>
                </a>
                <a href="../pages/add-task.html" class="nav-link">
                    <div class="menu-item">
                        <img class="nav-icon" src="../assets/icons/note-pencil.svg" alt="Add Task Icon" />
                        Add Task
                    </div>
                </a>
                <a href="../pages/board.html" class="nav-link">
                    <div class="menu-item">
                        <img class="nav-icon" src="../assets/icons/kanban.svg" alt="Board Icon" />
                        Board
                    </div>
                </a>
                <a href="../pages/contacts.html" class="nav-link">
                    <div class="menu-item">
                        <img class="nav-icon" src="../assets/icons/address-book.svg" alt="Contacts Icon" />
                        Contacts
                    </div>
                </a>
            </div>
            <div class="footer-links">
                <a href="../pages/privacy-policy.html" class="footer-link">Privacy Policy</a>
                <a href="../pages/legal-notice.html" class="footer-link">Legal Notice</a>
            </div>
        </nav>
    `;
}

function getSummaryContent() {
    return `
        <section class="summary-stats-container">
            <div class="first-stats-section">
                <a href="../pages/board.html" id="summary-todo" class="summary-card">
                    <div class="summary-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                            <path
                                d="M230.14,70.54,185.46,25.85a20,20,0,0,0-28.29,0L33.86,149.17A19.85,19.85,0,0,0,28,163.31V208a20,20,0,0,0,20,20H92.69a19.86,19.86,0,0,0,14.14-5.86L230.14,98.82a20,20,0,0,0,0-28.28ZM91,204H52V165l84-84,39,39ZM192,103,153,64l18.34-18.34,39,39Z">
                            </path>
                        </svg>
                    </div>
                    <div class="task-count">
                        <span id="amount-todo" class="summary-card-number"></span>
                        <span class="summary-card-label">To-Do</span>
                    </div>
                </a>
                <a href="../pages/board.html" id="summary-done" class="summary-card">
                    <div class="summary-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                            <path d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z"></path>
                        </svg>
                    </div>
                    <div class="task-count">
                        <span id="amount-done" class="summary-card-number"></span>
                        <span class="summary-card-label">Done</span>
                    </div>
                </a>
            </div>
            <a href="../pages/board.html" class="second-stats-section">
                <div id="summary-priority" class="summary-card-secondary">
                    <div id="summary-urgent" class="summary-card-urgent">
                        <div class="summary-icon-urgent">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                <path
                                    d="M216.49,191.51a12,12,0,0,1-17,17L128,137,56.49,208.49a12,12,0,0,1-17-17l80-80a12,12,0,0,1,17,0Zm-160-63L128,57l71.51,71.52a12,12,0,0,0,17-17l-80-80a12,12,0,0,0-17,0l-80,80a12,12,0,0,0,17,17Z">
                                </path>
                            </svg>
                        </div>
                        <div class="task-count">
                            <span id="amount-urgent" class="summary-card-number"></span>
                            <span class="summary-card-label">Urgent</span>
                        </div>
                    </div>
                </div>
                <div class="divider-vertical-summary"></div>
                <div class="due-date">
                    <span id="due-date" class="summary-card-date"></span>
                    <span id="due-date-label" class="summary-card-label"></span>
                </div>
            </a>
            <div class="third-stats-section">
                <a href="../pages/board.html" id="summary-total" class="summary-card-tertiary">
                    <div class="task-count">
                        <span id="amount-total" class="summary-card-number"></span>
                        <span class="summary-card-label">Tasks in <br>Board</span>
                    </div>
                </a>
                <a href="../pages/board.html" id="summary-progress" class="summary-card-tertiary">
                    <div class="task-count">
                        <span id="amount-inprogress" class="summary-card-number"></span>
                        <span class="summary-card-label">Tasks in <br>Processes</span>
                    </div>
                </a>
                <a href="../pages/board.html" id="summary-feedback" class="summary-card-tertiary">
                    <div class="task-count">
                        <span id="amount-feedback" class="summary-card-number"></span>
                        <span class="summary-card-label">Awaiting <br>Feedback</span>
                    </div>
                </a>
            </div>
        </section>
        <section class="summary-greeting-container">
            <span id="greeting-time">Good afternoon,</span>
            <span id="greeting-username">Guest</span>
        </section>
    `;
}

function getLandscapeModalContent() {
    return `
        <div id="landscape-modal" class="landscape-modal hidden">
            <div class="landscape-modal-content">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                    <path
                        d="M176,18H80A22,22,0,0,0,58,40V216a22,22,0,0,0,22,22h96a22,22,0,0,0,22-22V40A22,22,0,0,0,176,18ZM70,62H186V194H70ZM80,30h96a10,10,0,0,1,10,10V50H70V40A10,10,0,0,1,80,30Zm96,196H80a10,10,0,0,1-10-10V206H186v10A10,10,0,0,1,176,226Z">
                    </path>
                </svg>
                <h3>Please rotate your device!</h3>
                <figcaption>This page is best viewed in portrait mode.</figcaption>
            </div>
        </div>
    `;
}

/**
 * Creates the HTML content for the task.
 * 
 * @param {string} taskId - The ID of the task.
 * @param {Object} task - The task object.
 * @param {number} progressPercentage - The progress percentage of the task.
 * @returns {string} - The HTML content for the task.
 */
function getTaskContent(taskId, task, progressPercentage) {
    const assignedToHTML = task.assigned_to.map(person => `
        <div class="profile-icon" style="background-color: ${person.color};">
            ${person.initials}
        </div>
    `).join('');

    return `
        <div class="task" draggable="true" ondragstart="drag(event)" id="${taskId}" onclick="getTaskOverlay('${taskId}')">
            <div class="task-type">${task.category}</div>
            <span class="task-title">${task.title}</span>
            <p class="task-description">${task.description}</p>
            <div class="subtask">
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${progressPercentage}%"></div>
                </div>
                <div class="subtask-text">${task.subtasks.filter(subtask => subtask.status === "checked").length}/${task.subtasks.length} Subtasks</div>
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
            <div class="all-subtasks" id="subtasks-${task.id}">
                ${getSubtasksHTML(task.subtasks, task.id)}
            </div>
        </div>
        <div class="action">
            <div class="action-type" onclick="deleteTask()">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256">
                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                </svg>                    
                <span>Delete</span>
            </div>
            <div class="divider-vertical divider-action"></div>
            <div class="action-type" onclick="editTask()">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256">
                    <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path>
                </svg>
                <span>Edit</span>
            </div>
        </div>
    `;
}

