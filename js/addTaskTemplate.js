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




// Prio-Buttons Initialisierung
function initializePrioButtons() {
    const buttons = document.querySelectorAll('.prio-button');
    buttons.forEach(button => {
        button.addEventListener('click', function () {
            buttons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.backgroundColor = '';
                btn.querySelector('svg').style.fill = '';
                btn.querySelector('svg').style.stroke = '';
                btn.style.color = '';
            });

            button.classList.add('active');
            if (button.classList.contains('urgent')) {
                button.style.backgroundColor = 'var(--priority-urgent)';
                button.querySelector('svg').style.fill = 'var(--white-content)';
                button.querySelector('svg').style.stroke = 'var(--white-content)';
                button.style.color = 'var(--white-content)';
            } else if (button.classList.contains('medium')) {
                button.style.backgroundColor = 'var(--priority-medium)';
                button.querySelector('svg').style.fill = 'var(--white-content)';
                button.querySelector('svg').style.stroke = 'var(--white-content)';
                button.style.color = 'var(--white-content)';
            } else if (button.classList.contains('low')) {
                button.style.backgroundColor = 'var(--priority-low)';
                button.querySelector('svg').style.fill = 'var(--white-content)';
                button.querySelector('svg').style.stroke = 'var(--white-content)';
                button.style.color = 'var(--white-content)';
            }
        });
    });
}