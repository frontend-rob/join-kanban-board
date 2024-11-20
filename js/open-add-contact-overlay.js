/**
 * Handles the opening and closing of the contact overlay.
 */
document.addEventListener("DOMContentLoaded", function() {
    const addContactButton = document.querySelector('.btn-contact');
    const overlay = document.getElementById('overlay');
    const overlayContent = document.querySelector('.overlay-content-add-contact');
    const imgOpenOverlay = document.querySelector('.add-contact-btn-mobile');
    const closeButton = document.querySelector('.close-add-contact-overlay');

    /**
     * Opens the overlay and disables scrolling.
     * Adds the 'show' class to the overlay content after a slight delay.
     */
    function openOverlay() {
        document.body.classList.add('no-scroll');
        overlay.style.display = 'flex'; 
        setTimeout(() => {
            overlayContent.classList.add('show'); 
        }, 10);
    }

    /**
     * Closes the overlay and enables scrolling again.
     * Removes the 'show' class and hides the overlay after a delay.
     */
    function closeTaskOverlay() {
        overlayContent.classList.remove('show'); 
        setTimeout(() => {
            overlay.style.display = 'none'; 
            document.body.classList.remove('no-scroll');
        }, 300); 
    }

    // Event listeners for opening and closing the overlay
    addContactButton.addEventListener('click', openOverlay);
    imgOpenOverlay.addEventListener('click', openOverlay);
    closeButton.addEventListener('click', closeTaskOverlay);

    /**
     * Closes the overlay if the user clicks on the overlay background.
     * Also resets any form notifications if applicable.
     * 
     * @param {MouseEvent} event - The event object containing information about the click event.
     */
    overlay.addEventListener('click', function(event) {
        if (event.target === overlay) {
            closeTaskOverlay();
            resetFormNotifications();
        }
    });
});
