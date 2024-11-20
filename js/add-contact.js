/**
 * Adds a new contact to the database after checking if the email already exists.
 * @async
 * @returns {Promise<void>}
 */
async function addContact() {
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const phone = document.getElementById('contact-phone').value;

    if (!areFieldsValid(name, email, phone)) {
        return;
    }

    const contacts = await fetchContactsFromFirebase();
    if (isEmailAlreadyUsed(contacts, email)) {
        showEmailUsedNotification();
        return;
    }

    await storeContact(name, email, phone, contacts);
    showNotification();
}

/**
 * Validates the input fields for the contact.
 * @param {string} name - The name of the contact.
 * @param {string} email - The email of the contact.
 * @param {string} phone - The phone number of the contact.
 * @returns {boolean} True if all fields are valid, false otherwise.
 */
function areFieldsValid(name, email, phone) {
    if (!name || !email || !phone) {
        alert("Please fill in all fields.");
        return false;
    }
    return true;
}

/**
 * Stores the contact to the database.
 * @param {string} name - The name of the contact.
 * @param {string} email - The email of the contact.
 * @param {string} phone - The phone number of the contact.
 * @param {Object} contacts - The existing contacts from the database.
 * @returns {Promise<void>}
 */
async function storeContact(name, email, phone, contacts) {
    const { initials, color } = getContactDetails(name, email, contacts);
    await addContactToDatabase({ name, email, phone, initials, color });
    await finalizeContactAddition();
}

/**
 * Gets the initials and color for the contact.
 * @param {string} name - The name of the contact.
 * @param {string} email - The email of the contact.
 * @param {Object} contacts - The existing contacts from the database.
 * @returns {Object} - An object containing initials and color.
 */
function getContactDetails(name, email, contacts) {
    return {
        initials: getInitials(name),
        color: getColorForContact(contacts, email)
    };
}

/**
 * Adds the contact to the database.
 * @param {Object} contact - The contact data to be stored.
 * @returns {Promise<void>}
 */
async function addContactToDatabase(contact) {
    try {
        const response = await fetch(`${DB_URL}/contacts.json`, {
            method: 'POST',
            body: JSON.stringify(contact),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Error adding contact');
    } catch (error) {
        console.error("Error adding contact:", error);
    }
}

/**
 * Finalizes the contact addition process.
 * @returns {Promise<void>}
 */
async function finalizeContactAddition() {
    await Promise.all([loadContacts(), closeTaskOverlay(), resetInputFields()]);
}



/**
 * Checks if an email is already used in the contacts database.
 * @param {Object} contacts - The existing contacts from the database.
 * @param {string} email - The email address to check.
 * @returns {boolean} True if the email is already used, false otherwise.
 */
function isEmailAlreadyUsed(contacts, email) {
    for (const key in contacts) {
        if (contacts[key].email === email) {
            return true;
        }
    }
    return false;
}

/**
 * Resets the input fields in the form.
 * @returns {void}
 */
function resetInputFields() {
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-email').value = '';
    document.getElementById('contact-phone').value = '';

    document.getElementById('edit-contact-name').value = '';
    document.getElementById('edit-contact-email').value = '';
    document.getElementById('edit-contact-phone').value = '';
}

/**
 * Deletes the current contact and resets the input fields.
 * @returns {void}
 */
function deleteContactInfo() {
    resetInputFields();
}

/**
 * Generates initials from a given name.
 * @param {string} name - The name to generate initials from.
 * @returns {string} The generated initials.
 */
function getInitials(name) {
    const nameParts = name.trim().split(' ');
    return nameParts.map(part => part.charAt(0).toUpperCase()).join('').substring(0, 2);
}

/**
 * Determines the color for a contact based on existing contacts.
 * @param {Object} contacts - The existing contacts from the database.
 * @param {string} email - The email address to check for existing color.
 * @returns {string} The color associated with the email or a random color.
 */
function getColorForContact(contacts, email) {
    for (const key in contacts) {
        if (contacts[key].email === email) {
            return contacts[key].color;
        }
    }
    return getRandomColor();
}

/**
 * Generates a random color from a predefined list of colors.
 * @returns {string} A color in hexadecimal format from the predefined list.
 */
function getRandomColor() {
    const colors = [
        '#ff7900', '#9327ff', '#6e52ff', '#fc71ff', '#ffbb2a',
        '#20d7c1', '#462f8a', '#ff4647', '#00bee7'
    ];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

/**
 * Fetches contacts from the Firebase database.
 * @async
 * @returns {Promise<Object>} A promise that resolves to the contacts object.
 */
async function fetchContactsFromFirebase() {
    const response = await fetch(`${DB_URL}/contacts.json`);
    const data = await response.json();
    return data || {};
}

/**
 * Closes the task overlay.
 * @returns {void}
 */
function closeTaskOverlay() {
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'none';
    document.body.classList.remove('no-scroll');
    resetFormNotifications();
    
}

/**
 * Shows a notification after adding a contact.
 * @returns {Promise<void>}
 */
function showNotification() {
    return new Promise((resolve) => {
        const modal = document.getElementById('successful-contact-add-modal');
        modal.classList.remove('hidden');
        modal.classList.add('show');

        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('show');
            resolve();
        }, 1000);
    });
}


/**
 * Shows a notification if email is already in the contact list
 * @returns {Promise<void>}
 */
function showEmailUsedNotification() {
    return new Promise((resolve) => {
        const modal = document.getElementById('email-used-error-modal');
        modal.classList.remove('hidden');
        modal.classList.add('show');

        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('show');
            resolve();
        }, 1000);
    });
}
