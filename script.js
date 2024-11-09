const DB_URL = "https://join-379-kanban-board-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * loads HTML content into elements with the 'include-html' attribute.
 * replaces the element's inner HTML with the fetched file content,
 * or shows 'page not found' if the fetch fails.
 *
 * @async
 * @function
 * @returns {Promise<void>} - a promise that resolves when all HTML includes are loaded.
 */
async function includeHTML() {
    let includeElements = document.querySelectorAll('[include-html]');

    let promises = Array.from(includeElements).map(async (element) => {
        const file = element.getAttribute("include-html");
        let resp = await fetch(file);
        if (resp.ok) {
            element.innerHTML = await resp.text();
            initializeNavigation();
        } else {
            element.innerHTML = 'page not found';
        }
    });

    await Promise.all(promises);
    await setUserDataFromLocalStorage();
}


/**
 * asynchronously retrieves user data from localStorage and updates the corresponding html elements.
 * this function updates both desktop and mobile greeting elements based on user data.
 * 
 * @async
 * @function
 * @returns {Promise<void>} - a promise that resolves when the user data has been set.
 */
async function setUserDataFromLocalStorage() {
    const userData = getUserDataFromLocalStorage();

    // update desktop and mobile elements
    updateGreetingElements(userData);

    // set visibility of menu based on user login status
    setMenuVisibility(!!userData.userName);
}


/**
 * retrieves user data from localStorage.
 * 
 * @returns {Object} - an object containing userName, greetingTime, and userInitials.
 */
function getUserDataFromLocalStorage() {
    return {
        userName: localStorage.getItem('userName'),
        greetingTime: localStorage.getItem('greetingTime'),
        userInitials: localStorage.getItem('userInitials')
    };
}


/**
 * updates the greeting elements for both desktop and mobile.
 * 
 * @param {Object} userData - an object containing userName, greetingTime, and userInitials.
 */
function updateGreetingElements(userData) {
    const greetingTimeElement = document.getElementById('greeting-time');
    const greetingUserNameElement = document.getElementById('greeting-username');
    const userInitialsElement = document.getElementById('current-user-initials');
    const greetingTimeMobileElement = document.getElementById('greeting-time-mobile');
    const greetingUserNameMobileElement = document.getElementById('greeting-username-mobile');

    // set content for desktop elements
    setTextContent(greetingTimeElement, userData.greetingTime);
    setTextContent(greetingUserNameElement, userData.userName);
    setTextContent(userInitialsElement, userData.userInitials);

    // set content for mobile elements
    setTextContent(greetingTimeMobileElement, userData.greetingTime);
    setTextContent(greetingUserNameMobileElement, userData.userName);
}


/**
 * sets the text content of an element if the element exists.
 * @param {HTMLElement} element - the target element.
 * @param {string} text - the text to be set.
 */
function setTextContent(element, text) {
    if (element) {
        element.textContent = text;
    }
}


/**
 * adjusts the visibility of the aside element based on screen size and login status.
 * @param {boolean} isLoggedIn - true if the user is logged in, false otherwise.
 */
function adjustMobileMenuVisibility(isLoggedIn) {
    const asideElement = document.querySelector('aside');
    if (!asideElement) return;
    const isSmallScreen = window.innerWidth < 960;

    // only hide menu if the user is not logged in and the screen is small
    if (!isLoggedIn && isSmallScreen) {
        asideElement.classList.add('hidden');
    } else {
        asideElement.classList.remove('hidden');
    }
}


/**
 * sets visibility of menu elements based on user login status.
 * @param {boolean} isLoggedIn - true if the user is logged in, false otherwise.
 */
function setMenuVisibility(isLoggedIn) {
    const mainMenuElement = document.getElementById('main-menu');
    const headerMenuElement = document.getElementById('header-menu');

    toggleClass(mainMenuElement, 'show', 'hidden', isLoggedIn);
    toggleClass(headerMenuElement, 'show', 'hidden', isLoggedIn);
    adjustMobileMenuVisibility(isLoggedIn);
}


/**
 * toggles classes on an element based on a condition.
 * @param {HTMLElement} element - the target element.
 * @param {string} addClass - the class to add if the condition is true.
 * @param {string} removeClass - the class to remove if the condition is true.
 * @param {boolean} condition - if true, adds `addClass` and removes `removeClass`; otherwise, does the opposite.
 */
function toggleClass(element, addClass, removeClass, condition) {
    if (element) {
        if (condition) {
            element.classList.add(addClass);
            element.classList.remove(removeClass);
        } else {
            element.classList.add(removeClass);
            element.classList.remove(addClass);
        }
    }
}


/**
 * event listener that adjusts the visibility of the aside element
 * based on the user login status when the window is resized.
 */
window.addEventListener('resize', () => {
    const isLoggedIn = !!localStorage.getItem('userName');
    adjustMobileMenuVisibility(isLoggedIn);
});


/**
 * toggles the visibility of the mobile menu by adding or removing the 'hidden' and 'show' classes.
 * if clicked outside of the mobile menu, it ensures that 'hidden' is added and 'show' is removed.
 * 
 * @function
 * @returns {void}
 */
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('show');

    document.addEventListener('click', handleClickOutsideMobileMenu);
}


/**
 * handles clicks outside the mobile menu to close it by ensuring the 'hidden' class is added and the 'show' class is removed.
 * 
 * @function
 * @param {Event} event - the click event.
 * @returns {void}
 */
function handleClickOutsideMobileMenu(event) {
    const mobileMenu = document.getElementById('mobile-menu');
    const profileButton = document.querySelector('.profile-button');

    if (!mobileMenu.contains(event.target) && !profileButton.contains(event.target)) {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('show');

        document.removeEventListener('click', handleClickOutsideMobileMenu);
    }
}


/**
 * logs the user out by clearing localStorage and redirecting to the log in site.
 */
async function logOut() {
    localStorage.removeItem('userName');
    localStorage.removeItem('userInitials');
    localStorage.removeItem('greetingTime');
    localStorage.removeItem('hasShownMobileGreeting');
    window.location.replace('../index.html');
}


/**
 * navigates the user back to the previous page in the browser history.
 */
function goToPreviousPage() {
    if (document.referrer) {
        window.history.back();
    } else {
        window.location.replace('../index.html');
    }
}


/**
 * adds the 'show' class to the main content element if it exists in the DOM.
 *
 * @function
 */
document.addEventListener('DOMContentLoaded', function () {
    const mainContent = document.querySelector('.main-content');

    // exit if main-content element is not found (e.g. login site)
    if (!mainContent) return;

    mainContent.classList.add('show');
});