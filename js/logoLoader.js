/**
 * updates the logo and overlay based on the screen size.
 * adds the 'dark' class to the overlay and changes the logo source for small screens only during the animation.
 */
function switchLogoAndOverlay() {
    const overlay = document.querySelector('.overlay');
    const logo = document.querySelector('.main-logo');

    if (window.matchMedia('(max-width: 35rem)').matches) {
        // Zeige dunkles Logo und Overlay nur während der Animation
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
function handleAnimationEnd() {
    const overlay = document.querySelector('.overlay');
    const logo = document.querySelector('.main-logo');

    overlay.classList.add('hidden');

    setTimeout(() => {
        overlay.classList.add('hidden-complete');
        overlay.classList.remove('dark');
        logo.src = '../assets/img/join-logo-dark.svg';
    }, 1000);
}

/**
 * main function that initializes the logo and overlay update behavior.
 * updates the logo and overlay based on screen size and adds necessary event listeners.
 */
function updateLogoAndOverlay() {
    switchLogoAndOverlay();
    const logo = document.querySelector('.main-logo');
    logo.addEventListener('animationend', handleAnimationEnd);

    window.addEventListener('resize', () => {
        if (!overlay.classList.contains('hidden')) {
            switchLogoAndOverlay();
        }
    });
}
