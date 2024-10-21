document.addEventListener('DOMContentLoaded', function () {
    const requiredInput = document.getElementById('title');
    if (requiredInput) {
        const errorMessage = requiredInput.parentElement.querySelector('.error-message');
        const requiredNote = requiredInput.parentElement.querySelector('.required-note');

        if (errorMessage && requiredNote) {
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
    }

    function initializeAddTaskPage() {
        const dueDateInput = document.getElementById('due-date');
        if (dueDateInput) {
            dueDateInput.addEventListener('click', setTodayDate);
        }

        function setTodayDate() {
            const today = new Date();
            const formattedDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
            dueDateInput.value = formattedDate;
        }
    }

    initializeAddTaskPage();

    const buttons = document.querySelectorAll('.prio-button');
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

    const submitButton = document.querySelector('.create-button');
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
});
