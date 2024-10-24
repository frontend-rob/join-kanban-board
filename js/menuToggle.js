/**
 * Initializes the navigation links by setting the active link
 * based on the current URL and attaching click event listeners.
 *
 * @function
 * @returns {void}
 */
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(item => {
        item.classList.remove('active');
    });

    const currentUrl = window.location.href;

    navLinks.forEach(link => {
        if (link.href === currentUrl) {
            link.classList.add('active');
            localStorage.setItem('activeLink', link.href);
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();

            navLinks.forEach(item => {
                item.classList.remove('active');
            });

            this.classList.add('active');
            localStorage.setItem('activeLink', this.href);

            setTimeout(() => {
                window.location.href = this.href;
            }, 0);
        });
    });

    const footerLinks = document.querySelectorAll('.footer-links a');
    footerLinks.forEach(link => {
        if (link.href === currentUrl) {
            navLinks.forEach(item => {
                item.classList.remove('active');
            });
            localStorage.removeItem('activeLink');
        }
    });
}