/**
 * adds a new user if form validation passes and the user does not already exist in firebase.
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
            await registerNewUser(inputs);
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
    if (!response.ok) throw new Error(`http error! status: ${response.status}`);
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
 * registers a new user and creates the corresponding contact in firebase.
 *
 * @async
 * @param {Object} inputs - the form input elements containing user information.
 * @returns {Promise<void>} resolves when the user and contact are successfully added.
 */
async function registerNewUser(inputs) {
    const newUser = {
        name: inputs.name.value,
        email: inputs.email.value,
        password: inputs.password.value
    };

    try {
        await registerUserInFirebase(newUser);

        const contact = createContact(newUser);

        await addContactToFirebase(contact);

        saveUserToLocalStorage(newUser.name, newUser.email, contact.initials);
    } catch (error) {
        console.error('error adding user to firebase:', error);
    }
}

/**
 * registers a new user in the firebase realtime database.
 *
 * @async
 * @param {Object} user - the user object containing registration details.
 * @returns {Promise<string>} resolves with the user id after successful registration.
 * @throws {Error} if registration fails.
 */
async function registerUserInFirebase(user) {
    const response = await fetch(`${DB_URL}/users.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });

    if (!response.ok) {
        throw new Error('failed to register user in firebase.');
    }

    const data = await response.json();
    return data.name; // return the generated user ID
}

/**
 * creates a contact object from user data.
 *
 * @param {Object} user - the user object.
 * @returns {Object} the generated contact object.
 */
function createContact(user) {
    return {
        name: user.name,
        email: user.email,
        initials: createInitials(user.name),
        phone: '+49', // default phone number
        color: getRandomColor() // randomly generated color
    };
}

/**
 * creates initials from the user's full name (first and last name).
 *
 * @param {string} fullName - the full name of the user.
 * @returns {string} the generated initials.
 */
function createInitials(fullName) {
    return fullName.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
}

/**
 * adds the contact to the firebase contacts database.
 *
 * @async
 * @param {Object} contact - the contact object to be added.
 * @returns {Promise<void>} resolves when the contact is successfully added.
 */
async function addContactToFirebase(contact) {
    const response = await fetch(`${DB_URL}/contacts.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
    });

    if (!response.ok) {
        throw new Error('failed to add contact to firebase.');
    }
}

/**
 * saves user details to local storage.
 *
 * @param {string} name - the user's name.
 * @param {string} email - the user's email.
 * @param {string} initials - the user's initials.
 */
function saveUserToLocalStorage(name, email, initials) {
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userInitials', initials);
}

/**
 * generates a random color for the contact.
 *
 * @returns {string} a randomly chosen color.
 */
function getRandomColor() {
    const colors = [
        '#ff7900', '#9327ff', '#6e52ff', '#fc71ff', '#ffbb2a',
        '#20d7c1', '#462f8a', '#ff4647', '#00bee7'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
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