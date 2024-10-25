/**
 * Deletes a contact from the database and refreshes the contact list.
 * @async
 * @function
 */
async function deleteContact() {
    const overlay = document.getElementById('overlay');
    const contactId = overlay.getAttribute('data-contact-id');

    if (!contactId) {
        console.error("No contact ID found");
        return;
    }

    try {
        const response = await fetch(`${DB_URL}/contacts/${contactId}.json`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error('Error deleting contact');
        }


        loadContacts();

        closeTaskOverlay();
        clearContactDetails();
    } catch (error) {
        console.error('Error deleting contact:', error);
    }
}

/**
 * Clears the contact details section after deleting a contact.
 * @function
 */
function clearContactDetails() {
    const contactDetailsContainer = document.querySelector('.contact-details');
    contactDetailsContainer.innerHTML = '';
}
