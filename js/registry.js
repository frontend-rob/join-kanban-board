/**
 * adds a new user if the form validation passes and the user doesn't already exist in firebase.
 *
 * @async
 * @param {Event} event - the event object from the form submission.
 * @returns {Promise<void>} resolves when the user is added or a failure modal is shown.
 */
async function addUser(event) {
    event.preventDefault();
    const inputs = getFormInputs();
    const validations = validateInputs(inputs);

    if (areAllValid(validations)) {
        const userExists = await checkIfUserExists(inputs.email.value);

        if (userExists) {
            await showFailedSignupModal();
            clearForm(inputs);
        } else {
            await addUserToFirebase(inputs);
            await showSuccessModal();
            clearForm(inputs);
        }
    }
}


/**
 * checks if a user with the given email already exists in firebase.
 *
 * @async
 * @param {string} email - the email to check.
 * @returns {Promise<boolean>} resolves to true if the user exists, false otherwise.
 */
async function checkIfUserExists(email) {
    try {
        const users = await fetchUsersFromFirebase();
        return userExists(users, email);
    } catch (error) {
        console.error('error checking user in firebase:', error);
        return false;
    }
}


/**
 * fetches users from firebase.
 *
 * @async
 * @returns {Promise<Object>} resolves to the users object retrieved from firebase.
 * @throws {Error} if the fetch request fails or if the response is not ok.
 */
