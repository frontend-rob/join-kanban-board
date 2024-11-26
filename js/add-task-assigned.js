/**
 * toggles the visibility of the contact dropdown and rotates the dropdown icon.
 */
function toggleContactDropdown() {
    const contactDropdown = document.getElementById('contact-dropdown');
    const contactDropdownIcon = document.getElementById('contact-dropdown-icon');

    contactDropdown.classList.toggle('hidden');
    contactDropdown.classList.toggle('show');
    contactDropdownIcon.classList.toggle('rotated');

    if (contactDropdown.classList.contains('show')) {
        renderContacts();
    }
}


/**
 * closes the contact dropdown and resets the icon rotation.
 */
function closeContactDropdown() {
    const contactDropdown = document.getElementById('contact-dropdown');
    const contactDropdownIcon = document.getElementById('contact-dropdown-icon');

    contactDropdown.classList.add('hidden');
    contactDropdown.classList.remove('show');
    contactDropdownIcon.classList.remove('rotated');
}


/**
 * closes the contact dropdown when a click occurs outside of the dropdown or input field.
 * 
 * @param {MouseEvent} event - the mouse event triggered by a click.
 */
document.addEventListener('click', function (event) {
    const assignedInput = document.getElementById('assigned-to');
    const contactDropdown = document.getElementById('contact-dropdown');

    if (!assignedInput.contains(event.target) && !contactDropdown.contains(event.target)) {
        closeContactDropdown();
    }
});


let allContacts = [];

/**
 * fetches all contacts from the firebase database.
 * 
 * @async
 * @returns {Promise<Array<Object>|null>} an array of contacts if successful, otherwise null.
 */
async function fetchContacts() {
    const response = await fetch(`${DB_URL}/contacts.json`);

    if (!response.ok) {
        throw new Error('Failed to fetch contacts from Firebase: Network response was not ok.');
    }

    const contactsObj = await response.json();
    const contacts = Object.entries(contactsObj).map(([contactId, contact]) => ({
        ...contact,
        id: contactId
    }));

    allContacts = contacts;
    return contacts;
}


/**
 * saves the state of a contact checkbox in local storage.
 * 
 * @param {string} contactId - the unique id of the contact.
 * @param {boolean} isChecked - the current state of the checkbox.
 */
function toggleCheckboxState(contactId, isChecked) {
    const checkboxStates = JSON.parse(localStorage.getItem('checkboxStates')) || {};
    checkboxStates[contactId] = isChecked;
    localStorage.setItem('checkboxStates', JSON.stringify(checkboxStates));
}


/**
 * restores the state of contact checkboxes and applies 'active' classes from local storage.
 */
function updateCheckboxesState() {
    const checkboxes = document.querySelectorAll('.contact-checkbox input[type="checkbox"]');
    const checkboxStates = getCheckboxStates();

    checkboxes.forEach(checkbox => updateContactItemState(checkbox, checkboxStates));
}


/**
 * retrieves the stored checkbox states from local storage.
 * 
 * @returns {object} - the stored states of checkboxes, defaulting to an empty object if not found.
 */
function getCheckboxStates() {
    return JSON.parse(localStorage.getItem('checkboxStates')) || {};
}


/**
 * updates the visual and functional state of a contact item.
 * 
 * @param {htmlinputelement} checkbox - the checkbox element to update.
 * @param {object} checkboxStates - the stored states of checkboxes.
 */
function updateContactItemState(checkbox, checkboxStates) {
    const contactItem = checkbox.closest('.contact-item');
    const contactId = contactItem.getAttribute('data-id');
    const isChecked = checkboxStates[contactId] || false;

    updateCheckboxIcon(checkbox, isChecked);
    updateContactItemClass(contactItem, checkbox, isChecked);
}


/**
 * updates the checkbox icon based on its checked state.
 * 
 * @param {htmlinputelement} checkbox - the checkbox element.
 * @param {boolean} isChecked - the checked state of the checkbox.
 */
function updateCheckboxIcon(checkbox, isChecked) {
    const img = checkbox.closest('.contact-checkbox').querySelector('img');
    if (img) {
        img.src = `../assets/icons/${isChecked ? 'checked-dark.svg' : 'unchecked.svg'}`;
    }
}


