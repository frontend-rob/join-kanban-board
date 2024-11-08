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


// Initialize Flatpickr on the input field
flatpickr("#due-date", {
    minDate: "today",        // Disable past dates
    dateFormat: "Y-m-d",     // The format for the hidden input (form submission)
    altInput: true,          // Enable alt input to display a more readable date format
    altFormat: "Y-m-d",      // Set the format for the visible date in the altInput field (still yyyy-mm-dd)
    allowInput: true         // Allow users to type in the input field as well
});



// Toggle dropdown visibility when input is clicked
function toggleDropdown() {
    const dropdown = document.getElementById('category-dropdown');
    dropdown.classList.toggle('hidden');
    dropdown.classList.toggle('show');
}

// Select category and close the dropdown
function selectCategory(event) {
    const selectedCategory = event.target.getAttribute('data-category');
    const categoryInput = document.getElementById('category');
    categoryInput.value = selectedCategory;  // Set input value to selected category
    document.getElementById('category-dropdown').classList.add('hidden');  // Hide dropdown
    document.getElementById('category-dropdown').classList.remove('show');  // Hide dropdown
}

// Close the dropdown if clicked outside (optional)
document.addEventListener('click', function (event) {
    const categoryInput = document.getElementById('category');
    const dropdown = document.getElementById('category-dropdown');
    if (!categoryInput.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden'); // Close the dropdown if clicked outside
        dropdown.classList.remove('show'); // Close the dropdown if clicked outside
    }
});

