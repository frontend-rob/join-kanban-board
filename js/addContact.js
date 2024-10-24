/**
 * Adds a new contact to the database after checking if the email already exists.
 * @async
 * @returns {Promise<void>}
 */
async function addContact() {
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const phone = document.getElementById('contact-phone').value;

    if (!name || !email || !phone) {
        alert("Please fill in all fields.");
        return;
    }

    const contacts = await fetchContactsFromFirebase();

    // Check if the email already exists in the database
    if (isEmailAlreadyUsed(contacts, email)) {
        alert("This email is already used by another contact.");
        return;
    }

    const initials = getInitials(name);
    const color = getColorForContact(contacts, email);

    try {
        const response = await fetch(`${DB_URL}/contacts.json`, {
            method: 'POST',
            body: JSON.stringify({
                name: name,
                email: email,
                phone: phone,
                initials: initials,
                color: color,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error adding contact');
        }

        loadContacts();
        closeTaskOverlay();
        resetInputFields(); // Reset input fields after saving
    } catch (error) {
        console.error("Error adding contact:", error);
    }
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
    resetInputFields(); // Reset input fields after deletion
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
 * Generates a random color in hexadecimal format.
 * @returns {string} A random color in hexadecimal format.
 */
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
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
}