/**
 * updates the class and checked state of a contact item.
 * 
 * @param {htmlelement} contactItem - the contact item element.
 * @param {htmlinputelement} checkbox - the checkbox element within the contact item.
 * @param {boolean} isChecked - the checked state of the checkbox.
 */
function updateContactItemClass(contactItem, checkbox, isChecked) {
    checkbox.checked = isChecked;
    if (isChecked) {
        contactItem.classList.add('active');
    } else {
        contactItem.classList.remove('active');
    }
}


/**
 * retrieves the checkbox state for a contact from local storage.
 * 
 * @param {string} contactId - the unique id of the contact.
 * @returns {boolean} the checked state of the checkbox.
 */
function getCheckboxState(contactId) {
    const checkboxStates = JSON.parse(localStorage.getItem('checkboxStates')) || {};
    return checkboxStates[contactId] || false;
}


/**
 * handles the click on a contact card, toggling the checkbox and updating selected contact icons.
 * 
 * @param {HTMLElement} contactItem - the clicked contact card element.
 */
function handleContactClick(contactItem) {
    const { checkbox, checkboxLabel, contactId, isChecked } = getContactDetails(contactItem);

    toggleCheckboxState(contactId, isChecked);
    updateCheckboxIcon(checkboxLabel, isChecked);
    toggleContactSelection(contactItem, contactId, isChecked);
}


/**
 * Retrieves the details of the contact from the contact item.
 * 
 * @param {HTMLElement} contactItem - the contact card element.
 * @returns {Object} - Contains checkbox, checkboxLabel, contactId, and isChecked.
 */
function getContactDetails(contactItem) {
    const checkbox = contactItem.querySelector('input[type="checkbox"]');
    const checkboxLabel = contactItem.querySelector('.contact-checkbox');
    const contactId = contactItem.getAttribute('data-id');
    const isChecked = !checkbox.checked;

    checkbox.checked = isChecked;
    return { checkbox, checkboxLabel, contactId, isChecked };
}


/**
 * Updates the checkbox icon based on its checked state.
 * 
 * @param {HTMLElement} checkboxLabel - the label containing the checkbox icon.
 * @param {boolean} isChecked - the new checked state of the checkbox.
 */
function updateCheckboxIcon(checkboxLabel, isChecked) {
    const img = checkboxLabel.querySelector('img');
    if (img) {
        img.src = `../assets/icons/${isChecked ? 'checked-dark.svg' : 'unchecked.svg'}`;
    }
}


/**
 * toggles the contact selection status by updating the icons and adding/removing styles.
 * 
 * @param {HTMLElement} contactItem - the contact card element.
 * @param {string} contactId - the unique id of the contact.
 * @param {boolean} isChecked - whether the checkbox is checked.
 */
function toggleContactSelection(contactItem, contactId, isChecked) {
    const initials = contactItem.querySelector('.profil-icon').innerText;
    const color = contactItem.querySelector('.profil-icon').style.backgroundColor;

    if (isChecked) {
        addSelectedContactIcon(contactId, color, initials);
        contactItem.classList.add('active');
    } else {
        removeSelectedContactIcon(contactId);
        contactItem.classList.remove('active');
    }
}


/**
 * fetches and renders contacts in the dropdown.
 * ensures the user contact appears first and the rest are sorted alphabetically.
 */
async function renderContacts() {
    const contactDropdown = prepareContactDropdown();

    const contacts = await fetchContacts();
    if (!contacts) {
        displayError(contactDropdown);
        return;
    }

    const sortedContacts = sortContactsAlphabetically(contacts);
    const updatedContacts = prioritizeUserContact(sortedContacts);
    renderContactList(contactDropdown, updatedContacts);
    initializeContactInteractions();
}


/**
 * prepares the contact dropdown for rendering.
 * @returns {HTMLElement} the prepared contact dropdown element.
 */
function prepareContactDropdown() {
    const contactDropdown = document.getElementById('contact-dropdown');
    contactDropdown.classList.remove('hidden');
    contactDropdown.innerHTML = '';
    return contactDropdown;
}


/**
 * sorts the contacts alphabetically by their name.
 * @param {Array<Object>} contacts - the list of contacts.
 * @returns {Array<Object>} the sorted contact list.
 */
