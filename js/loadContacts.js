/**
 * Dynamically creates letter groups for contacts in the contact list.
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
            <ul>
                <!-- Contacts will be generated here dynamically -->
            </ul>
        `;
        letterGroupsContainer.appendChild(groupDiv);
    });
}

createLetterGroups();

/**
 * Loads contacts from the Realtime Database and organizes them into letter groups.
 */
function loadContacts() {
    const contactList = document.querySelector('.contact-list');
    const letterGroupsContainer = document.querySelector('.letter-groups');

    letterGroupsContainer.querySelectorAll('.letter-group ul').forEach(ul => {
        ul.innerHTML = '';
    });

    fetch(`${DB_URL}/contacts.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const letterGroupsCount = {};

            for (const key in data) {
                const contact = data[key];
                const letterGroup = contact.name.charAt(0).toUpperCase();
                const group = contactList.querySelector(`#${letterGroup}`);

                const contactElement = document.createElement('li');
                contactElement.classList.add('contact');
                contactElement.onclick = () => showContactDetails(contact, key); // Übergib den Schlüssel hier
                
                contactElement.innerHTML = `
                    <div class="user">
                        <div class="profile-icon" style="background-color: ${contact.color};">
                            <span style="color: white;">${contact.initials}</span>
                        </div>
                    </div>
                    <div class="contact-name-and-email">
                        <span class="name">${contact.name}</span>
                        <span class="email">${contact.email}</span>
                    </div>
                `;

                if (group) {
                    group.querySelector('ul').appendChild(contactElement);
                    letterGroupsCount[letterGroup] = (letterGroupsCount[letterGroup] || 0) + 1;
                }
            }

            Object.keys(letterGroupsCount).forEach(letter => {
                const group = contactList.querySelector(`#${letter}`);
                if (letterGroupsCount[letter] === 0) {
                    group.style.display = 'none';
                } else {
                    group.style.display = 'block';
                }
            });

            const allGroups = contactList.querySelectorAll('.letter-group');
            allGroups.forEach(group => {
                const ul = group.querySelector('ul');
                if (ul.children.length === 0) {
                    group.style.display = 'none';
                }
            });
        })
        .catch((error) => {
            console.error("Error loading contacts: ", error);
        });
}



/**
 * Initializes the application by creating letter groups and loading contacts when the window loads.
 */

/**
 * Updates the contact details section with the selected contact's information.
 * @param {Object} contact - The contact object containing the details.
*/
/**
 * Updates the contact details section with the selected contact's information.
 * @param {Object} contact - The contact object containing the details.
*/
function showContactDetails(contact, contactId) {
    const overlay = document.getElementById('overlay');

    // Setze die Kontakt-ID im Overlay
    overlay.setAttribute('data-contact-id', contactId); // Kontakt-Schlüssel übergeben

    const contactDetailsContainer = document.querySelector('.contact-details');
    
    // Aktualisiere die Kontaktinformationen
    contactDetailsContainer.innerHTML = `
        <div class="headline-wrapper">
            <h1 class="main-headline">Contacts</h1>
            <div class="divider-vertical divider-accent"></div>
            <span>Better with a team</span>
        </div>
        <div class="contact-card">
            <div class="icon-name-and-action">
                <div class="user-contact">
                    <div class="profile-icon-contact" style="background-color: ${contact.color};">
                        <span style="color: white;">${contact.initials}</span>
                    </div>
                </div>
                <div class="contact-name-and-email">
                    <span class="name-detail">${contact.name}</span>
                    <div class="action-contact">
                        <div class="action-type">
                            <img src="../assets/icons/edit.svg" alt="Edit Icon">
                            <span>Edit</span>
                        </div>
                        <div class="action-type" onclick="deleteContact()">
                            <img src="../assets/icons/delete.svg" alt="Delete Icon">
                            <span>Delete</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="contact-info">
                <span class="contact-info-text">Contact Information</span>
                <div class="info-section">
                    <span class="email-card">Email</span>
                    <span class="email">${contact.email}</span>
                    <span class="phone-card">Phone</span>
                    <span class="phone">${contact.phone}</span>
                </div>
            </div>
        </div>
    `;

    contactDetailsContainer.classList.add('show');
}





window.onload = function() {
    createLetterGroups();
    loadContacts();
};

/**
 * Die Funktion wird beim Laden der Seite aufgerufen.
 */
window.onload = async function() {
    await includeHTML(); // Lade Header und Sidebar
    await loadContacts(); // Lade die Kontakte
};