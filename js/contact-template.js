/**
 * Generates the HTML markup for displaying a contact's details.
 * 
 * @param {Object} contact - The contact object containing details like name, email, etc.
 * @param {string} contactId - The ID of the contact.
 * @returns {string} - The HTML string representing the contact's details.
 */
function generateContactDetails(contact, contactId) {
    return `
    <div class="contact-card">
    <div class="headline-wrapper-contacts d-none">
        <h1 class="main-headline">Contacts</h1>
        <div class="responsive-container">
            <div class="divider-horizontal divider-detail-contact-overlay contact-divider"></div>
            <span>Better with a team</span>
        </div>
        </div>
        <img onclick="hideContactDetails()" class="back-btn" src="../assets/icons/back-arrow.svg" alt="">
            <div class="icon-name-and-action">
                <div class="user-contact">
                    <div class="profile-icon-contact" style="background-color: ${contact.color};">
                        <span style="color: white;">${contact.initials}</span>
                    </div>
                </div>
                <div class="contact-name-and-email">
                    <span class="name-detail">${contact.name}</span>
                    <div class="action-contact">
                        <div id="edit" class="action-type" onclick="editContact('${contactId}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256">
                                <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path>
                            </svg>
                            <span>Edit</span>
                        </div>
                        <div class="action-type" onclick="deleteContact()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256">
                                <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
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
                    <img onclick="editContact('${contactId}')" class="edit-contact-btn-mobile" src="../assets/icons/edit-contact-btn-mobile.png" alt="">
                </div>
            </div>
        </div>
    `;
}


/**
 * Creates the HTML template for a contact element.
 * 
 * @param {Object} contact - The contact object containing details like name, email, and color.
 * @param {string} key - The unique key for the contact (used as the id).
 * @param {boolean} isCurrentUser - Flag indicating whether the contact is the current user.
 * @returns {string} - The HTML string representing the contact element.
 */
function createContactTemplate(contact, key, isCurrentUser) {
    return `
        <div class="user">
            <div class="profile-icon" style="background-color: ${contact.color};">
                <span style="color: white;">${contact.initials}</span>
            </div>
        </div>
        <div class="contact-name-and-email">
            <span class="name">${contact.name}${isCurrentUser ? ' (You)' : ''}</span>
            <span class="email-list">${contact.email}</span>
        </div>
    `;
}