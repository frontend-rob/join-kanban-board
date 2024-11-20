/**
 * generates the contact item template for the dropdown.
 * 
 * @param {string} contactId - the unique id of the contact.
 * @param {string} color - the background color for the contact's initials.
 * @param {string} initials - the initials of the contact.
 * @param {string} name - the full name of the contact.
 * @returns {string} the html template string for the contact item.
 */
const contactTemplate = (contactId, color, initials, name, isChecked) => `
    <div class="contact-item" data-id="${contactId}">
        <div class="contact-info">
            <div class="profil-icon" style="background-color: ${color};">
                ${initials}
            </div>
            <div class="contact-details">
                <p class="contact-name">${name}</p>
            </div>
        </div>
        <label class="contact-checkbox ${isChecked ? 'checked' : 'unchecked'}">
            <!-- Verstecke die Standard-Checkbox -->
            <input type="checkbox" id="${contactId}" ${isChecked ? 'checked' : ''} />
            <!-- Das SVG-Icon für die Checkbox, je nach Status -->
            <img src="../assets/icons/${isChecked ? 'checked-dark.svg' : 'unchecked.svg'}" alt="checkbox icon" />
        </label>
    </div>
`;


/**
 * creates the html structure for a contact item.
 * 
 * @param {string} contactId - the unique id of the contact.
 * @param {object} contact - the contact object containing details like color, initials, and name.
 * @param {string} contact.color - the background color for the contact's initials.
 * @param {string} contact.initials - the initials of the contact.
 * @param {string} contact.name - the full name of the contact.
 * @param {boolean} [isUserContact=false] - whether the contact is the current user.
 * @returns {string} the html string for the contact item.
 */
function createContactItemHTML(contactId, contact, isUserContact = false) {
    const isChecked = getCheckboxState(contactId);
    const checkboxHTML = generateCheckboxHTML(contactId, isChecked);
    const userIndicatorHTML = isUserContact ? '<span class="user-indicator">(you)</span>' : '';

    return `
        <div class="contact-item ${isUserContact ? 'user-contact' : ''}" data-id="${contactId}">
            <div class="contact-info">
                <div class="profil-icon" style="background-color: ${contact.color};">
                    ${contact.initials}
                </div>
                <div class="contact-details">
                    <p class="contact-name">
                        ${contact.name} ${userIndicatorHTML}
                    </p>
                </div>
            </div>
            ${checkboxHTML}
        </div>
    `;
}


/**
 * generates the html for a checkbox with its associated icon.
 * 
 * @param {string} contactId - the unique id of the contact.
 * @param {boolean} isChecked - the checked state of the checkbox.
 * @returns {string} the html string for the checkbox element.
 */
function generateCheckboxHTML(contactId, isChecked) {
    return `
        <label class="contact-checkbox ${isChecked ? 'checked' : 'unchecked'}">
            <input type="checkbox" id="${contactId}" ${isChecked ? 'checked' : ''} />
            <img src="../assets/icons/${isChecked ? 'checked-dark.svg' : 'unchecked.svg'}" alt="checkbox icon" />
        </label>
    `;
}


/**
 * adds a user indicator to a specific contact item in the dom.
 * 
 * @param {string} contactId - the unique id of the contact.
 */
function renderUserIndicator(contactId) {
    const contactItem = document.querySelector(`.contact-item[data-id="${contactId}"]`);
    if (contactItem) {
        const contactNameElement = contactItem.querySelector('.contact-name');
        contactNameElement.innerHTML += ' <span class="user-indicator">(you)</span>';
    }
}


/**
 * adds the contact to the selected contacts container.
 * 
 * @param {string} contactId - the unique id of the contact.
 * @param {string} color - the background color for the contact's initials.
 * @param {string} initials - the initials of the contact.
 */
function addSelectedContactIcon(contactId, color, initials) {
    const existingIcon = document.querySelector(`#selected-contacts .selected-profile-icon[data-id="${contactId}"]`);
    if (!existingIcon) {
        const selectedIcon = `
            <div class="selected-profile-icon" style="background-color: ${color};" data-id="${contactId}">
                ${initials}
            </div>
        `;
        document.getElementById('selected-contacts').innerHTML += selectedIcon;
    }
}


/**
 * adds a contact's profile icon to the selected contacts section.
 * 
 * @param {string} contactId - the unique id of the contact to be added.
 */
function addSelectedContacts(contactId) {
    const contact = allContacts.find(c => c.id === contactId);

    if (contact) {
        addSelectedContactIcon(contactId, contact.color, contact.initials);
    }
}


/**
 * removes the contact's profile icon from the selected contacts container.
 * 
 * @param {string} contactId - the unique id of the contact to be removed.
 */
function removeSelectedContactIcon(contactId) {
    const selectedIcons = document.querySelectorAll('.selected-profile-icon');
    selectedIcons.forEach(icon => {
        if (icon.getAttribute('data-id') === contactId) {
            icon.remove();
        }
    });
}