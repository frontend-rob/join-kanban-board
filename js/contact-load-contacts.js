/**
 * Creates letter groups for contact organization.
 */
function createLetterGroups() {
    const letterGroupsContainer = document.querySelector('.letter-groups');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    alphabet.split('').forEach(letter => {
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('letter-group');
        groupDiv.id = letter;
        groupDiv.innerHTML = `
            <h2>${letter}</h2>
            <div class="divider-horizontal"></div>
            <ul></ul>
        `;
        letterGroupsContainer.appendChild(groupDiv);
    });
}

createLetterGroups();

/**
 * Clears all existing contacts in each letter group.
 */
function clearLetterGroups() {
    const letterGroupsContainer = document.querySelector('.letter-groups');
    letterGroupsContainer.querySelectorAll('.letter-group ul').forEach(ul => {
        ul.innerHTML = '';
    });
}

/**
 * Fetches contacts data from the database.
 * 
 * @returns {Promise<Object>} - A promise that resolves to the contact data.
 */
function fetchContactsData() {
    return fetch(`${DB_URL}/contacts.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });
}

/**
 * Creates a contact element with the provided contact details and appends it to the contact list.
 * 
 * @param {Object} contact - The contact object containing details like name, email, and color.
 * @param {string} key - The unique key for the contact (used as the id).
 * @param {boolean} isCurrentUser - Flag indicating whether the contact is the current user.
 * @returns {HTMLElement} - The created contact element.
 */
function createContactElement(contact, key, isCurrentUser) {
    const contactElement = document.createElement('li');
    contactElement.classList.add('contact');
    contactElement.setAttribute('id', key);

    contactElement.onclick = () => showContactDetails(contact, key);

    contactElement.innerHTML = createContactTemplate(contact, key, isCurrentUser);

    return contactElement;
}

/**
 * Appends a contact element to the corresponding letter group.
 * 
 * @param {HTMLElement} contactElement - The contact list item element.
 * @param {string} letterGroup - The first letter of the contact's name (used for grouping).
 * @param {Object} letterGroupsCount - Keeps track of the count of contacts in each letter group.
 */
function appendContactToGroup(contactElement, letterGroup, letterGroupsCount) {
    const contactList = document.querySelector('.contact-list');
    const group = contactList.querySelector(`#${letterGroup}`);
    
    if (group) {
        group.querySelector('ul').appendChild(contactElement);
        letterGroupsCount[letterGroup] = (letterGroupsCount[letterGroup] || 0) + 1;
    }
}

/**
 * Updates the visibility of letter groups based on the number of contacts.
 * 
 * @param {Object} letterGroupsCount - The count of contacts for each letter group.
 */
function updateLetterGroupVisibility(letterGroupsCount) {
    const contactList = document.querySelector('.contact-list');
    Object.keys(letterGroupsCount).forEach(letter => {
        const group = contactList.querySelector(`#${letter}`);
        group.style.display = letterGroupsCount[letter] === 0 ? 'none' : 'block';
    });
}

/**
 * Hides letter groups that have no contacts.
 */
function hideEmptyGroups() {
    const allGroups = document.querySelectorAll('.letter-group');
    allGroups.forEach(group => {
        const ul = group.querySelector('ul');
        if (ul.children.length === 0) {
            group.style.display = 'none';
        }
    });
}

/**
 * Loads contacts from the database and populates the letter groups.
 */
/**
 * Loads contacts from the database and populates the letter groups.
 */
function loadContacts() {
    const currentUserName = localStorage.getItem("userName");
    clearLetterGroups();
    fetchContactsData().then(data => {
        const letterGroupsCount = {};
        Object.entries(data).forEach(([key, contact]) => {
            const letterGroup = contact.name.charAt(0).toUpperCase();
            const isCurrentUser = contact.name === currentUserName;
            const contactElement = createContactElement(contact, key, isCurrentUser);
            appendContactToGroup(contactElement, letterGroup, letterGroupsCount);
        });
        updateLetterGroupVisibility(letterGroupsCount);
        hideEmptyGroups();
    });
}


/**
 * Displays contact details in the overlay.
 * 
 * @param {Object} contact - The contact to display.
 * @param {string} contactId - The ID of the contact.
 */
function showContactDetails(contact, contactId) {
    const overlay = document.getElementById('overlay');
    overlay.setAttribute('data-contact-id', contactId);

    setActiveContact(contactId);
    updateContactDetailsContainer(contact, contactId);
    preventPageScroll();
}

/**
 * Sets the active contact by adding the 'user-active' class to the contact element.
 * 
 * @param {string} contactId - The ID of the contact.
 */
function setActiveContact(contactId) {
    document.querySelectorAll('.contact.user-active').forEach(activeContact => {
        activeContact.classList.remove('user-active');
    });

    const activeContactElement = document.querySelector(`.contact-list #${contactId}`);
    if (activeContactElement) {
        activeContactElement.classList.add('user-active');
    }
}

/**
 * Updates the contact details container with the generated HTML for the contact.
 * 
 * @param {Object} contact - The contact to display.
 * @param {string} contactId - The ID of the contact.
 */
function updateContactDetailsContainer(contact, contactId) {
    const contactDetailsContainer = document.querySelector('.contact-details');
    contactDetailsContainer.innerHTML = generateContactDetails(contact, contactId);
    contactDetailsContainer.classList.add('show-contact-details');
}

/**
 * Prevents the page from scrolling when the contact details are shown.
 */
function preventPageScroll() {
    document.body.classList.add('no-scroll');
}



/**
 * Hides the contact details overlay.
 */
function hideContactDetails() {
    const contactDetailsContainer = document.querySelector('.contact-details');
    contactDetailsContainer.classList.add('hide');
    const activeContact = document.querySelector('.contact.user-active');
    if (activeContact) {
        activeContact.classList.remove('user-active');
    }
    setTimeout(() => {
        contactDetailsContainer.classList.remove('show-contact-details', 'hide');
        document.body.classList.remove('no-scroll');
    }, 300);
}