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