async function fetchUsersFromFirebase() {
    const response = await fetch(`${DB_URL}/users.json`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
}


/**
 * checks if a user with the specified email exists in the users object.
 *
 * @param {Object} users - the users object fetched from firebase.
 * @param {string} email - the email to check.
 * @returns {boolean} true if the user exists, false otherwise.
 */
function userExists(users, email) {
    return Object.values(users).some(user => user.email === email);
}


/**
 * adds a new user to the Firebase Realtime Database.
 *
 * @param {Object} inputs - the form input elements containing user information.
 * @param {HTMLInputElement} inputs.name - the user's name input element.
 * @param {HTMLInputElement} inputs.email - the user's email input element.
 * @param {HTMLInputElement} inputs.password - the user's password input element.
 * @returns {Promise<void>} resolves when the user is successfully added.
 */
async function addUserToFirebase(inputs) {
    const newUser = {
        name: inputs.name.value,
        email: inputs.email.value,
        password: inputs.password.value
    };

    try {
        await registerUserInFirebase(newUser);
    } catch (error) {
        console.error('Error adding user to Firebase:', error);
    }
}


/**
 * registers a new user in the Firebase Realtime Database.
 *
 * @param {Object} user - the user object containing registration details.
 * @param {string} user.name - the user's name.
 * @param {string} user.email - the user's email address.
 * @param {string} user.password - the user's password.
 * @returns {Promise<void>} resolves when the user is successfully registered.
 * @throws {Error} if registration fails.
 */
async function registerUserInFirebase(user) {
    const response = await fetch(`${DB_URL}/users.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    });

    if (!response.ok) {
        throw new Error('Failed to register user in Firebase.');
    }
}


/**
 * retrieves the form input elements for the sign-up process.
 *
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
 * validates all input fields in the sign-up form.
 *
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
 * 
 * @param {Object} validations - the validation results.
 * @returns {boolean} true if all validations are valid, false otherwise.
 */
function areAllValid(validations) {
    return Object.values(validations).every(valid => valid);
}


/**
 * clears the form inputs.
 * 
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
 * updates the error state of an input field and its corresponding error message.
 * 
 * @param {HTMLInputElement} input - the input element to update.
 * @param {HTMLElement} errorElement - the corresponding error message element.
 * @param {boolean} isValid - whether the input is valid or not.
 */
function setSignupInputErrorState(input, errorElement, isValid) {
    if (isValid) {
        input.classList.remove('input-error');
        errorElement.classList.remove('show');
    } else {
        input.classList.add('input-error');
        errorElement.classList.add('show');
    }
}


/**
 * validates the user's name input.
 * checks if the name contains both first and last names.
 * 
 * @param {HTMLInputElement} nameInput - the name input element.
 * @returns {boolean} true if the name is valid, false otherwise.
 */
function validateName(nameInput) {
    const errorName = document.getElementById('error-signup-name');
    const fullName = nameInput.value.trim();
    const isValid = fullName.split(' ').length >= 2;

    setSignupInputErrorState(nameInput, errorName, isValid);
    return isValid;
}


/**
 * validates the signup email.
 *
 * @param {HTMLInputElement} emailInput - the input element for the user's email.
 * @returns {boolean} true if the email format is valid, false otherwise.
 */
function validateSignupEmail(emailInput) {
    const errorEmail = document.getElementById('error-signup-email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailPattern.test(emailInput.value.trim());

    setSignupInputErrorState(emailInput, errorEmail, isValid);
    return isValid;
}


/**
 * validates the signup password.
 *
 * @param {HTMLInputElement} passwordInput - the input element for the user's password.
 * @returns {boolean} true if the password meets the minimum length requirement, false otherwise.
 */
function validateSignupPassword(passwordInput) {
    const errorPassword = document.getElementById('error-signup-password');
    const isValid = passwordInput.value.length >= 6;

    setSignupInputErrorState(passwordInput, errorPassword, isValid);
    return isValid;
}


/**
 * validates the confirmation password input.
 * checks if the confirmation password matches the original password.
 * 
 * @param {HTMLInputElement} passwordInput - the original password input element.
 * @param {HTMLInputElement} confirmPasswordInput - the confirmation password input element.
 * @returns {boolean} true if the confirmation password is valid, false otherwise.
 */
function validateConfirmPassword(passwordInput, confirmPasswordInput) {
    const errorConfirmPassword = document.getElementById('error-signup-confirm-password');
    const isValid = passwordInput.value === confirmPasswordInput.value;

    setSignupInputErrorState(confirmPasswordInput, errorConfirmPassword, isValid);
    return isValid;
}


/**
 * validates the checkbox input.
 * 
 * @param {HTMLInputElement} checkboxInput - the checkbox input element.
 * @returns {boolean} true if checkbox is checked, false otherwise.
 */
function validateCheckbox(checkboxInput) {
    const checkboxContainer = document.querySelector('.signup-checkbox');
    const isValid = checkboxInput.checked;

    if (!isValid) {
        checkboxInput.classList.add('input-error');
        checkboxContainer.classList.add('blink');

        checkboxContainer.addEventListener('animationend', () => {
            checkboxContainer.classList.remove('blink');
        }, { once: true });
    } else {
        checkboxInput.classList.remove('input-error');
        checkboxContainer.classList.remove('blink');
    }

    return isValid;
}


/**
 * shows the success modal after successful registry and hides it after 2 seconds.
 * 
 * @returns {promise<void>} a promise that resolves when the modal is hidden.
 */
function showSuccessModal() {
    return new Promise((resolve) => {
        const modal = document.getElementById('successful-signup-modal');
        modal.classList.remove('hidden');
        modal.classList.add('show');

        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('show');
            toggleAuth(false);
            resolve();
        }, 2000);
    });
}


/**
 * shows the modal for failed signup attempts and hides it after 2 seconds.
 * 
 * @returns {Promise<void>} a promise that resolves when the modal is hidden.
 */
function showFailedSignupModal() {
    return new Promise((resolve) => {
        const modal = document.getElementById('failed-signup-modal');
        modal.classList.remove('hidden');
        modal.classList.add('show');

        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('show');
            resolve();
        }, 2000);
    });
}


/**
 * checks if any signup input field is empty.
 * 
 * @param {HTMLElement[]} signupInputs - an array of signup input elements.
 * @returns {boolean} - returns true if any input field is empty, false otherwise.
 */
function areSignupFieldsEmpty(signupInputs) {
    for (let i = 0; i < signupInputs.length; i++) {
        const input = signupInputs[i];

        if (!input.value.trim()) {
            return true;
        }
    }
    return false;
}


/**
 * updates the state of the signup button based on input fields.
 * 
 * @param {htmlElement} signupbutton - the signup button element.
 * @param {htmlElement[]} signupinputs - an array of signup input elements.
 */
function updateSignupBtnState(signupButton, signupInputs) {
    const isAnyFieldEmpty = areSignupFieldsEmpty(signupInputs);
    signupButton.disabled = isAnyFieldEmpty;
    signupButton.classList.toggle('disabled', isAnyFieldEmpty);
}


/**
 * retrieves signup input elements from the dom based on provided ids.
 * 
 * @param {string[]} inputids - an array of input element ids.
 * @returns {htmlElement[]} - an array of corresponding input elements.
 */
function getSignupInputs(inputIds) {
    const inputs = [];
    inputIds.forEach(id => {
        const inputElement = document.getElementById(id);
        if (inputElement) {
            inputs.push(inputElement);
        }
    });
    return inputs;
}


/**
 * initializes event listeners and updates the signup button state when the dom is fully loaded.
 * 
 * @returns {void}
 */
document.addEventListener('DOMContentLoaded', () => {
    const signupButton = document.getElementById('signup-btn');
    const signupInputIds = ['signup-name', 'signup-email', 'signup-password', 'signup-confirm-password'];
    const signupInputs = getSignupInputs(signupInputIds);

    signupInputs.forEach(input => {
        input.addEventListener('input', () => {
            updateSignupBtnState(signupButton, signupInputs);
        });
    });

    updateSignupBtnState(signupButton, signupInputs);
});