function sortContactsAlphabetically(contacts) {
    return contacts.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
}


/**
 * moves the user contact to the top of the contact list if it exists.
 * @param {Array<Object>} contacts - the sorted list of contacts.
 * @returns {Array<Object>} the updated contact list with the user contact prioritized.
 */
function prioritizeUserContact(contacts) {
    const userContact = getUserContact(contacts);
    if (userContact) {
        moveUserContactToTop(contacts, userContact);
    }
    return contacts;
}


/**
 * renders the contact list into the dropdown.
 * @param {HTMLElement} contactDropdown - the dropdown element.
 * @param {Array<Object>} contacts - the list of contacts to render.
 */
function renderContactList(contactDropdown, contacts) {
    renderContactItems(contactDropdown, contacts);
}


/**
 * initializes the interactions for the contacts (checkboxes and click listeners).
 */
function initializeContactInteractions() {
    updateCheckboxesState();
    addContactClickListeners();
}


/**
 * displays an error message when contacts can't be loaded.
 * @param {HTMLElement} contactDropdown - the contact dropdown element to update.
 */
function displayError(contactDropdown) {
    contactDropdown.innerHTML = '<p>error loading contacts.</p>';
}


/**
 * retrieves the user contact from the list of contacts.
 * @param {Array} contacts - the list of all contacts.
 * @returns {Object|null} - the user contact object or null if not found.
 */
function getUserContact(contacts) {
    const userName = localStorage.getItem('userName');
    if (!userName) return null;

    const userContactIndex = contacts.findIndex(contact => contact.name === userName);
    if (userContactIndex !== -1) {
        const userContact = contacts.splice(userContactIndex, 1)[0];
        userContact.isUserContact = true;
        return userContact;
    }

    return null;
}


/**
 * moves the user contact to the top of the contacts list.
 * @param {Array} contacts - the list of all contacts.
 * @param {Object} userContact - the user contact object.
 */
function moveUserContactToTop(contacts, userContact) {
    userContact.isUserContact = true;
    contacts.unshift(userContact);
}


/**
 * renders the contact items in the dropdown.
 * @param {HTMLElement} contactDropdown - the dropdown element to populate.
 * @param {Array} contacts - the list of contacts to render.
 */
function renderContactItems(contactDropdown, contacts) {
    const contactItemsHTML = contacts
        .map(contact => createContactItemHTML(contact.id, contact, contact.isUserContact))
        .join('');
    contactDropdown.innerHTML = contactItemsHTML;
}


/**
 * adds click listeners to all contact items to toggle checkboxes and icons.
 */
function addContactClickListeners() {
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(contactItem => {
        contactItem.addEventListener('click', () => handleContactClick(contactItem));
    });
}


/**
 * toggles the visibility of the contact dropdown and updates the icon rotation.
 */
function toggleContactDropdown() {
    const contactDropdown = document.getElementById('contact-dropdown');
    const contactDropdownIcon = document.getElementById('contact-dropdown-icon');
    contactDropdown.classList.toggle('hidden');
    contactDropdown.classList.toggle('show');
    contactDropdownIcon.classList.toggle('rotated');

    if (contactDropdown.classList.contains('show')) {
        renderContacts();
    }
}


/**
 * filters contacts based on the search term and updates the dropdown display.
 */
function searchContacts() {
    const searchTerm = document.getElementById('assigned-to').value.toLowerCase();
    const filteredContacts = allContacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm)
    );

    renderFilteredContacts(filteredContacts);
}


/**
 * renders the dropdown with the filtered list of contacts.
 * if no contacts match, displays a 'no contacts found' message.
 * 
 * @param {Array} contacts - list of filtered contacts to render
 */
function renderFilteredContacts(contacts) {
    const contactDropdown = document.getElementById('contact-dropdown');
    contactDropdown.innerHTML = '';

    if (contacts.length === 0) {
        contactDropdown.innerHTML = '<p>no contacts found.</p>';
        return;
    }

    const contactItemsHTML = contacts.map(contact =>
        createContactItemHTML(contact.id, contact)
    ).join('');

    contactDropdown.innerHTML = contactItemsHTML;
    updateCheckboxesState();
    addContactClickListeners();
}