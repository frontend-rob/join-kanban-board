/**
 * Event listener that waits for the DOM content to be fully loaded before executing.
 */
document.addEventListener("DOMContentLoaded", function() {
    /**
     * Selects the button for adding a new contact.
     * @type {HTMLElement}
     */
    const addContactButton = document.querySelector('.btn-contact');
    
    /**
     * Selects the overlay element to display when adding a contact.
     * @type {HTMLElement}
     */
    const overlay = document.getElementById('overlay');

    /**
     * Adds a click event listener to the "Add new contact" button.
     * When clicked, it displays the overlay by changing its CSS display property to 'flex'.
     */
    addContactButton.addEventListener('click', function() {
        overlay.style.display = 'flex';
    });

    /**
     * Function to hide the overlay by setting its display style to 'none'.
     */
    function closeTaskOverlay() {
        overlay.style.display = 'none';
    }

    /**
     * Selects the close button within the overlay.
     * @type {HTMLElement}
     */
    const closeButton = document.querySelector('.close-add-contact-overlay');

    /**
     * Adds a click event listener to the close button.
     * When clicked, it triggers the closeTaskOverlay function to hide the overlay.
     */
    closeButton.addEventListener('click', closeTaskOverlay);

    /**
     * Adds a click event listener to the overlay background.
     * If the user clicks outside the overlay content, the overlay is closed.
     */
    overlay.addEventListener('click', function(event) {
        // Check if the click is outside the overlay content
        if (event.target === overlay) {
            closeTaskOverlay();
        }
    });
});
