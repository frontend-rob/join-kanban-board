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
        landscapeModal: document.getElementById('landscape-wrapper')
    };
}

/**
 * loads summary templates into the dashboard element.
 * 
 * @param {htmlelement} dashboard - the element for injecting summary content.
 */
function loadBoardTemplates({ header, navigation, landscapeModal }) {
    header.innerHTML = getHeaderContent();
    navigation.innerHTML = getNavigationContent();
    landscapeModal.innerHTML = getLandscapeModalContent();
}



function updateResponsiveLayout() {
    const searchBarContainer = document.getElementById("responsive-search-bar");

    if (window.innerWidth <= 425) {
        if (!searchBarContainer.querySelector("#search-bar")) {
            searchBarContainer.innerHTML = `
                <div class="input-field-2 search" id="search-bar">
                    <input type="text" placeholder="Find Task">
                    <div class="divider-vertical" id="divider-search"></div>
                    <img src="../assets/icons/search.svg" alt="Search Icon" id="search-icon">
                </div>
            `;

            document.querySelectorAll('.search').forEach(searchBar => {
                searchBar.querySelector('input').addEventListener('input', (event) => {
                    const query = event.target.value;
                    searchTasks(query);
                });
            });
            
        }
    } else {
        searchBarContainer.innerHTML = "";
    }
}


document.addEventListener("DOMContentLoaded", () => {
    updateResponsiveLayout();
});
window.addEventListener("resize", updateResponsiveLayout);


document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.querySelector('.main-content');
    mainContent.classList.add('visible');
});
