// ! signup logic
// ! the array below should be the section in firebase!!!
// ! fetch and push from data base needed

let users = [
    {
        'user': 'test user',
        'email': 'user@test.de',
        'password': 'test123'
    }
];


/**
 * adds a new user if the form validation passes.
 * @param {Event} event - the event object from the form submission.
 */
async function addUser(event) {
    event.preventDefault();
    const inputs = getFormInputs();
    const validations = validateInputs(inputs);

    // if all validations pass, add the user and show success modal
    if (areAllValid(validations)) {
        addUserToList(inputs);
        await showSuccessModal(); // wait for the modal to hide
        clearForm(inputs);
    }
}


/**
 * retrieves form input elements.
 * @returns {Object} an object containing the input elements.
 */
function getFormInputs() {
    return {
        name: document.getElementById('signup-name'),
        email: document.getElementById('signup-email'),
        password: document.getElementById('signup-password'),
        confirmPassword: document.getElementById('signup-confirm-password'),
        checkbox: document.getElementById('signup-checkbox')
    };
}


/**
 * validates all input fields.
 * @param {Object} inputs - the form input elements.
 * @returns {Object} an object containing validation results.
 */
function validateInputs(inputs) {
    return {
        isNameValid: validateName(inputs.name),
        isEmailValid: validateSignupEmail(inputs.email),
        isPasswordValid: validateSignupPassword(inputs.password),
        isConfirmPasswordValid: validateConfirmPassword(inputs.password, inputs.confirmPassword),
        isCheckboxValid: validateCheckbox(inputs.checkbox)
    };
}


/**
 * checks if all validations are true.
 * @param {Object} validations - the validation results.
 * @returns {boolean} true if all validations are valid, false otherwise.
 */
function areAllValid(validations) {
    return Object.values(validations).every(valid => valid);
}


/**
 * adds the user to the users list.
 * @param {Object} inputs - the form input elements.
 */
function addUserToList(inputs) {
    users.push({
        user: inputs.name.value,
        email: inputs.email.value,
        password: inputs.password.value
    });
}


/**
 * clears the form inputs.
 * @param {Object} inputs - the form input elements.
 */
function clearForm(inputs) {
    inputs.name.value = '';
    inputs.email.value = '';
    inputs.password.value = '';
    inputs.confirmPassword.value = '';
    inputs.checkbox.checked = false;
}


/**
 * validates the user's name input.
 * checks if the name contains both first and last names.
 * @param {HTMLInputElement} nameInput - the name input element.
 * @returns {boolean} true if the name is valid, false otherwise.
 */
function validateName(nameInput) {
    const errorName = document.getElementById('error-signup-name');
    const fullName = nameInput.value.trim();

    // check if full name contains at least two words
    if (fullName.split(' ').length < 2) {
        nameInput.classList.add('input-error');
        errorName.classList.remove('hidden');
        return false; // invalid name
    } else {
        nameInput.classList.remove('input-error');
        errorName.classList.add('hidden');
        return true; // valid name
    }
}


/**
 * Validates the user's email input in the signup form.
 * @param {HTMLInputElement} emailInput - the email input element.
 * @returns {boolean} true if the email is valid, false otherwise.
 */
function validateSignupEmail(emailInput) {
    const errorEmail = document.getElementById('error-signup-email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(emailInput.value.trim())) {
        emailInput.classList.add('input-error');
        errorEmail.classList.remove('hidden');
        return false; // invalid email
    } else {
        emailInput.classList.remove('input-error');
        errorEmail.classList.add('hidden');
        return true; // valid email
    }
}


/**
 * Validates the user's password input in the signup form.
 * @param {HTMLInputElement} passwordInput - the password input element.
 * @returns {boolean} true if the password is valid, false otherwise.
 */
function validateSignupPassword(passwordInput) {
    const errorPassword = document.getElementById('error-signup-password');

    if (passwordInput.value.length < 6) {
        passwordInput.classList.add('input-error');
        errorPassword.classList.remove('hidden');
        return false; // invalid password
    } else {
        passwordInput.classList.remove('input-error');
        errorPassword.classList.add('hidden');
        return true; // valid password
    }
}


/**
 * validates the confirmation password input.
 * checks if the confirmation password matches the original password.
 * @param {HTMLInputElement} passwordInput - the original password input element.
 * @param {HTMLInputElement} confirmPasswordInput - the confirmation password input element.
 * @returns {boolean} true if the confirmation password is valid, false otherwise.
 */
function validateConfirmPassword(passwordInput, confirmPasswordInput) {
    const errorConfirmPassword = document.getElementById('error-signup-confirm-password');

    // check if confirmation password matches the original password
    if (confirmPasswordInput.value !== passwordInput.value) {
        confirmPasswordInput.classList.add('input-error');
        errorConfirmPassword.classList.remove('hidden');
        return false; // invalid confirmation password
    } else {
        confirmPasswordInput.classList.remove('input-error');
        errorConfirmPassword.classList.add('hidden');
        return true; // valid confirmation password
    }
}


/**
 * validates the user's checkbox input.
 * checks if the checkbox is checked and adds animation if not.
 * @param {HTMLInputElement} checkboxInput - the checkbox input element.
 * @returns {boolean} true if the checkbox is checked, false otherwise.
 */
function validateCheckbox(checkboxInput) {
    const checkboxContainer = document.querySelector('.signup-checkbox');

    // check if the checkbox is not checked
    if (!checkboxInput.checked) {
        checkboxInput.classList.add('input-error');
        checkboxContainer.classList.add('blink');

        // remove the blink class after the animation ends
        checkboxContainer.addEventListener('animationend', () => {
            checkboxContainer.classList.remove('blink');
        }, { once: true });
        return false; // invalid checkbox
    } else {
        checkboxInput.classList.remove('input-error');
        checkboxContainer.classList.remove('blink');
        return true; // valid checkbox
    }
}


/**
 * shows the success modal for a limited time.
 * @returns {Promise<void>} a promise that resolves when the modal is hidden.
 */
function showSuccessModal() {
    return new Promise((resolve) => {
        const modal = document.getElementById('success-modal');
        modal.classList.remove('hidden');
        modal.classList.add('show');

        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('show');
            toggleAuth(false);
            resolve(); // resolve the promise after the modal is hidden
        }, 2000);
    });
}