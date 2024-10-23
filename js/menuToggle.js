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

    const activeLink = localStorage.getItem('activeLink');
    if (activeLink) {
        navLinks.forEach(link => {
            if (link.href === activeLink) {
                link.classList.add('active');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();

            navLinks.forEach(item => {
                item.classList.remove('active');
            });

            this.classList.add('active');
            localStorage.setItem('activeLink', this.href);
            window.location.href = this.href;
        });
    });
}
