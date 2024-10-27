/**
 * initializes the start content by rendering the main content
 * and preventing landscape orientation on mobile devices.
 * 
 * @async
 * @function
 * @returns {Promise<void>} - a promise that resolves when the start content is initialized.
 */
async function initAuthPage() {
    await renderAuthPageContent();
    preventLandscapeOnMobileDevices();
    updateLogoAndOverlay();
}

/**
 * renders the main content for the start page by loading templates
 * into specified components.
 * 
 * @async
 * @function
 * @returns {Promise<void>} - a promise that resolves when the start content is rendered.
 */
async function renderAuthPageContent() {
    const authPageComponents = getAuthPageComponents();
    loadAuthPageTemplates(authPageComponents);
}

/**
 * retrieves the components for the start page by accessing elements in the DOM.
 * 
 * @function
 * @returns {Object} - an object containing references to start page components.
 */
function getAuthPageComponents() {
    return {
        landscapeModal: document.getElementById('landscape-wrapper')
    };
}

/**
 * loads the templates into the specified start page components.
 * 
 * @function
 * @param {Object} components - an object containing the elements to inject content into.
 * @param {HTMLElement} components.landscapeModal - the modal element for landscape content.
 */
function loadAuthPageTemplates({ landscapeModal }) {
    landscapeModal.innerHTML = getLandscapeModalConent();
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
 * handles the animation end event for the logo.
 * fades out the overlay and resets the logo once the animation is complete.
 */
async function loaderAnimation() {
    const overlay = document.querySelector('.overlay');
    const logo = document.querySelector('.main-logo');

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // sequence of animation steps
    await startOverlayAnimation(overlay, delay);
    await completeOverlayAnimation(overlay, logo, delay);

    resetOverlayClasses(overlay);
}


/**
 * adds the 'start' class after a delay to initiate the overlay animation.
 */
async function startOverlayAnimation(overlay, delay) {
    await delay(1000);
    overlay.classList.add('start');
}


/**
 * completes the overlay animation, updates the logo, and removes 'dark' class after a delay.
 */
async function completeOverlayAnimation(overlay, logo, delay) {
    await delay(1000);
    overlay.classList.add('complete');
    overlay.classList.remove('dark');
    logo.src = '../assets/img/join-logo-dark.svg';

    await delay(1000);
}


/**
 * resets overlay classes to ensure only 'hidden' class remains at the end.
 */
function resetOverlayClasses(overlay) {
    overlay.classList.remove('show', 'start', 'complete');
    overlay.classList.add('hidden');
}


/**
 * main function that initializes the logo and overlay update behavior.
 * updates the logo and overlay based on screen size and adds necessary event listeners.
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