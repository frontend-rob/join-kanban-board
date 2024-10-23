const DB_URL = "https://join-379-kanban-board-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * Loads HTML content into elements with the 'include-html' attribute.
 * Replaces the element's inner HTML with the fetched file content,
 * or shows 'page not found' if the fetch fails.
 *
 * @async
 * @function
 * @returns {Promise<void>} - A promise that resolves when all HTML includes are loaded.
 */
async function includeHTML() {
    let includeElements = document.querySelectorAll('[include-html]');

    let promises = Array.from(includeElements).map(async (element) => {
        const file = element.getAttribute("include-html");
        let resp = await fetch(file);
        if (resp.ok) {
            element.innerHTML = await resp.text();
            initializeNavigation(); // Stelle sicher, dass diese Funktion definiert ist
        } else {
            element.innerHTML = 'page not found';
        }
    });

    await Promise.all(promises);
    await setUserDataFromLocalStorage(); // Benutzerdaten aus localStorage setzen
}

/**
 * asynchronously retrieves user data from localStorage and updates the corresponding html elements.
 * 
 * @async
 * @function
 * @returns {Promise<void>} - a promise that resolves when the user data has been set.
 */
async function setUserDataFromLocalStorage() {
    const userInitialsElement = document.getElementById('current-user-initials');
    const greetingTimeElement = document.getElementById('greeting-time');
    const greetingUserNameElement = document.getElementById('greeting-user-name');

    const greetingTime = localStorage.getItem('greetingTime') || "Welcome,";
    const userName = localStorage.getItem('userName') || "Guest";
    const userInitials = localStorage.getItem('userInitials') || "G";

    // Setze die Begrüßung und den Benutzernamen, wenn die Elemente existieren
    setTextContent(greetingTimeElement, greetingTime);
    setTextContent(greetingUserNameElement, userName);
    setTextContent(userInitialsElement, userInitials);
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
    localStorage.clear();
    window.location.replace('../index.html');
}

/**
 * Navigates the user back to the previous page in the browser history.
 */
function goToPreviousPage() {
    if (document.referrer) {
        window.history.back();
    } else {
        window.location.replace('../index.html');
    }
}

