/**
 * initializes the start content by rendering main page elements and
 * setting up navigation and orientation restrictions on mobile devices.
 * 
 * @async
 * @returns {Promise<void>} - a promise that resolves once the start content is fully initialized.
 */
async function initAddTask() {
    await renderAddTaskContent();
    await setUserDataFromLocalStorage();
    initializeNavigation();
    preventLandscapeOnMobileDevices();
}


/**
 * renders the primary content for the page by loading templates into specific page components.
 * 
 * @async
 * @returns {Promise<void>} - a promise that resolves once the content has been successfully rendered.
 */
async function renderAddTaskContent() {
    const addTaskComponents = getAddTaskComponents();
    loadAddTaskTemplates(addTaskComponents);
}


/**
 * retrieves key components for the page by accessing relevant elements in the DOM.
 * 
 * @returns {Object} - an object containing references to essential page components.
 * @property {HTMLElement} header - the element for injecting header content.
 * @property {HTMLElement} navigation - the element for injecting navigation content.
 * @property {HTMLElement} landscapeModal - the element for injecting landscape modal content.
 */
function getAddTaskComponents() {
    return {
        header: document.getElementById('header-content'),
        navigation: document.getElementById('navigation-content'),
        landscapeModal: document.getElementById('landscape-wrapper')
    };
}


/**
 * loads HTML templates into specified elements on the page.
 * 
 * @param {Object} components - an object containing references to page elements.
 * @param {HTMLElement} components.header - the element for injecting header content.
 * @param {HTMLElement} components.navigation - the element for injecting navigation content.
 * @param {HTMLElement} components.landscapeModal - the element for injecting landscape modal content.
 */
function loadAddTaskTemplates({ header, navigation, landscapeModal }) {
    header.innerHTML = getHeaderContent();
    navigation.innerHTML = getNavigationContent();
    landscapeModal.innerHTML = getLandscapeModalContent();
}




/**
 * sets the priority by applying the `.clicked` class to the selected button
 * and removing it from all other priority buttons.
 *
 * @param {HTMLElement} button - the button to which the `.clicked` class should be applied.
 */
function setPriority(button) {
    document.querySelectorAll('.prio-buttons .btn').forEach(btn => {
        btn.classList.remove('clicked');
    });
    button.classList.add('clicked');
}


/**
 * initialize flatpickr on the input field
 * 
 * @param {string} "#due-date" - input field id
 * @param {Object} options - flatpickr settings
 * @param {string} options.minDate - disable past dates ("today")
 * @param {string} options.dateFormat - date format for form submission (yyyy-mm-dd)
 * @param {boolean} options.altInput - show alternative readable date format
 * @param {string} options.altFormat - format for visible date in altInput
 * @param {boolean} options.allowInput - allow manual date input
 */
flatpickr("#due-date", {
    minDate: "today",        // disable past dates
    dateFormat: "Y-m-d",     // format for hidden input
    altInput: true,          // readable date format
    altFormat: "Y-m-d",      // visible format in altInput
    allowInput: true         // allow manual input
});



/**
 * toggle dropdown visibility when input is clicked
 */
function toggleDropdown() {
    const dropdown = document.getElementById('category-dropdown');
    dropdown.classList.toggle('hidden');
    dropdown.classList.toggle('show');
}

/**
 * select a category and close the dropdown
 * 
 * @param {Event} event - the click event
 */
function selectCategory(event) {
    const selectedCategory = event.target.getAttribute('data-category');
    const categoryInput = document.getElementById('task-category');
    categoryInput.value = selectedCategory;
    document.getElementById('category-dropdown').classList.add('hidden');
    document.getElementById('category-dropdown').classList.remove('show');
}

/**
 * close the dropdown if clicked outside
 * 
 * @param {Event} event - the click event
 */
document.addEventListener('click', function (event) {
    const categoryInput = document.getElementById('task-category');
    const dropdown = document.getElementById('category-dropdown');
    if (!categoryInput.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
        dropdown.classList.remove('show');
    }
});


