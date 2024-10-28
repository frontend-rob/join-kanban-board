/**
 * adds a new user if the form validation passes and the user doesn't already exist in Firebase.
 * @param {Event} event - the event object from the form submission.
 */
async function addUser(event) {
    event.preventDefault();
    const inputs = getFormInputs();
    const validations = validateInputs(inputs);

    // if all validations pass, check if the user already exists
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
 * @param {string} email - the email to check.
 * @returns {Promise<boolean>} - returns true if the user exists, false otherwise.
 */
async function checkIfUserExists(email) {
    try {
        const users = await fetchUsersFromFirebase();
        return userExists(users, email);
    } catch (error) {
        console.error('Error checking user in firebase:', error);
        return false;
    }
}


/**
 * fetches users from firebase.
 * @returns {Promise<Object>} - returns the users object from firebase.
 */
async function fetchUsersFromFirebase() {
    const response = await fetch(`${DB_URL}/users.json`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
}


/**
 * checks if a user with the specified email exists in the users object.
 * @param {Object} users - the users object fetched from firebase.
 * @param {string} email - the email to check.
 * @returns {boolean} - returns true if the user exists, false otherwise.
 */
function userExists(users, email) {
    for (const key in users) {
        if (users[key].email === email) {
            return true; // user already exists
        }
    }
    return false; // no user with this email found
}


/**
 * adds the user to Firebase Realtime Database.
 * @param {Object} inputs - the form input elements.
 * @returns {Promise<void>} - returns a promise once the user is added.
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
 * registers a user in Firebase Realtime Database.
 * @param {Object} user - the user object to register.
 * @returns {Promise<void>} - returns a promise once the user is registered.
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
        errorName.classList.add('show');
        return false; // invalid name
    } else {
        nameInput.classList.remove('input-error');
        errorName.classList.remove('show');
        return true; // valid name
    }
}


/**
 * validates the signup email.
 * @param {HTMLInputElement} emailInput - the email input element.
 * @returns {boolean} true if email is valid, false otherwise.
 */
function validateSignupEmail(emailInput) {
    // add your email validation logic here
    return emailInput.value.includes('@');
}


/**
 * validates the signup password.
 * @param {HTMLInputElement} passwordInput - the password input element.
 * @returns {boolean} true if password is valid, false otherwise.
 */
function validateSignupPassword(passwordInput) {
    // add password validation logic here (e.g., length, special chars)
    return passwordInput.value.length >= 6;
}


/**
 * validates the confirm password field.
 * @param {HTMLInputElement} passwordInput - the password input element.
 * @param {HTMLInputElement} confirmPasswordInput - the confirm password input element.
 * @returns {boolean} true if passwords match, false otherwise.
 */
function validateConfirmPassword(passwordInput, confirmPasswordInput) {
    return passwordInput.value === confirmPasswordInput.value;
}


/**
 * validates the checkbox input.
 * @param {HTMLInputElement} checkbox - the checkbox input element.
 * @returns {boolean} true if checkbox is checked, false otherwise.
 */
function validateCheckbox(checkbox) {
    return checkbox.checked;
}


/**
 * validates the user's email input in the signup form.
 * @param {HTMLInputElement} emailInput - the email input element.
 * @returns {boolean} true if the email is valid, false otherwise.
 */
function validateSignupEmail(emailInput) {
    const errorEmail = document.getElementById('error-signup-email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(emailInput.value.trim())) {
        emailInput.classList.add('input-error');
        errorEmail.classList.add('show');
        return false; // invalid email
    } else {
        emailInput.classList.remove('input-error');
        errorEmail.classList.remove('show');
        return true; // valid email
    }
}


/**
 * validates the user's password input in the signup form.
 * @param {HTMLInputElement} passwordInput - the password input element.
 * @returns {boolean} true if the password is valid, false otherwise.
 */
function validateSignupPassword(passwordInput) {
    const errorPassword = document.getElementById('error-signup-password');

    if (passwordInput.value.length < 6) {
        passwordInput.classList.add('input-error');
        errorPassword.classList.add('show');
        return false; // invalid password
    } else {
        passwordInput.classList.remove('input-error');
        errorPassword.classList.remove('show');
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
        errorConfirmPassword.classList.add('show');
        return false; // invalid confirmation password
    } else {
        confirmPasswordInput.classList.remove('input-error');
        errorConfirmPassword.classList.remove('show');
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
 * displays the modal for failed signup attempts and hides it after 2 seconds.
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
 * @param {HTMLElement} signupButton - the signup button element.
 * @param {HTMLElement[]} signupInputs - an array of signup input elements.
 */
function updateSignupBtnState(signupButton, signupInputs) {
    const isAnyFieldEmpty = areSignupFieldsEmpty(signupInputs);
    signupButton.disabled = isAnyFieldEmpty;
    signupButton.classList.toggle('disabled', isAnyFieldEmpty);
}

/**
 * retrieves signup input elements from the DOM based on provided IDs.
 * @param {string[]} inputIds - an array of input element IDs.
 * @returns {HTMLElement[]} - an array of corresponding input elements.
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


// event listener for DOMContentLoaded
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