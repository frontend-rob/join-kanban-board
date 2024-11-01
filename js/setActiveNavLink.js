/**
 * Initializes the navigation links by setting the active class 
 * based on the current URL.
 */
function setActiveNavLinks() {
    const navLinks = document.querySelectorAll('.nav-link, .footer-link');
    const currentUrl = window.location.href;

    navLinks.forEach(item => item.classList.remove('active'));
    navLinks.forEach(link => {
        if (link.href === currentUrl) {
            link.classList.add('active');
        }
    });
}

/**
 * Sets up click event listeners for the navigation links.
 */
function setupNavLinkClickHandlers() {
    const navLinks = document.querySelectorAll('.nav-link, .footer-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            navLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            window.location.href = this.href;
        });
    });
}

/**
 * Initializes the navigation by setting active links and adding click handlers.
 */
function initializeNavigation() {
    setActiveNavLinks();
    setupNavLinkClickHandlers();
}

document.addEventListener("DOMContentLoaded", initializeNavigation);
