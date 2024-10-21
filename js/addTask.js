document.addEventListener('DOMContentLoaded', function () {
    const requiredInput = document.getElementById('title');
    const errorMessage = document.querySelector('.error-message');
    const requiredNote = document.querySelector('.required-note');
    const dueDateInput = document.getElementById('due-date');
    const buttons = document.querySelectorAll('.prio-button');
    const submitButton = document.querySelector('.create-button');
    const selectContactIcon = document.getElementById('select-contact-icon');
    const contactList = document.getElementById('contact-list');

    if (requiredInput) {
        requiredInput.addEventListener('focus', function () {
            errorMessage.style.display = 'none';
            requiredNote.style.display = 'none';
            requiredInput.classList.remove('error');
        });

        requiredInput.addEventListener('blur', function () {
            if (requiredInput.value.trim() === '') {
                errorMessage.style.display = 'block';
                requiredNote.style.display = 'block';
                requiredInput.classList.add('error');
            } else {
                errorMessage.style.display = 'none';
                requiredNote.style.display = 'none';
                requiredInput.classList.remove('error');
            }
        });
    }

    if (dueDateInput) {
        dueDateInput.addEventListener('click', setTodayDate);
    }

    function setTodayDate() {
        const today = new Date();
        const formattedDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
        dueDateInput.value = formattedDate;
    }

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            buttons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.backgroundColor = '';
                btn.querySelector('svg').style.fill = '';
                btn.querySelector('svg').style.stroke = '';
                btn.style.color = '';
            });

            button.classList.add('active');
            if (button.classList.contains('urgent')) {
                button.style.backgroundColor = 'var(--priority-urgent)';
                button.querySelector('svg').style.fill = 'var(--white-content)';
                button.querySelector('svg').style.stroke = 'var(--white-content)';
                button.style.color = 'var(--white-content)';
            } else if (button.classList.contains('medium')) {
                button.style.backgroundColor = 'var(--priority-medium)';
                button.querySelector('svg').style.fill = 'var(--white-content)';
                button.querySelector('svg').style.stroke = 'var(--white-content)';
                button.style.color = 'var(--white-content)';
            } else if (button.classList.contains('low')) {
                button.style.backgroundColor = 'var(--priority-low)';
                button.querySelector('svg').style.fill = 'var(--white-content)';
                button.querySelector('svg').style.stroke = 'var(--white-content)';
                button.style.color = 'var(--white-content)';
            }
        });
    });

    if (submitButton) {
        submitButton.addEventListener('click', function (event) {
            const requiredInputs = document.querySelectorAll('.required-input');
            let isValid = true;

            requiredInputs.forEach(input => {
                const errorMessage = input.parentElement.querySelector('.error-message');
                if (input.value.trim() === '') {
                    errorMessage.style.display = 'block';
                    input.classList.add('error');
                    isValid = false;
                } else {
                    errorMessage.style.display = 'none';
                    input.classList.remove('error');
                }
            });

            if (!isValid) {
                event.preventDefault();
            }
        });
    }

    if (selectContactIcon && contactList) {
        selectContactIcon.addEventListener('click', function () {
            if (contactList.style.display === 'none' || contactList.style.display === '') {
                generateContactList();
                contactList.style.display = 'block';
            } else {
                contactList.style.display = 'none';
            }
        });
    }

    function generateContactList() {
        const letterGroups = document.querySelectorAll('.letter-group');
        contactList.innerHTML = ''; // Alte Kontakte löschen

        letterGroups.forEach(group => {
            const groupId = group.getAttribute('id');
            const contacts = group.querySelectorAll('.contact');
            contacts.forEach(contact => {
                const contactItem = contact.cloneNode(true);
                contactList.appendChild(contactItem);
            });
        });
    }

    document.addEventListener('click', function (event) {
        const inputWrapper = document.querySelector('.input-wrapper');
        if (contactList && inputWrapper && !inputWrapper.contains(event.target) && !contactList.contains(event.target)) {
            contactList.style.display = 'none';
        }
    });
});
