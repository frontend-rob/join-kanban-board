/**
 * helper function to fetch tasks from firebase.
 * @async
 * @function
 * @returns {promise<object|null>} the fetched tasks or null in case of an error.
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
 * @function
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
 * @function
 * @param {string} elementid - the id of the html element to update.
 * @param {string} text - the text to set as the element's content.
 * @returns {void} this function does not return a value.
 */
function updateElementText(elementId, text) {
    document.getElementById(elementId).textContent = text;
}


/**
 * fetches and displays the number of tasks with a specific status from firebase.
 * 
 * @async
 * @function
 * @param {string} status - the status to filter tasks by.
 * @param {string} elementid - the id of the html element to update.
 * @param {array} tasks - the array of tasks to filter.
 * @returns {void} this function does not return a value.
 */
async function fetchAndDisplayTasksByStatus(status, elementId, tasks) {
    const filteredTasks = filterTasks(tasks, 'status', status);
    updateElementText(elementId, filteredTasks.length);
}


/**
 * fetches and displays the number of urgent tasks from firebase.
 * 
 * @async
 * @function
 * @param {array} tasks - the array of tasks to filter for urgent tasks.
 * @returns {void} this function does not return a value.
 */
async function fetchAndDisplayUrgentTasks(tasks) {
    const urgentTasks = filterTasks(tasks, 'priority', 'high');
    updateElementText('amount-urgent', urgentTasks.length);
}


/**
 * fetches and displays the total number of tasks from firebase.
 * 
 * @async
 * @function
 * @param {object} tasks - the object containing all tasks.
 * @returns {Promise<void>} a promise that resolves when the total tasks count is displayed.
 */
async function fetchAndDisplayTotalTasks(tasks) {
    updateElementText('amount-total', Object.keys(tasks).length);
}


/**
 * extracts due dates from urgent tasks.
 * 
 * @function
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
 * 
 * @function
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
 * 
 * @function
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
 * 
 * @async
 * @function
 * @param {object[]} tasks - the array of tasks to filter for urgent ones.
 * @returns {void} this function does not return a value.
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
 * @function
 * @param {HTMLElement} greetingelement - the mobile greeting element.
 * @param {HTMLElement} statselement - the stats element.
 * @returns {void} this function does not return a value.
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
 * @function
 * @param {HTMLElement} greetingelement - the mobile greeting element.
 * @param {HTMLElement} statselement - the stats element.
 * @returns {void} this function does not return a value.
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
 * this only runs once per login session.
 * 
 * @async
 * @function
 * @returns {Promise<void>} - a promise that resolves after the greeting display.
 */
async function toggleMobileGreeting() {
    const statsWrapper = document.getElementById('summary-stats-wrapper');
    const mobileGreeting = document.getElementById('mobile-greeting');
    const isSmallScreen = window.innerWidth <= 768;
    const hasShownGreeting = localStorage.getItem('hasShownMobileGreeting');

    if (isSmallScreen && !hasShownGreeting) {
        showMobileGreeting(mobileGreeting, statsWrapper);
        await new Promise(resolve => setTimeout(resolve, 2000));
        showStatsAndHideGreeting(mobileGreeting, statsWrapper);
        localStorage.setItem('hasShownMobileGreeting', 'true');
    } else {
        showStatsAndHideGreeting(mobileGreeting, statsWrapper);
    }
}


/**
 * initializes the summary page content by rendering the main content
 * and preventing landscape orientation on mobile devices.
 * 
 * @async
 * @function
 * @returns {Promise<void>} - a promise that resolves when the start content is initialized.
 */
async function initSummaryPage() {
    await renderSummaryContent();
    initializeNavigation();
    preventLandscapeOnMobileDevices();
}


/**
 * renders the content for the summary site.
 * this function fetches tasks from firebase and handles the display of statistics based on the fetched tasks.
 * it loads summary templates and updates the display accordingly.
 * 
 * @async
 * @function
 * @returns {Promise<void>} a promise that resolves when the summary content has been rendered.
 */
async function renderSummaryContent() {
    const summaryComponents = getSummaryComponents();
    loadSummaryTemplates(summaryComponents);
    toggleMobileGreeting();
    await setUserDataFromLocalStorage();

    const tasks = await fetchTasksFromFirebase();

    if (tasks) {
        await handleTaskStatistics(tasks);
    } else {
        handleNoTasks();
    }
}


/**
 * handles task statistics when tasks are available.
 * 
 * @async
 * @function
 * @param {array} tasks - the array of fetched tasks.
 * @returns {Promise<void>} a promise that resolves when all task statistics have been processed.
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
 * 
 * @function
 * @returns {void} this function does not return a value.
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
 * retrieves key components for the summary section.
 * 
 * @function
 * @returns {Object} an object containing references to summary-related elements.
 * @property {HTMLElement} header - the element for injecting header content.
 * @property {HTMLElement} navigation - the element for injecting navigation content.
 * @property {HTMLElement} dashboard - the dashboard element for injecting summary content.
 * @property {HTMLElement} landscapeModal - the element for injecting landscape modal content.
 */
function getSummaryComponents() {
    return {
        header: document.getElementById('header-content'),
        navigation: document.getElementById('navigation-content'),
        dashboard: document.getElementById('summary-content'),
        landscapeModal: document.getElementById('landscape-wrapper')
    };
}


/**
 * loads summary content templates into specified elements.
 * 
 * @function
 * @param {Object} components - an object containing references to elements where content will be injected.
 * @param {HTMLElement} components.header - the element for injecting header content.
 * @param {HTMLElement} components.navigation - the element for injecting navigation content.
 * @param {HTMLElement} components.dashboard - the element for injecting summary content.
 * @param {HTMLElement} components.landscapeModal - the element for injecting landscape modal content.
 * @returns {void} this function does not return a value.
 */
function loadSummaryTemplates({ header, navigation, dashboard, landscapeModal }) {
    header.innerHTML = getHeaderContent();
    navigation.innerHTML = getNavigationContent();
    dashboard.innerHTML = getSummaryContent();
    landscapeModal.innerHTML = getLandscapeModalContent();
}