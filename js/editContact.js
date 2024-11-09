/**
 * Opens the edit contact overlay and loads the contact information.
 * 
 * @async
 * @param {string} contactId - The ID of the contact to edit.
 */
async function editContact(contactId) {
    const overlay = document.getElementById('edit-contact-overlay');
    const overlayContent = document.getElementById('overlay-content-edit-contact');

    showOverlay(overlay, overlayContent);
    addOverlayClickListener(overlay);

    document.body.classList.add('no-scroll');

    try {
        const contact = await fetchContact(contactId);
        if (!contact) return;
        populateContactForm(contact);
        setOverlayContactId(overlay, contactId);
    } catch (error) {
        console.error('Error loading contact information:', error);
    }
}

/**
 * Displays the overlay and animates its entry.
 * 
 * @param {HTMLElement} overlay - The overlay element to display.
 * @param {HTMLElement} overlayContent - The content of the overlay.
 */
function showOverlay(overlay, overlayContent) {
    overlay.style.display = 'flex';
    overlayContent.style.right = '-60%';

    setTimeout(() => {
        overlayContent.classList.add('show-edit-contact');
        if (window.innerWidth > 1024) {
            overlayContent.style.right = '';
        } else {
            overlayContent.style.right = '';
        }
    }, 0);
}


/**
 * Adds a click event listener to the overlay for closing it.
 * 
 * @param {HTMLElement} overlay - The overlay element.
 */
function addOverlayClickListener(overlay) {
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeEditOverlay(); 
            resetFormNotifications()
        }
    });
}

/**
 * Fetches the contact information from the database.
 * 
 * @async
 * @param {string} contactId - The ID of the contact to fetch.
 * @returns {Object|null} - The contact object or null if not found.
 */
async function fetchContact(contactId) {
    const response = await fetch(`${DB_URL}/contacts/${contactId}.json`);
    const contact = await response.json();
    
    if (!contact) {
        console.error('Contact not found.');
    }
    
    return contact;
}

/**
 * Populates the edit contact form with the contact's information.
 * 
 * @param {Object} contact - The contact object.
 */
function populateContactForm(contact) {
    document.getElementById('edit-contact-name').value = contact.name || '';
    document.getElementById('edit-contact-email').value = contact.email || '';
    document.getElementById('edit-contact-phone').value = contact.phone || '';

    const userContactHTML = `
        <div class="user-contact">
            <div class="profile-icon-contact" id="mobile-design" style="background-color: ${contact.color};">
                <span style="color: white;">${contact.initials}</span>
            </div>
        </div>
    `;

    document.getElementById('edit-profile-icon').innerHTML = userContactHTML;
}

/**
 * Sets the contact ID in the overlay for later use.
 * 
 * @param {HTMLElement} overlay - The overlay element.
 * @param {string} contactId - The ID of the contact.
 */
function setOverlayContactId(overlay, contactId) {
    overlay.setAttribute('data-contact-id', contactId);
}

/**
 * Closes the edit contact overlay and hides its content.
 */
function closeEditOverlay() {
    const overlay = document.getElementById('edit-contact-overlay');
    const overlayContent = document.getElementById('overlay-content-edit-contact');

    document.body.classList.remove('no-scroll');

    overlayContent.style.right = '-60%';

    setTimeout(() => {
        overlayContent.classList.remove('show-edit-contact');
    }, 200);

    overlayContent.addEventListener('transitionend', function handler() {
        overlay.style.display = 'none';
        overlayContent.removeEventListener('transitionend', handler); 
    });
    resetFormNotifications();
}

/**
 * Saves the updated contact information to the database.
 * 
 * @async
 */
async function saveContact() {
    const overlay = document.getElementById('edit-contact-overlay');
    const contactId = overlay.getAttribute('data-contact-id');

    const updatedContact = getUpdatedContact();
    if (!updatedContact) return;

    try {
        await updateContactInDatabase(contactId, updatedContact);
        loadContacts();
        closeEditOverlay();
        showContactDetails(updatedContact, contactId);
    } catch (error) {
        console.error('Error saving contact information:', error);
    }
}

/**
 * Retrieves the updated contact information from the form.
 * 
 * @returns {Object|null} - The updated contact object or null if invalid.
 */
function getUpdatedContact() {
    const name = document.getElementById('edit-contact-name').value;
    const email = document.getElementById('edit-contact-email').value;
    const phone = document.getElementById('edit-contact-phone').value;

    if (!name || !email || !phone) {
        alert('Please fill in all fields.');
        return null;
    }

    return {
        name: name,
        email: email,
        phone: phone,
        color: document.getElementById('edit-profile-icon').querySelector('.profile-icon-contact').style.backgroundColor,
        initials: document.getElementById('edit-profile-icon').querySelector('.profile-icon-contact span').textContent
    };
}

/**
 * Updates the contact information in the database.
 * 
 * @async
 * @param {string} contactId - The ID of the contact to update.
 * @param {Object} updatedContact - The updated contact object.
 */
async function updateContactInDatabase(contactId, updatedContact) {
    const response = await fetch(`${DB_URL}/contacts/${contactId}.json`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedContact)
    });

    if (!response.ok) {
        throw new Error('Error updating contact.');
    }
}
