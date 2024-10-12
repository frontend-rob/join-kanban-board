/**
 * toggles the visibility of icons based on the input state.
 * @param {HTMLInputElement} passwordInput - the password input element.
 * @param {HTMLElement} lockIcon - the lock icon element.
 * @param {HTMLElement} eyeSlashIcon - the eye-slash icon element.
 * @param {HTMLElement} eyeIcon - the eye icon element.
 */
function toggleIcons(passwordInput, lockIcon, eyeSlashIcon, eyeIcon) {
    const isEmpty = passwordInput.value === '';
    lockIcon.classList.toggle('hidden', !isEmpty);
    eyeSlashIcon.classList.toggle('hidden', isEmpty);
    eyeIcon.classList.add('hidden');
}


document.addEventListener("DOMContentLoaded", function () {
    const passwordInput = document.getElementById('login-password');
    const lockIcon = document.querySelector('.lock-icon');
    const eyeSlashIcon = document.querySelector('.eye-slash-icon');
    const eyeIcon = document.querySelector('.eye-icon');

    toggleIcons(passwordInput, lockIcon, eyeSlashIcon, eyeIcon);
    passwordInput.addEventListener('input', () => toggleIcons(passwordInput, lockIcon, eyeSlashIcon, eyeIcon));
});


/**
 * toggles the password visibility based on the given flag.
 * @param {boolean} isVisible - whether to show or hide the password.
 */
function togglePasswordVisibility(isVisible) {
    const passwordInput = document.getElementById('login-password');
    const eyeSlashIcon = document.querySelector('.eye-slash-icon');
    const eyeIcon = document.querySelector('.eye-icon');

    passwordInput.type = isVisible ? 'text' : 'password';
    eyeSlashIcon.classList.toggle('hidden', isVisible);
    eyeIcon.classList.toggle('hidden', !isVisible);
}


/**
 * shows the password by calling the togglePasswordVisibility function with true.
 */
function showPassword() {
    togglePasswordVisibility(true);
}


/**
 * hides the password by calling the togglePasswordVisibility function with false.
 */
function hidePassword() {
    togglePasswordVisibility(false);
}


/**
 * toggles the visibility of the login and sign-up boxes.
 * 
 * @param {boolean} isSignUp - if true, shows the sign-up box; if false, shows the login box.
 * @returns {void}
 */
function toggleAuth(isSignUp) {
    const logInBox = document.getElementById('login-wrapper');
    const signUpBox = document.getElementById('signup-wrapper');
    const signUpCall = document.getElementById('call-to-signup');

    toggleVisibility(logInBox, !isSignUp);
    toggleVisibility(signUpBox, isSignUp);
    toggleVisibility(signUpCall, !isSignUp);
}


/**
 * toggles the 'hidden' and 'show' classes on a given element based on the provided flag.
 * 
 * @param {HTMLElement} element - the element whose visibility will be toggled.
 * @param {boolean} shouldShow - if true, shows the element; if false, hides it.
 * @returns {void}
 */
function toggleVisibility(element, shouldShow) {
    if (shouldShow) {
        element.classList.remove('hidden');
        element.classList.add('show');
    } else {
        element.classList.add('hidden');
        element.classList.remove('show');
    }
}


/**
 * processes the login of a user.
 * @param {Event} event - the event triggered when the form is submitted.
 */
function login(event) {
    event.preventDefault();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    // perform validation
    if (validateLoginInputs(emailInput, passwordInput)) {
        // attempt to find the user
        const user = findUser(emailInput.value, passwordInput.value);

        if (user) {
            handleSuccessfulLogin(user, emailInput, passwordInput);
        } else {
            handleFailedLogin(emailInput, passwordInput);
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
    const isEmailValid = validateEmail(emailInput);
    const isPasswordValid = validatePassword(passwordInput);
    return isEmailValid && isPasswordValid;
}


/**
 * finds a user by email and password in the users array.
 * @param {string} email - the user's email.
 * @param {string} password - the user's password.
 * @returns {Object|null} - returns the user object if found, otherwise null.
 */
function findUser(email, password) {
    return users.find(user => user.email === email && user.password === password) || null;
}


/**
 * handles actions when login is successful.
 * @param {Object} user - the logged-in user object.
 * @param {HTMLInputElement} emailInput - the email input field.
 * @param {HTMLInputElement} passwordInput - the password input field.
 */
function handleSuccessfulLogin(user, emailInput, passwordInput) {
    alert(`Welcome back, ${user.user}!`);
    clearLoginInputs(emailInput, passwordInput);
    redirectToDashboard();
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
 * handles actions when login fails.
 * @param {HTMLInputElement} emailInput - the input field for the email.
 * @param {HTMLInputElement} passwordInput - the input field for the password.
 */
function handleFailedLogin(emailInput, passwordInput) {
    showFailedLoginModal(emailInput, passwordInput);
}


/**
 * validates email input in the login form.
 * adds error message if the email is invalid.
 * @param {HTMLInputElement} emailInput - the email input element.
 * @returns {boolean} true if email is valid, false otherwise.
 */
function validateEmail(emailInput) {
    const errorEmail = document.getElementById('error-login-email');
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
 * validates the password input in the login form.
 * adds error message if the password is too short.
 * @param {HTMLInputElement} passwordInput - the password input element.
 * @returns {boolean} true if password is valid, false otherwise.
 */
function validatePassword(passwordInput) {
    const errorPassword = document.getElementById('error-login-password');

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
 * displays the modal for failed login attempts and hides it after 2 seconds.
 * @param {HTMLInputElement} emailInput - the input field for the email.
 * @param {HTMLInputElement} passwordInput - the input field for the password.
 */
function showFailedLoginModal(emailInput, passwordInput) {
    const modal = document.getElementById('failed-login-modal');
    modal.classList.remove('hidden');
    modal.classList.add('show');

    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('show');
        clearLoginInputs(emailInput, passwordInput);
    }, 2000);
}
