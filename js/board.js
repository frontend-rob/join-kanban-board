window.selectedStatus = "todo";

/**
 * initializes the summary page content by rendering the main content
 * and preventing landscape orientation on mobile devices.
 * 
 * @async
 * @function
 * @returns {Promise<void>} - a promise that resolves when the start content is initialized.
 */
async function initBoardPage() {
    await renderBoardContent();
    initializeNavigation();
    preventLandscapeOnMobileDevices();
    initializeDatePicker("#due-date");
    addInputEventListeners();
}

/**
 * renders the content for the summary site.
 * this function fetches tasks from firebase and handles the display of statistics based on the fetched tasks.
 * it loads summary templates and updates the display accordingly.
 * 
 * @returns {Promise<void>} a promise that resolves when the summary content has been rendered.
 */
async function renderBoardContent() {
    const boardComponents = getBoardComponents();
    loadBoardTemplates(boardComponents);
    await setUserDataFromLocalStorage();
}

/**
 * retrieves the dashboard component for the summary.
 * 
 * @returns {object} an object containing the dashboard element.
 * @returns {htmlelement} dashboard - the dashboard element for summary content.
 */
function getBoardComponents() {
    return {
        header: document.getElementById('header-content'),
        navigation: document.getElementById('navigation-content'),
        landscapeModal: document.getElementById('landscape-wrapper'),
        addTask: document.getElementById('add-task-content')
    };
}

/**
 * loads summary templates into the dashboard element.
 * 
 * @param {htmlelement} dashboard - the element for injecting summary content.
 */
function loadBoardTemplates({ header, navigation, landscapeModal, addTask }) {
    header.innerHTML = getHeaderContent();
    navigation.innerHTML = getNavigationContent();
    landscapeModal.innerHTML = getLandscapeModalContent();
    addTask.innerHTML = getAddTaskContent();
}



/**
 * Adds the search bar to the container if the window width is 560px or smaller.
 */
function addSearchBar() {
    const searchBarContainer = document.getElementById("responsive-search-bar");

    if (!searchBarContainer.querySelector("#search-bar")) {
        searchBarContainer.innerHTML = `
            <div class="input-field-2 search" id="search-bar">
                <input type="text" placeholder="Find Task">
                <div class="divider-vertical" id="divider-search"></div>
                <img src="../assets/icons/search.svg" alt="Search Icon" id="search-icon">
            </div>
        `;
    }
}

/**
 * Attaches the event listener to the search input field.
 */
function attachSearchEventListener() {
    document.querySelectorAll('.search').forEach(searchBar => {
        searchBar.querySelector('input').addEventListener('input', (event) => {
            const query = event.target.value;
            searchTasks(query);
        });
    });
}

/**
 * Clears the search bar container.
 */
function clearSearchBar() {
    const searchBarContainer = document.getElementById("responsive-search-bar");
    searchBarContainer.innerHTML = "";
}

/**
 * Updates the responsive layout of the page based on the window size.
 */
function updateResponsiveLayout() {
    if (window.innerWidth <= 560) {
        addSearchBar();
        attachSearchEventListener();
    } else {
        clearSearchBar();
    }
}


/**
 * Redirects to the mobile version of the Add Task page if the screen width is below a threshold.
 * @param {number} redirectThreshold - The width threshold for redirecting.
 * @param {string} redirectURL - The URL to redirect to.
 * @returns {boolean} - Returns true if a redirect occurred, otherwise false.
 */
function handleMobileRedirect(redirectThreshold, redirectURL) {
    if (window.innerWidth < redirectThreshold) {
        window.location.href = redirectURL;
        return true;
    }
    return false;
}

/**
 * Shows the Add Task overlay and prevents scrolling on the body.
 * @param {HTMLElement} overlay - The overlay element to display.
 * @param {HTMLElement} overlayContent - The content inside the overlay to animate.
 */
function showOverlay(overlay, overlayContent) {
    document.body.classList.add("no-scroll");
    overlay.style.display = "flex";

    setTimeout(() => {
        overlayContent.classList.add("show");
    }, 10);
}

/**
 * Opens the "Add Task" overlay or redirects for mobile screens.
 * @param {string} status - The task status to be set.
 */
function openAddTaskOverlay(status) {
    const redirectThreshold = 1024;
    const redirectURL = 'add-task.html';

    if (handleMobileRedirect(redirectThreshold, redirectURL)) {
        return;
    }

    taskStatus = status;

    const overlay = document.getElementById("add-task-overlay");
    const overlayContent = document.querySelector(".overlay-content-add-task");

    showOverlay(overlay, overlayContent);
}


/**
 * Closes the "Add Task" overlay and allows scrolling on the body again.
 */
function closeAddTaskOverlay() {
    const overlay = document.getElementById("add-task-overlay");
    const overlayContent = document.querySelector(".overlay-content-add-task");

    document.body.classList.remove("no-scroll");
    overlayContent.classList.remove("show");

    setTimeout(() => {
        overlay.style.display = "none";
    }, 300);
    
    clearInputForm();
}

/**
 * Closes the "Add Task" overlay when the user clicks outside the overlay.
 * 
 * @param {Event} event - The click event triggered by the user.
 */
function closeAddTaskOnOutsideClick(event) {
    if (event.target === document.getElementById("add-task-overlay")) {
        closeAddTaskOverlay();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateResponsiveLayout();
});
window.addEventListener("resize", updateResponsiveLayout);
