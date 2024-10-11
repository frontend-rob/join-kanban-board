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
