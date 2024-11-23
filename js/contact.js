/**
 * Initializes the summary page content by rendering the main content
 * and preventing landscape orientation on mobile devices.
 * 
 * @async
 * @function
 * @returns {Promise<void>} - a promise that resolves when the start content is initialized.
 */
async function initContactPage() {
    await renderContactContent();
    createLetterGroups();
    loadContacts();
    addPreventEnterKeyListener();
    initializeNavigation();
    preventLandscapeOnMobileDevices();
}

/**
 * Renders the content for the summary site.
 * this function fetches tasks from firebase and handles the display of statistics based on the fetched tasks.
 * it loads summary templates and updates the display accordingly.
 * 
 * @returns {Promise<void>} a promise that resolves when the summary content has been rendered. 
 */
async function renderContactContent() {
    const contactComponents = getContactComponents();
    loadContactTemplates(contactComponents);
    await setUserDataFromLocalStorage();
}

/**
 * Retrieves the dashcontact component for the summary.
 * 
 * @returns {object} an object containing the dashcontact element.
 * @returns {htmlelement} dashcontact - the dashcontact element for summary content.
 */
function getContactComponents() {
    return {
        header: document.getElementById('header-content'),
        navigation: document.getElementById('navigation-content'),
        landscapeModal: document.getElementById('landscape-wrapper')
    };
}

/**
 * Loads summary templates into the dashcontact element.
 * 
 * @param {htmlelement} dashcontact - the element for injecting summary content.
 */
function loadContactTemplates({ header, navigation, landscapeModal }) {
    header.innerHTML = getHeaderContent();
    navigation.innerHTML = getNavigationContent();
    landscapeModal.innerHTML = getLandscapeModalContent();
}

/**
 * Clears the error messages from the form fields.
 */
function clearErrorMessages() {
    document.querySelectorAll('.error-message').forEach(msg => {
        msg.classList.remove('show');
    });
}

/**
 * Validates the name field for first and last name.
 * @param {string} nameId - The ID of the name input field.
 * @returns {boolean} - Returns true if the name is valid, otherwise false.
 */
function validateName(nameId) {
    const name = document.getElementById(nameId);
    const nameParts = name.value.trim().split(' ');
    const namePattern = /^[a-zA-ZäöüÄÖÜß]+$/;

    return nameParts.length >= 2 && nameParts.every(part => namePattern.test(part));
}

/**
 * Validates the email field.
 * @param {string} emailId - The ID of the email input field.
 * @returns {boolean} - Returns true if the email is valid, otherwise false.
 */
function validateEmail(emailId) {
    const email = document.getElementById(emailId);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return email.value.trim() && emailPattern.test(email.value);
}

/**
 * Validates the phone field.
 * @param {string} phoneId - The ID of the phone input field.
 * @returns {boolean} - Returns true if the phone number is valid, otherwise false.
 */
function validatePhone(phoneId) {
    const phone = document.getElementById(phoneId);
    const phonePattern = /^\+?\d+( \d+)*$/;

    return phone.value.trim() && phonePattern.test(phone.value);
}

/**
 * Handles the validation of the contact form.
 * @param {boolean} [isEdit=false] - Indicates whether the form is for editing an existing contact.
 * @returns {boolean} - Returns true if all fields are valid, otherwise false.
 */
function handleFieldValidation(isEdit, fieldType, validationFunction) {
    const fieldId = isEdit ? `edit-contact-${fieldType}` : `contact-${fieldType}`;
    const errorId = isEdit ? `error-edit-contact-${fieldType}` : `error-contact-${fieldType}`;

    if (!validationFunction(fieldId)) {
        document.getElementById(errorId).classList.add('show');
        return false;
    }
    return true;
}

/**
 * Validates the contact form fields, checking the name, email, and phone number.
 * @param {boolean} [isEdit=false] - Indicates whether the form is for editing an existing contact.
 * @returns {boolean} - Returns true if all fields are valid, otherwise false.
 */
function validateContactForm(isEdit = false) {
    let isValid = true;

    clearErrorMessages();

    isValid = handleFieldValidation(isEdit, 'name', validateName) && isValid;
    isValid = handleFieldValidation(isEdit, 'email', validateEmail) && isValid;
    isValid = handleFieldValidation(isEdit, 'phone', validatePhone) && isValid;

    return isValid;
}


/**
 * Resets the form notifications by removing all error messages
 * and clearing the input fields.
 */
function resetFormNotifications() {
    document.querySelectorAll('.error-message').forEach(msg => {
        msg.classList.remove('show');
    });

    document.querySelectorAll('input').forEach(input => {
        input.value = '';
    });
}

/**
 * Adds an event listener to all input fields to prevent
 * the default action of the Enter key, which is to submit the form.
 */
function addPreventEnterKeyListener() {
    const inputs = document.querySelectorAll('input');

    inputs.forEach(input => {
        input.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const contactList = document.querySelector('.contact-list');
    const mainContent = document.querySelector('.main-content');
    contactList.classList.add('visible');
    mainContent.classList.add('visible');
});
