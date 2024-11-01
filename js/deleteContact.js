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

    await deleteContactFromDatabase(contactId);
    handleContactDeletion();
}

/**
 * Deletes the contact from the database.
 * @param {string} contactId - The ID of the contact to be deleted.
 * @returns {Promise<void>}
 */
async function deleteContactFromDatabase(contactId) {
    try {
        const response = await fetch(`${DB_URL}/contacts/${contactId}.json`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error('Error deleting contact');
        }
    } catch (error) {
        console.error('Error deleting contact:', error);
    }
}

/**
 * Loads the updated contacts, closes the overlay, and clears contact details.
 * @returns {void}
 */
function handleContactDeletion() {
    loadContacts();
    closeTaskOverlay();
    clearContactDetails();
}


/**
 * Clears the contact details section after deleting a contact.
 * @function
 */
function clearContactDetails() {
    const contactDetailsContainer = document.querySelector('.contact-details');
    contactDetailsContainer.innerHTML = '';
}
