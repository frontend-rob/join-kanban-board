/**
 * Opens the edit overlay and fills in the existing contact details.
 * @param {Object} contact - The contact object containing the details to edit.
 * @param {string} contactId - The ID of the contact to edit.
 */
function openEditOverlay(contact, contactId) {
    const editOverlay = document.getElementById('edit-overlay');
    editOverlay.style.display = 'block';

    // Setze die Kontaktinformationen in die Eingabefelder
    document.getElementById('edit-contact-name').value = contact.name;
    document.getElementById('edit-contact-email').value = contact.email;
    document.getElementById('edit-contact-phone').value = contact.phone;

    // Setze die Kontakt-ID im Overlay
    editOverlay.setAttribute('data-contact-id', contactId);
}

/**
 * Closes the edit overlay.
 */
function closeEditOverlay() {
    const editOverlay = document.getElementById('edit-overlay');
    editOverlay.style.display = 'none';
}

/**
 * Saves the updated contact information.
 */
async function saveContact() {
    const editOverlay = document.getElementById('edit-overlay');
    const contactId = editOverlay.getAttribute('data-contact-id');

    const name = document.getElementById('edit-contact-name').value;
    const email = document.getElementById('edit-contact-email').value;
    const phone = document.getElementById('edit-contact-phone').value;

    if (!name || !email || !phone) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const response = await fetch(`${DB_URL}/contacts/${contactId}.json`, {
            method: 'PATCH',
            body: JSON.stringify({
                name: name,
                email: email,
                phone: phone,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error updating contact');
        }

        console.log(`Contact with ID ${contactId} successfully updated.`);
        closeEditOverlay();
        loadContacts(); // Reload the contacts list
    } catch (error) {
        console.error('Error updating contact:', error);
    }
}
