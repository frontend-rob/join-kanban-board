/**
 * helper function to fetch tasks from firebase.
 * @returns {Promise<Object|null>} the fetched tasks or null in case of an error.
 */
async function fetchTasksFromFirebase() {
    try {
        const response = await fetch(`${DB_URL}/tasks.json`);
        const tasks = await response.json();
        return tasks;
    } catch (error) {
        console.error('error fetching tasks from firebase:', error);
        return null;
    }
}


/**
 * helper function to filter tasks by status or priority.
 * 
 * @param {object} tasks - an object containing all tasks.
 * @param {string} filtertype - the property to filter by (e.g., 'status' or 'priority').
 * @param {string} filtervalue - the value to filter for.
 * @returns {array} an array of tasks that match the filter criteria.
 */
function filterTasks(tasks, filterType, filterValue) {
    const filteredTasks = [];
    Object.values(tasks).forEach(task => {
        if (task[filterType] === filterValue) {
            filteredTasks.push(task);
        }
    });
    return filteredTasks;
}


/**
 * function to update an html element's text content.
 * 
 * @param {string} elementid - the id of the html element to update.
 * @param {string} text - the text to set as the element's content.
 */
function updateElementText(elementId, text) {
    document.getElementById(elementId).textContent = text;
}


/**
 * fetches and displays the number of tasks with a specific status from firebase.
 * 
 * @param {string} status - the status to filter tasks by.
 * @param {string} elementid - the id of the html element to update.
 * @param {array} tasks - the array of tasks to filter.
 */
async function fetchAndDisplayTasksByStatus(status, elementId, tasks) {
    const filteredTasks = filterTasks(tasks, 'status', status);
    updateElementText(elementId, filteredTasks.length);
}


/**
 * fetches and displays the number of urgent tasks from firebase.
 * 
 * @param {array} tasks - the array of tasks to filter for urgent tasks.
 */
async function fetchAndDisplayUrgentTasks(tasks) {
    const urgentTasks = filterTasks(tasks, 'priority', 'high');
    updateElementText('amount-urgent', urgentTasks.length);
}


/**
 * fetches and displays the total number of tasks from firebase.
 * 
 * @param {object} tasks - the object containing all tasks.
 */
async function fetchAndDisplayTotalTasks(tasks) {
    updateElementText('amount-total', Object.keys(tasks).length);
}


/**
 * extracts due dates from urgent tasks.
 * 
 * @param {array} urgenttasks - the array of urgent tasks.
 * @returns {array} array of due dates.
 */
function getDueDates(urgentTasks) {
    const dueDates = [];
    urgentTasks.forEach(task => {
        dueDates.push(new Date(task.due_date));
    });
    return dueDates;
}


/**
 * finds the oldest due date from an array of due dates that are in the past.
 * @param {date[]} duedates - the array of due dates.
 * @returns {date} the oldest due date in the past or a placeholder date.
 */
function findOldestPastDueDate(dueDates) {
    let oldest = new Date('9999-12-31');
    dueDates.forEach(date => {
        if (date < new Date() && date < oldest) {
            oldest = date;
        }
    });
    return oldest;
}


/**
 * finds the next due date from an array of due dates.
 * @param {date[]} duedates - the array of due dates.
 * @returns {date} the next due date or a placeholder date.
 */
function findNextDueDate(dueDates) {
    let next = new Date('9999-12-31');
    dueDates.forEach(date => {
        if (date >= new Date() && date < next) {
            next = date;
        }
    });
    return next;
}


/**
 * fetches the due date of the closest urgent task and updates the display.
 * @param {object[]} tasks - the array of tasks to filter for urgent ones.
 * @returns {void}
 */
async function fetchAndDisplayNextUrgentDueDate(tasks) {
    const urgentTasks = filterTasks(tasks, 'priority', 'high');

    if (urgentTasks.length === 0) {
        updateElementText('due-date', 'no urgent tasks');
        updateElementText('due-date-label', '');
        return;
    }

    const dueDates = getDueDates(urgentTasks);
    const oldestPastDueDate = findOldestPastDueDate(dueDates);

    // show the oldest due date in the past
    if (oldestPastDueDate < new Date('9999-12-31')) {
        updateElementText('due-date', oldestPastDueDate.toLocaleDateString('en-US'));
        updateElementText('due-date-label', 'overdue since');
        return;
    }

    // otherwise find the next future date
    const nextDueDate = findNextDueDate(dueDates);
    updateElementText('due-date', nextDueDate.toLocaleDateString('en-US'));
    updateElementText('due-date-label', 'upcoming deadline');
}


