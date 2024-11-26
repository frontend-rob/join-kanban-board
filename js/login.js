/**
 * processes the login of a user.
 * 
 * @async
 * @function
 * @param {Event} event - the event triggered when the form is submitted.
 * @param {boolean} isGuest - flag indicating if the login is for a guest user.
 * @returns {Promise<void>} a promise that resolves when the login process is complete.
 */
async function login(event, isGuest = false) {
    event.preventDefault();

    if (isGuest) {
        await guestLogin();
        return;
    }

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    if (validateLoginInputs(emailInput, passwordInput)) {
        const user = await findUserInDatabase(emailInput.value, passwordInput.value);

        if (user) {
            handleSuccessfulLogin(user, emailInput, passwordInput);
        } else {
            await handleFailedLogin(emailInput, passwordInput);
        }
    }
}


/**
 * validates email and password inputs.
 * 
 * @function
 * @param {HTMLInputElement} emailInput - the email input field.
 * @param {HTMLInputElement} passwordInput - the password input field.
 * @returns {boolean} returns true if both inputs are valid, false otherwise.
 */
function validateLoginInputs(emailInput, passwordInput) {
    const isEmailValid = validateLoginEmail(emailInput);
    const isPasswordValid = validateLoginPassword(passwordInput);
    return isEmailValid && isPasswordValid;
}


/**
 * finds a user by email and password in the firebase realtime database using a rest api call.
 * 
 * @async
 * @function
 * @param {string} email - the user's email.
 * @param {string} password - the user's password.
 * @returns {Promise<Object|null>} - returns the user object if found, otherwise null.
 */
async function findUserInDatabase(email, password) {
    try {
        const response = await fetch(`${DB_URL}/users.json`);
        const users = await response.json();

        if (users) {
            for (const key in users) {
                const user = users[key];
                if (user.email === email && user.password === password) {
                    return user;
                }
            }
        }
        return null;
    } catch (error) {
        throw new Error(`Error fetching data from Firebase: ${error.message}`);
    }
}


/**
 * handles actions when login is successful.
 * 
 * @function
 * @param {Object} user - the logged-in user object.
 * @param {HTMLInputElement} emailInput - the email input field.
 * @param {HTMLInputElement} passwordInput - the password input field.
 * @returns {void}
 */
function handleSuccessfulLogin(user, emailInput, passwordInput) {
    clearLoginInputs(emailInput, passwordInput);
    redirectToDashboard();
    updateUserData(user);
}


/**
 * clears the email and password input fields.
 * 
 * @function
 * @param {HTMLInputElement} emailInput - the email input field.
 * @param {HTMLInputElement} passwordInput - the password input field.
 * @returns {void}
 */
function clearLoginInputs(emailInput, passwordInput) {
    emailInput.value = '';
    passwordInput.value = '';
}


/**
 * redirects the user to the dashboard or another page after login.
 * 
 * @function
 * @returns {void}
 */
function redirectToDashboard() {
    window.location.href = './pages/summary.html';
}


/**
 * handles actions when login fails by showing a modal instead of an alert.
 * 
 * @async
 * @function
 * @param {HTMLInputElement} emailInput - the input field for the email.
 * @param {HTMLInputElement} passwordInput - the input field for the password.
 */
async function handleFailedLogin(emailInput, passwordInput) {
    passwordInput.value = '';
    passwordInput.classList.add('input-error');
    emailInput.classList.add('input-error');
    const errorPassword = document.getElementById('error-login-password');
    errorPassword.classList.add('show');
    errorPassword.textContent = '*Invalid email or password - please try again.';
}


/**
 * logs in the user as a guest.
 * 
 * @function
 * @returns {void}
 */
async function guestLogin() {
    try {
        const guestUser = await fetchGuestUser();
        if (guestUser) {
            handleGuestLogin(guestUser);
        } else {
            throw new Error('Guest user not found!');
        }
    } catch (error) {
        throw new Error(`Error fetching guest user: ${error.message}`);
    }
}


/**
 * fetches the guest user data from the Firebase database.
 * 
 * @returns {Object|null} the guest user object, or null if not found.
 */
async function fetchGuestUser() {
    const usersUrl = `${DB_URL}/users.json`;
    const response = await fetch(usersUrl);
    const usersData = await response.json();
    return Object.values(usersData).find(user => user.name === 'Guest') || null;
}


/**
 * handles the successful guest login.
 * 
 * @function
 * @param {Object} user - the guest user object.
 * @returns {void}
 */
function handleGuestLogin(user) {
    redirectToDashboard();
    updateUserData(user);
}


/**
 * updates the error state of an input field and its corresponding error message.
 * 
 * @param {HTMLInputElement} input - the input element to update.
 * @param {HTMLElement} errorElement - the corresponding error message element.
 * @param {boolean} isValid - whether the input is valid or not.
 */
function setLoginInputErrorState(input, errorElement, isValid) {
    if (isValid) {
        input.classList.remove('input-error');
        errorElement.classList.remove('show');
    } else {
        input.classList.add('input-error');
        errorElement.classList.add('show');
    }
}


/**
 * validates email input in the login form.
 * 
 * @function
 * @param {HTMLInputElement} emailInput - the email input element.
 * @returns {boolean} true if email is valid, false otherwise.
 */
function validateLoginEmail(emailInput) {
    const errorEmail = document.getElementById('error-login-email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailPattern.test(emailInput.value.trim());

    setLoginInputErrorState(emailInput, errorEmail, isValid);
    return isValid;
}


/**
 * validates the password input in the login form.
 * 
 * @function
 * @param {HTMLInputElement} passwordInput - the password input element.
 * @returns {boolean} true if password is valid, false otherwise.
 */
function validateLoginPassword(passwordInput) {
    const errorPassword = document.getElementById('error-login-password');
    const isValid = passwordInput.value.length >= 6;

    setLoginInputErrorState(passwordInput, errorPassword, isValid);
    return isValid;
}


/**
 * generates initials from the full name.
 * 
 * @function
 * @param {string} fullName - the full name of the user.
 * @returns {string} - the initials of the user.
 */
function getUserInitials(fullName) {
    const names = fullName.trim().split(" ");
    let initials = "";

    if (names.length > 0) {
        initials += names[0].charAt(0).toUpperCase();
    }
    if (names.length > 1) {
        initials += names[names.length - 1].charAt(0).toUpperCase();
    }

    return initials;
}


/**
 * updates user data in localStorage, including a greeting message based on the current time,
 * the user's name, and their initials.
 * 
 * @function
 * @param {Object} user - the user object containing user details.
 * @param {string} user.name - the name of the user.
 * @returns {void}
 */
function updateUserData(user) {
    const currentHour = new Date().getHours();
    let greetingMessage;

    if (currentHour < 12) {
        greetingMessage = "Good morning,";
    } else if (currentHour < 18) {
        greetingMessage = "Good afternoon,";
    } else {
        greetingMessage = "Good evening,";
    }

    localStorage.setItem('greetingTime', greetingMessage);
    localStorage.setItem('userName', user.name);
    localStorage.setItem('userInitials', getUserInitials(user.name));
}