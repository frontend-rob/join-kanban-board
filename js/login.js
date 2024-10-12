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



let users = [
    {
        'user': 'hans peter',
        'email': 'hans@test.de',
        'password': 'test123'
    }
];


// function addUser() {
//     let user = document.getElementById('signup-name');
//     let email = document.getElementById('signup-email');
//     let password = document.getElementById('signup-password');

//     users.push(
//         {
//             user: user.value,
//             email: email.value,
//             password: password.value
//         }
//     );
// }

function addUser(event) {
    // Prevent form submission if validation fails
    event.preventDefault();

    // Get form input elements
    const nameInput = document.getElementById('signup-name');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const confirmPasswordInput = document.getElementById('signup-confirm-password');
    const checkboxInput = document.getElementById('signup-checkbox');

    // Perform validation
    const isNameValid = validateName(nameInput);
    const isEmailValid = validateEmail(emailInput);
    const isPasswordValid = validatePassword(passwordInput);
    const isConfirmPasswordValid = validateConfirmPassword(passwordInput, confirmPasswordInput);
    const isCheckboxValid = validateCheckbox(checkboxInput);

    // If all validations pass, add the user
    if (isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid && isCheckboxValid) {
        // Assuming 'users' is defined elsewhere
        users.push({
            user: nameInput.value,
            email: emailInput.value,
            password: passwordInput.value
        });

        // Clear form after successful submission (optional)
        nameInput.value = '';
        emailInput.value = '';
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        checkboxInput.checked = false; // Reset checkbox

        // Optionally: redirect or show a success message here
        showSuccessModal();
    }
}

// Validation Functions (same as before)
function validateName(nameInput) {
    const errorName = document.getElementById('error-signup-name');
    const fullName = nameInput.value.trim();

    if (fullName.split(' ').length < 2) {
        nameInput.classList.add('input-error');
        errorName.classList.remove('hidden');
        return false;
    } else {
        nameInput.classList.remove('input-error');
        errorName.classList.add('hidden');
        return true;
    }
}

function validateEmail(emailInput) {
    const errorEmail = document.getElementById('error-signup-email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex pattern

    if (!emailPattern.test(emailInput.value.trim())) {
        emailInput.classList.add('input-error');
        errorEmail.classList.remove('hidden');
        return false;
    } else {
        emailInput.classList.remove('input-error');
        errorEmail.classList.add('hidden');
        return true;
    }
}

function validatePassword(passwordInput) {
    const errorPassword = document.getElementById('error-signup-password');

    if (passwordInput.value.length < 6) {
        passwordInput.classList.add('input-error');
        errorPassword.classList.remove('hidden');
        return false;
    } else {
        passwordInput.classList.remove('input-error');
        errorPassword.classList.add('hidden');
        return true;
    }
}

function validateConfirmPassword(passwordInput, confirmPasswordInput) {
    const errorConfirmPassword = document.getElementById('error-signup-confirm-password');

    if (confirmPasswordInput.value !== passwordInput.value) {
        confirmPasswordInput.classList.add('input-error');
        errorConfirmPassword.classList.remove('hidden');
        return false;
    } else {
        confirmPasswordInput.classList.remove('input-error');
        errorConfirmPassword.classList.add('hidden');
        return true;
    }
}

function validateCheckbox(checkboxInput) {
    const checkboxContainer = document.querySelector('.signup-checkbox');

    if (!checkboxInput.checked) {
        checkboxInput.classList.add('input-error');
        checkboxContainer.classList.add('blink');

        checkboxContainer.addEventListener('animationend', () => {
            checkboxContainer.classList.remove('blink');
        }, { once: true });

        return false;
    } else {
        checkboxInput.classList.remove('input-error');
        checkboxContainer.classList.remove('blink');
        return true;
    }
}

// Function to show the success modal
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.remove('hidden');
    modal.classList.add('show');

    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('show');
        toggleAuth(false);
    }, 2000);
}
