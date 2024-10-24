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
                contactElement.onclick = () => showContactDetails(contact, key);

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

function showContactDetails(contact, contactId) {
    const overlay = document.getElementById('overlay');

    overlay.setAttribute('data-contact-id', contactId);

    const contactDetailsContainer = document.querySelector('.contact-details');

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
                    <div class="action-contact" >
                        <div id="edit" class="action-type" onclick="editContact('${contactId}')" >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256">
                                <path
                                    d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z">
                                </path>
                            </svg>
                            <span>Edit</span>
                        </div>
                        <div class="action-type" onclick="deleteContact()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256">
                                <path
                                    d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z">
                                </path>
                            </svg>     
                            <span>Delete</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="contact-info">
                <span class="contact-info-text">Contact Information</span>
                <div class="info-section">
                    <span class="email-card">Email</span>
                    <a href="mailto:${contact.email}" class="email">${contact.email}</a>
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

window.onload = async function() {
    await includeHTML();
    await loadContacts();
};
