/**
 * Retrieves the assigned contact IDs from the selected profile icons.
 * 
 * @returns {Array<string>} An array of assigned contact IDs.
 */
function getAssignedContactIds() {
    const selectedContactIcons = document.querySelectorAll('#selected-contacts-edit-task .selected-profile-icon');
    return Array.from(selectedContactIcons).map(icon => icon.getAttribute('data-id'));
}

/**
 * Activates the contact item in the dropdown based on the contact ID.
 * 
 * @param {string} contactId - The ID of the contact to activate.
 * @param {HTMLElement} contactItem - The contact item element to activate.
 */
function activateContactItem(contactId, contactItem) {
    
    contactItem.classList.add('active');
    
    const checkbox = contactItem.querySelector('input[type="checkbox"]');
    const checkboxLabel = contactItem.querySelector('.contact-checkbox');
    
    if (checkbox) {
        checkbox.checked = true;
        checkboxLabel.classList.remove('unchecked');
        checkboxLabel.classList.add('checked');
        
        const checkboxImg = checkboxLabel.querySelector('img');
        if (checkboxImg) {
            checkboxImg.src = '../assets/icons/checked-dark.svg';
        }
    }
}

/**
 * Searches for a contact item in the dropdown by its contact ID.
 * 
 * @param {string} contactId - The ID of the contact to search for.
 * @returns {HTMLElement|null} The found contact item element or null if not found.
 */
function findContactItemInDropdown(contactId) {
    const contactDropdown = document.getElementById('contact-dropdown-edit-task');
    return contactDropdown.querySelector(`.contact-item[data-id="${contactId}"]`);
}

/**
 * Preselects the assigned contacts in the contact dropdown based on the selected profile icons.
 */
function preselectAssignedContacts() {
    const assignedContactIds = getAssignedContactIds();


    assignedContactIds.forEach(contactId => {

        const contactItem = findContactItemInDropdown(contactId);

        if (contactItem) {
            activateContactItem(contactId, contactItem);
        } else {
            console.warn(`No contact item found for ID: ${contactId}`);
        }
    });
}