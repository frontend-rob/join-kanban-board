/**
 * initializes the authentication page by rendering content, 
 * preventing landscape orientation on mobile devices, 
 * and updating the logo and overlay elements.
 * 
 * @async
 * @returns {Promise<void>} resolves when initialization is complete.
 */
async function initAuthPage() {
    await renderAuthPageContent();
    preventLandscapeOnMobileDevices();
    updateLogoAndOverlay();
}


/**
 * renders the main content for the authentication page by loading templates.
 * 
 * @async
 * @returns {Promise<void>} resolves when content rendering is complete.
 */
async function renderAuthPageContent() {
    const authPageComponents = getAuthPageComponents();
    loadAuthPageTemplates(authPageComponents);
}


/**
 * retrieves references to the main components for the authentication page.
 * 
 * @returns {Object} references to elements on the authentication page.
 */
function getAuthPageComponents() {
    return {
        landscapeModal: document.getElementById('landscape-wrapper')
    };
}


/**
 * loads content templates into specified elements on the authentication page.
 * 
 * @param {Object} components - elements to inject content into.
 * @param {HTMLElement} components.landscapeModal - the modal for landscape content.
 */
function loadAuthPageTemplates({ landscapeModal }) {
    landscapeModal.innerHTML = getLandscapeModalContent();
}


/**
 * updates the logo and overlay based on the screen size.
 * adds the 'dark' class to the overlay and changes the logo source for small screens only during the animation.
 */
function switchLogoAndOverlay() {
    const overlay = document.querySelector('.overlay');
    const logo = document.querySelector('.main-logo');

    if (window.matchMedia('(max-width: 35rem)').matches) {
        overlay.classList.add('dark');
        logo.src = '../assets/img/join-logo.svg';
    } else {
        overlay.classList.remove('dark');
        logo.src = '../assets/img/join-logo-dark.svg';
    }
}


/**
 * handles the logo animation end event.
 * fades out the overlay and resets the logo after the animation is complete.
 * 
 * @async
 * @returns {Promise<void>} resolves when the loader animation is finished.
 */
async function loaderAnimation() {
    const overlay = document.querySelector('.overlay');
    const logo = document.querySelector('.main-logo');
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    await startOverlayAnimation(overlay, delay);
    await completeOverlayAnimation(overlay, logo, delay);

    resetOverlayClasses(overlay);
}


/**
 * initiates the overlay animation by adding the 'start' class after a delay.
 * 
 * @async
 * @param {HTMLElement} overlay - the overlay element to animate.
 * @param {Function} delay - a function that returns a promise for a specified delay.
 * @returns {Promise<void>} resolves after adding the 'start' class.
 */
async function startOverlayAnimation(overlay, delay) {
    await delay(1000);
    overlay.classList.add('start');
}


/**
 * completes the overlay animation by adding the 'complete' class,
 * updating the logo, and removing the 'dark' class after a delay.
 * 
 * @async
 * @param {HTMLElement} overlay - the overlay element to update.
 * @param {HTMLElement} logo - the logo element to change the source.
 * @param {Function} delay - a function that returns a promise for a specified delay.
 * @returns {Promise<void>} resolves after completing the animation steps.
 */
async function completeOverlayAnimation(overlay, logo, delay) {
    await delay(1000);
    overlay.classList.add('complete');
    overlay.classList.remove('dark');
    logo.src = '../assets/img/join-logo-dark.svg';

    await delay(1000);
}


/**
 * resets overlay classes, ensuring only the 'hidden' class remains.
 * 
 * @param {HTMLElement} overlay - the overlay element to reset classes on.
 */
function resetOverlayClasses(overlay) {
    overlay.classList.remove('show', 'start', 'complete');
    overlay.classList.add('hidden');
}


/**
 * initializes logo and overlay behavior by updating them based on screen size.
 * adds event listeners for logo animation and window resizing.
 * 
 * @function
 */
function updateLogoAndOverlay() {
    const overlay = document.querySelector('.overlay');
    switchLogoAndOverlay();
    const logo = document.querySelector('.main-logo');

    logo.addEventListener('animationend', loaderAnimation);

    window.addEventListener('resize', () => {
        if (!overlay.classList.contains('hidden')) {
            switchLogoAndOverlay();
        }
    });
}


/**
 * disables scrolling on the body element when the page loads.
 * re-enables scrolling after a specified delay.
 */
window.addEventListener('load', () => {
    const body = document.body;
    body.classList.add('no-scroll');

    setTimeout(() => {
        body.classList.remove('no-scroll');
    }, 3000);
});


/**
 * toggles the 'signup-btn' element's classes to adjust styling
 * when the window's width is 560px or smaller.
 */
function toggleSignUpLink() {
    const signUpLink = document.getElementById('toggle-auth-btn');
    if (!signUpLink) return;

    if (window.innerWidth <= 560) {
        signUpLink.classList.remove('btn');
        signUpLink.classList.add('btn-link');
    } else {
        signUpLink.classList.remove('btn-link');
        signUpLink.classList.add('btn');
    }
}


/**
 * adds a resize event listener to toggle the 'signup-btn' element's classes
 * based on the window width.
 */
function initResponsiveSignUpLink() {
    toggleSignUpLink();
    window.addEventListener('resize', toggleSignUpLink);
}


// initialize the responsive logic on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initResponsiveSignUpLink);