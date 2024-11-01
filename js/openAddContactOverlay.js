document.addEventListener("DOMContentLoaded", function() {
    const addContactButton = document.querySelector('.btn-contact');
    const overlay = document.getElementById('overlay');
    const overlayContent = document.querySelector('.overlay-content-add-contact');

    addContactButton.addEventListener('click', function() {
        overlay.style.display = 'flex'; 
        setTimeout(() => {
            overlayContent.classList.add('show'); 
        }, 10); 
    });

    /**
     * Closes the overlay by removing the show class and setting the overlay display to none after a delay.
     */
    function closeTaskOverlay() {
        overlayContent.classList.remove('show'); 
        setTimeout(() => {
            overlay.style.display = 'none'; 
        }, 300); 
    }

    const closeButton = document.querySelector('.close-add-contact-overlay');
    
    /**
     * Adds an event listener to the close button to trigger the closeTaskOverlay function.
     */
    closeButton.addEventListener('click', closeTaskOverlay);

    /**
     * Closes the overlay if the user clicks on the overlay background.
     * 
     * @param {MouseEvent} event - The event object containing information about the click event.
     */
    overlay.addEventListener('click', function(event) {
        if (event.target === overlay) {
            closeTaskOverlay();
            resetFormNotifications()
        }
    });
});