/**
 * shows the mobile greeting and hides the stats section.
 * 
 * @param {HTMLElement} greetingElement - the mobile greeting element.
 * @param {HTMLElement} statsElement - the stats element.
 */
function showMobileGreeting(greetingElement, statsElement) {
    greetingElement.classList.remove('hidden');
    greetingElement.classList.add('show');
    statsElement.classList.remove('show');
    statsElement.classList.add('hidden');
}

/**
 * hides the mobile greeting and shows the stats section.
 * 
 * @param {HTMLElement} greetingElement - the mobile greeting element.
 * @param {HTMLElement} statsElement - the stats element.
 */
function showStatsAndHideGreeting(greetingElement, statsElement) {
    greetingElement.classList.remove('show');
    greetingElement.classList.add('hidden');
    statsElement.classList.remove('hidden');
    statsElement.classList.add('show');
}

/**
 * toggles the mobile greeting visibility on small screens.
 * shows the mobile greeting temporarily, then switches back to the stats view.
 * 
 * @async
 * @function
 * @returns {Promise<void>} - a promise that resolves after the greeting display.
 */
async function toggleMobileGreeting() {
    const statsWrapper = document.getElementById('summary-stats-wrapper');
    const mobileGreeting = document.getElementById('mobile-greeting');
    const isSmallScreen = window.innerWidth <= 768;

    if (isSmallScreen) {
        showMobileGreeting(mobileGreeting, statsWrapper);
        await new Promise(resolve => setTimeout(resolve, 2000));
        showStatsAndHideGreeting(mobileGreeting, statsWrapper);
    } else {
        showStatsAndHideGreeting(mobileGreeting, statsWrapper);
    }
}


/**
 * renders the content for the summary site.
 * this function fetches tasks from firebase and handles the display of statistics based on the fetched tasks.
 * it loads summary templates and updates the display accordingly.
 * 
 * @returns {Promise<void>} a promise that resolves when the summary content has been rendered.
 */
async function renderSummaryContent() {
    const summaryComponents = getSummaryComponents();
    loadSummaryTemplates(summaryComponents.dashboard);
    toggleMobileGreeting();

    const tasks = await fetchTasksFromFirebase();

    if (tasks) {
        await handleTaskStatistics(tasks);
    } else {
        handleNoTasks();
    }
}


/**
 * handles task statistics when tasks are available.
 * @param {array} tasks - the array of fetched tasks.
 * @returns {promise} a promise that resolves when all task statistics have been processed.
 */
async function handleTaskStatistics(tasks) {
    const tasksPromises = [
        fetchAndDisplayTasksByStatus('todo', 'amount-todo', tasks),
        fetchAndDisplayTasksByStatus('done', 'amount-done', tasks),
        fetchAndDisplayUrgentTasks(tasks),
        fetchAndDisplayNextUrgentDueDate(tasks),
        fetchAndDisplayTotalTasks(tasks),
        fetchAndDisplayTasksByStatus('inprogress', 'amount-inprogress', tasks),
        fetchAndDisplayTasksByStatus('awaitfeedback', 'amount-feedback', tasks)
    ];

    await Promise.all(tasksPromises);
}


/**
 * handles the case when no tasks are available.
 * this function sets all task-related values to zero or an error status.
 */
function handleNoTasks() {
    updateElementText('amount-todo', '0');
    updateElementText('amount-done', '0');
    updateElementText('amount-urgent', '0');
    updateElementText('due-date', 'no tasks');
    updateElementText('amount-total', '0');
    updateElementText('amount-inprogress', '0');
    updateElementText('amount-feedback', '0');
}


/**
 * retrieves the dashboard component for the summary.
 * 
 * @returns {object} an object containing the dashboard element.
 * @returns {htmlelement} dashboard - the dashboard element for summary content.
 */
function getSummaryComponents() {
    return {
        dashboard: document.getElementById('summary-content')
    };
}


/**
 * loads summary templates into the dashboard element.
 * 
 * @param {htmlelement} dashboard - the element for injecting summary content.
 */
function loadSummaryTemplates(dashboard) {
    dashboard.innerHTML = getSummaryContent();
}