/**
 * Initializes the summary page content by rendering the main content
 * and preventing landscape orientation on mobile devices.
 * 
 * @async
 * @function
 * @returns {Promise<void>} - a promise that resolves when the start content is initialized.
 */
async function initContactPage() {
    console.log('initContactPage called');
    await renderContactContent();
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
 * Validates the contact form fields, checking if the name contains both first and last names,
 * if the email is in a valid format, and if the phone number contains only digits.
 *
 * @param {boolean} [isEdit=false] - Indicates whether the form is for editing an existing contact.
 * @returns {boolean} - Returns true if all fields are valid, otherwise false.
 */
function validateContactForm(isEdit = false) {
    let isValid = true;

    document.querySelectorAll('.error-message').forEach(msg => {
        msg.classList.remove('show');
    });

    const nameId = isEdit ? 'edit-contact-name' : 'contact-name';
    const emailId = isEdit ? 'edit-contact-email' : 'contact-email';
    const phoneId = isEdit ? 'edit-contact-phone' : 'contact-phone';

    const name = document.getElementById(nameId);
    const nameParts = name.value.trim().split(' ');
    if (nameParts.length < 2) {
        document.getElementById(isEdit ? 'error-edit-contact-name' : 'error-contact-name').classList.add('show');
        isValid = false;
    }

    const email = document.getElementById(emailId);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !emailPattern.test(email.value)) {
        document.getElementById(isEdit ? 'error-edit-contact-email' : 'error-contact-email').classList.add('show');
        isValid = false;
    }

    const phone = document.getElementById(phoneId);
    const phonePattern = /^\d+$/;
    if (!phone.value.trim() || !phonePattern.test(phone.value)) {
        document.getElementById(isEdit ? 'error-edit-contact-phone' : 'error-contact-phone').classList.add('show');
        isValid = false;
    }

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

document.addEventListener('DOMContentLoaded', () => {
    initContactPage();
    addPreventEnterKeyListener();
});

