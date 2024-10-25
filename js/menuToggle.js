function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .footer-link');

    const currentUrl = window.location.href;

    navLinks.forEach(item => item.classList.remove('active'));

    navLinks.forEach(link => {
        if (link.href === currentUrl) {
            link.classList.add('active');
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();

            navLinks.forEach(item => item.classList.remove('active'));

            this.classList.add('active');

            window.location.href = this.href;
        });
    });
}

document.addEventListener("DOMContentLoaded", initializeNavigation);
