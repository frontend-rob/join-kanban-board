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
 * @throws {Error} if the fetch request fails or if the response is not ok.
 */
async function checkIfUserExists(email) {
    try {
        const users = await fetchUsersFromFirebase();
        return userExists(users, email);
    } catch (error) {
        throw new Error(`Error checking user in Firebase: ${error.message}`);
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

    if (!response.ok) {
        throw new Error(`Failed to fetch users. HTTP status: ${response.status}`);
    }

    return response.json();
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
        throw new Error(`Error adding user to Firebase: ${error.message}`);
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
    return data.name;
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
        phone: '+49',
        color: getRandomColor()
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