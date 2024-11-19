/**
 * initializes the start content by rendering main page elements and
 * setting up navigation and orientation restrictions on mobile devices.
 * 
 * @async
 * @returns {Promise<void>} - a promise that resolves once the start content is fully initialized.
 */
async function initInfoPages() {
    await renderPageContent();
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
async function renderPageContent() {
    const pageComponents = getPageComponents();
    loadPageTemplates(pageComponents);
}


/**
 * retrieves key components for the page by accessing relevant elements in the DOM.
 * 
 * @returns {Object} - an object containing references to essential page components.
 * @property {HTMLElement} header - the element for injecting header content.
 * @property {HTMLElement} navigation - the element for injecting navigation content.
 * @property {HTMLElement} landscapeModal - the element for injecting landscape modal content.
 */
function getPageComponents() {
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
function loadPageTemplates({ header, navigation, landscapeModal }) {
    header.innerHTML = getHeaderContent();
    navigation.innerHTML = getNavigationContent();
    landscapeModal.innerHTML = getLandscapeModalContent();
}