/**
 * processes the login of a user.
 * @param {Event} event - the event triggered when the form is submitted.
 */
async function login(event) {
    event.preventDefault();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    // perform validation
    if (validateLoginInputs(emailInput, passwordInput)) {
        // attempt to find the user in Firebase
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
 * @param {HTMLInputElement} emailInput - the email input field.
 * @param {HTMLInputElement} passwordInput - the password input field.
 * @returns {boolean} - returns true if both inputs are valid, false otherwise.
 */
function validateLoginInputs(emailInput, passwordInput) {
    const isEmailValid = validateLoginEmail(emailInput);
    const isPasswordValid = validateLoginPassword(passwordInput);
    return isEmailValid && isPasswordValid;
}


/**
 * finds a user by email and password in the Firebase Realtime Database using a REST API call.
 * @param {string} email - the user's email.
 * @param {string} password - the user's password.
 * @returns {Object|null} - returns the user object if found, otherwise null.
 */
async function findUserInDatabase(email, password) {
    try {
        // fetch data from the Firebase Realtime Database
        const response = await fetch(`${DB_URL}/users.json`);
        const users = await response.json();  // converts response to JSON

        if (users) {
            // iterate over the users and find the matching email and password
            for (const key in users) {
                const user = users[key];
                if (user.email === email && user.password === password) {
                    return user;  // return the matched user
                }
            }
        }
        return null;  // return null if no user matches
    } catch (error) {
        console.error("Error fetching data from Firebase:", error);
        return null;  // return null in case of an error
    }
}


/**
 * handles actions when login is successful.
 * @param {Object} user - the logged-in user object.
 * @param {HTMLInputElement} emailInput - the email input field.
 * @param {HTMLInputElement} passwordInput - the password input field.
 */
function handleSuccessfulLogin(user, emailInput, passwordInput) {
    clearLoginInputs(emailInput, passwordInput);
    redirectToDashboard();
    updateUserData(user);
}


/**
 * clears the email and password input fields.
 * @param {HTMLInputElement} emailInput - the email input field.
 * @param {HTMLInputElement} passwordInput - the password input field.
 */
function clearLoginInputs(emailInput, passwordInput) {
    emailInput.value = '';
    passwordInput.value = '';
}


/**
 * redirects the user to the dashboard or another page after login.
 */
function redirectToDashboard() {
    window.location.href = './pages/summary.html';
}


/**
 * handles actions when login fails by showing a modal instead of an alert.
 * @param {HTMLInputElement} emailInput - the input field for the email.
 * @param {HTMLInputElement} passwordInput - the input field for the password.
 * @returns {Promise<void>} a promise that resolves after the modal is hidden and inputs are cleared.
 */
async function handleFailedLogin(emailInput, passwordInput) {
    await showFailedLoginModal(emailInput, passwordInput);
    clearLoginInputs(emailInput, passwordInput);
}


/**
 * logs in the user as a guest.
 */
function guestLogin() {
    const guestUser = {
        name: "Guest",
        email: "guestuser@example.com",
        password: "join123"
    };

    handleGuestLogin(guestUser);
}


/**
 * handles the successful guest login.
 * @param {Object} user - the guest user object.
 */
function handleGuestLogin(user) {
    redirectToDashboard();
    updateUserData(user);
}


/**
 * validates email input in the login form.
 * @param {HTMLInputElement} emailInput - the email input element.
 * @returns {boolean} true if email is valid, false otherwise.
 */
function validateLoginEmail(emailInput) {
    const errorEmail = document.getElementById('error-login-email');
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
 * validates the password input in the login form.
 * @param {HTMLInputElement} passwordInput - the password input element.
 * @returns {boolean} true if password is valid, false otherwise.
 */
function validateLoginPassword(passwordInput) {
    const errorPassword = document.getElementById('error-login-password');

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
 * displays the modal for failed login attempts and hides it after 2 seconds.
 * @param {HTMLInputElement} emailInput - the input field for the email.
 * @param {HTMLInputElement} passwordInput - the input field for the password.
 */
function showFailedLoginModal(emailInput, passwordInput) {
    return new Promise((resolve) => {
        const modal = document.getElementById('failed-login-modal');
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
 * generates initials from the full name.
 * @param {string} fullName - the full name of the user.
 * @returns {string} - the initials of the user.
 */
function getUserInitials(fullName) {
    const names = fullName.trim().split(" ");
    let initials = "";

    if (names.length > 0) {
        initials += names[0].charAt(0).toUpperCase(); // first letter of the first name
    }
    if (names.length > 1) {
        initials += names[names.length - 1].charAt(0).toUpperCase(); // first letter of the last name
    }

    return initials;
}


/**
 * updates user data in localStorage, including a greeting message based on the current time,
 * the user's name, and their initials.
 * 
 * @param {Object} user - the user object containing user details.
 * @param {string} user.name - the name of the user.
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