/**
 * initializes the start content by rendering main page elements and
 * setting up navigation and orientation restrictions on mobile devices.
 * 
 * @async
 * @returns {Promise<void>} - a promise that resolves once the start content is fully initialized.
 */
async function initAddTask() {
    await renderAddTaskContent();
    await setUserDataFromLocalStorage();
    initializeNavigation();
    preventLandscapeOnMobileDevices();
}

/**
 * renders the primary content for the page by loading templates into specific page components.
 * 
 * @async
 * @returns {Promise<void>} - a promise that resolves once the content has been successfully rendered.
 */
async function renderAddTaskContent() {
    const addTaskComponents = getAddTaskComponents();
    loadAddTaskTemplates(addTaskComponents);
}


/**
 * retrieves key components for the page by accessing relevant elements in the DOM.
 * 
 * @returns {Object} - an object containing references to essential page components.
 * @property {HTMLElement} header - the element for injecting header content.
 * @property {HTMLElement} navigation - the element for injecting navigation content.
 * @property {HTMLElement} landscapeModal - the element for injecting landscape modal content.
 */
function getAddTaskComponents() {
    return {
        header: document.getElementById('header-content'),
        navigation: document.getElementById('navigation-content'),
        landscapeModal: document.getElementById('landscape-wrapper')
    };
}


/**
 * loads HTML templates into specified elements on the page.
 * 
 * @param {Object} components - an object containing references to page elements.
 * @param {HTMLElement} components.header - the element for injecting header content.
 * @param {HTMLElement} components.navigation - the element for injecting navigation content.
 * @param {HTMLElement} components.landscapeModal - the element for injecting landscape modal content.
 */
function loadAddTaskTemplates({ header, navigation, landscapeModal }) {
    header.innerHTML = getHeaderContent();
    navigation.innerHTML = getNavigationContent();
    landscapeModal.innerHTML = getLandscapeModalContent();
}



// ! toogles btns and its colors
let taskPriority = ''; // Variable für die Priorität

// Funktion, die die Priorität setzt
function setPriority(button) {
    // Alle Buttons zurücksetzen
    document.querySelectorAll('.prio-buttons .btn').forEach(btn => {
        btn.classList.remove('clicked');
    });

    // Den geklickten Button als ausgewählt markieren
    button.classList.add('clicked');

    // Setze die Priorität basierend auf dem Button
    if (button.id === 'high-priority-button') {
        taskPriority = 'high';
    } else if (button.id === 'mid-priority-button') {
        taskPriority = 'mid';
    } else if (button.id === 'low-priority-button') {
        taskPriority = 'low';
    }
}


// ! date picker
/**
 * Initializes the Flatpickr date picker.
 * 
 * @param {string} selector - The ID of the input field to apply Flatpickr.
 */
function initializeDatePicker(selector) {
    flatpickr(selector, {
        minDate: "today",        // disable past dates
        dateFormat: "Y-m-d",     // format for hidden input
        altInput: false,         // do not show an alternative input
        altFormat: "Y-m-d"      // format for visible input
    });
}

initializeDatePicker("#due-date");


// ! category dropdown
/**
 * toggles dropdown visibility and rotates icon when input is clicked
 */
function toggleCategoryDropdown() {
    const dropdown = document.getElementById('category-dropdown');
    const dropdownIcon = document.getElementById('dropdown-icon');

    dropdown.classList.toggle('hidden');
    dropdown.classList.toggle('show');
    dropdownIcon.classList.toggle('rotated');
}

/**
 * selects a category and closes the dropdown
 * 
 * @param {Event} event - the click event
 */
function selectCategory(event) {
    const selectedCategory = event.target.getAttribute('data-category');
    const categoryInput = document.getElementById('task-category');
    const errorElement = document.getElementById('error-task-category');

    categoryInput.value = selectedCategory;

    if (selectedCategory.trim() !== "") {
        categoryInput.classList.remove('input-error');
        errorElement.classList.remove('show');
    }

    closeCategoryDropdown();
}


/**
 * closes the dropdown and resets icon rotation
 */
function closeCategoryDropdown() {
    const dropdown = document.getElementById('category-dropdown');
    const dropdownIcon = document.getElementById('dropdown-icon');

    dropdown.classList.add('hidden');
    dropdown.classList.remove('show');
    dropdownIcon.classList.remove('rotated');
}

/**
 * closes the dropdown if a click occurs outside
 * 
 * @param {Event} event - the click event
 */
document.addEventListener('click', function (event) {
    const categoryInput = document.getElementById('task-category');
    const dropdown = document.getElementById('category-dropdown');

    if (!categoryInput.contains(event.target) && !dropdown.contains(event.target)) {
        closeCategoryDropdown();
    }
});


// ! contact dropdown
/**
 * Funktion zum Umschalten der Dropdown-Sichtbarkeit
 */
function toggleContactDropdown() {
    const contactDropdown = document.getElementById('contact-dropdown');
    const contactDropdownIcon = document.getElementById('contact-dropdown-icon');

    contactDropdown.classList.toggle('hidden');
    contactDropdown.classList.toggle('show');
    contactDropdownIcon.classList.toggle('rotated');

    // Wenn das Dropdown geöffnet wird, rufen wir renderContacts auf
    if (contactDropdown.classList.contains('show')) {
        renderContacts(); // Kontakte rendern und den Zustand der Checkboxen wiederherstellen
    }
}

/**
 * closes the contact dropdown and resets icon rotation
 */
function closeContactDropdown() {
    const contactDropdown = document.getElementById('contact-dropdown');
    const contactDropdownIcon = document.getElementById('contact-dropdown-icon');

    contactDropdown.classList.add('hidden');
    contactDropdown.classList.remove('show');
    contactDropdownIcon.classList.remove('rotated');
}


/**
 * closes the contact dropdown if a click occurs outside
 */
document.addEventListener('click', function (event) {
    const assignedInput = document.getElementById('assigned-to');
    const contactDropdown = document.getElementById('contact-dropdown');

    if (!assignedInput.contains(event.target) && !contactDropdown.contains(event.target)) {
        closeContactDropdown();
    }
});

let allContacts = []; // Array, das alle Kontakte speichert, wenn sie einmal abgerufen wurden

async function fetchContacts() {
    try {
        const response = await fetch(`${DB_URL}/contacts.json`);

        if (!response.ok) {
            throw new Error('Failed to fetch contacts from Firebase.');
        }

        const contactsObj = await response.json(); // Die Antwort ist ein Objekt, kein Array

        // Wandelt das Objekt in ein Array um
        const contacts = Object.entries(contactsObj).map(([contactId, contact]) => ({
            ...contact,
            id: contactId // Hier speichern wir die Firebase ID als 'id'
        }));

        allContacts = contacts; // Speichern der Kontakte im Array
        return contacts;
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return null;
    }
}


// Kontaktdatentemplate für das Dropdown
const contactTemplate = (contactId, color, initials, name) => `
    <div class="contact-item" data-id="${contactId}">
        <div class="contact-info">
            <div class="profil-icon" style="background-color: ${color};">
                ${initials}
            </div>
            <div class="contact-details">
                <p class="contact-name">${name}</p>
            </div>
        </div>
        <label class="contact-checkbox">
            <input type="checkbox" id="${contactId}"/>
        </label>
    </div>
`;

// Speichert den Zustand der Checkboxen in localStorage
function toggleCheckboxState(contactId, isChecked) {
    const checkboxStates = JSON.parse(localStorage.getItem('checkboxStates')) || {};
    checkboxStates[contactId] = isChecked;
    localStorage.setItem('checkboxStates', JSON.stringify(checkboxStates));
}

// Wiederherstellen des Zustands der Checkboxen aus localStorage
function updateCheckboxesState() {
    const checkboxes = document.querySelectorAll('.contact-checkbox input[type="checkbox"]');
    const checkboxStates = JSON.parse(localStorage.getItem('checkboxStates')) || {};
    checkboxes.forEach(checkbox => {
        const contactId = checkbox.closest('.contact-item').getAttribute('data-id');
        if (checkboxStates[contactId] !== undefined) {
            checkbox.checked = checkboxStates[contactId];
        }
    });
}

// Funktion, um das HTML für jedes Kontakt-Item zu erstellen
function createContactItemHTML(contactId, contact, isUserContact = false) {
    const contactItemHTML = contactTemplate(contactId, contact.color, contact.initials, contact.name);

    // Add an indicator to the user contact (e.g., a star or special style)
    if (isUserContact) {
        return `
            <div class="contact-item user-contact" data-id="${contactId}">
                <div class="contact-info">
                    <div class="profil-icon" style="background-color: ${contact.color};">
                        ${contact.initials}
                    </div>
                    <div class="contact-details">
                        <p class="contact-name">${contact.name} <span class="user-indicator">(You)</span></p>
                    </div>
                </div>
                <label class="contact-checkbox">
                    <input type="checkbox" id="${contactId}" />
                </label>
            </div>
        `;
    }

    return contactItemHTML;
}

function renderUserIndicator(contactId) {
    const contactItem = document.querySelector(`.contact-item[data-id="${contactId}"]`);
    if (contactItem) {
        const contactNameElement = contactItem.querySelector('.contact-name');
        contactNameElement.innerHTML += ' <span class="user-indicator">(You)</span>';
    }
}

// Fügt Profil-Icons zu den ausgewählten Kontakten hinzu
function addSelectedContactIcon(contactId, color, initials) {
    const existingIcon = document.querySelector(`#selected-contacts .selected-profile-icon[data-id="${contactId}"]`);
    if (!existingIcon) {
        // Hier setzen wir die richtige Firebase ID als data-id
        const selectedIcon = `<div class="selected-profile-icon" style="background-color: ${color};" data-id="${contactId}">
            ${initials}
        </div>`;
        document.getElementById('selected-contacts').innerHTML += selectedIcon;
    }
}

// Beispiel für das Hinzufügen eines Kontakts mit seiner Firebase ID
function addSelectedContacts(contactId) {
    // Holen des Kontakts aus Firebase-Daten
    const contact = allContacts.find(c => c.id === contactId);  // allContacts enthält die Kontakte mit der ID von Firebase

    if (contact) {
        // Rufe die Funktion auf, um das Profil-Icon hinzuzufügen
        addSelectedContactIcon(contactId, contact.color, contact.initials); // Verwende hier die echte Firebase-ID
    }
}

// Entfernt das Profil-Icon eines abgewählten Kontakts
function removeSelectedContactIcon(contactId) {
    const selectedIcons = document.querySelectorAll('.selected-profile-icon');
    selectedIcons.forEach(icon => {
        if (icon.getAttribute('data-id') === contactId) {
            icon.remove();
        }
    });
}

// Handhabt das Klicken auf eine Kontaktkarte und toggelt die Checkbox
function handleContactClick(contactItem) {
    const checkbox = contactItem.querySelector('input[type="checkbox"]');
    const contactId = contactItem.getAttribute('data-id');
    const isChecked = !checkbox.checked;
    checkbox.checked = isChecked;
    toggleCheckboxState(contactId, isChecked);

    const initials = contactItem.querySelector('.profil-icon').innerText;
    const color = contactItem.querySelector('.profil-icon').style.backgroundColor;
    if (checkbox.checked) {
        addSelectedContactIcon(contactId, color, initials);
    } else {
        removeSelectedContactIcon(contactId);
    }
}

// Kontakte aus Firebase holen und im Dropdown rendern
/**
 * Renders the contacts, ensuring the user contact (from localStorage) is first in the list.
 */
async function renderContacts() {
    const contactDropdown = document.getElementById('contact-dropdown');
    contactDropdown.classList.remove('hidden');
    contactDropdown.innerHTML = ''; // Clear the dropdown

    // Fetch contacts from Firebase
    const contacts = await fetchContacts();
    if (!contacts) {
        contactDropdown.innerHTML = '<p>Error loading contacts.</p>';
        return;
    }

    const userName = localStorage.getItem('userName');
    if (userName) {
        // Find the user contact and move it to the top
        const userContactIndex = contacts.findIndex(contact => contact.name === userName);
        if (userContactIndex !== -1) {
            const userContact = contacts.splice(userContactIndex, 1)[0];
            // Add a special indicator to the contact
            userContact.isUserContact = true; // Flag this contact as the user
            contacts.unshift(userContact); // Move the user contact to the top
        }
    }

    // Render the contacts, including the special indicator for the user contact
    const contactItemsHTML = contacts.map(contact =>
        createContactItemHTML(contact.id, contact, contact.isUserContact)
    ).join('');

    contactDropdown.innerHTML = contactItemsHTML;

    updateCheckboxesState(); // Restore checkbox states
    addContactClickListeners(); // Add event listeners for contact clicks
}

// Fügt Event-Listener für das Klicken auf Kontaktkarten hinzu
function addContactClickListeners() {
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(contactItem => {
        contactItem.addEventListener('click', () => handleContactClick(contactItem));
    });
}

// Umschaltet das Dropdown
function toggleContactDropdown() {
    const contactDropdown = document.getElementById('contact-dropdown');
    const contactDropdownIcon = document.getElementById('contact-dropdown-icon');
    contactDropdown.classList.toggle('hidden');
    contactDropdown.classList.toggle('show');
    contactDropdownIcon.classList.toggle('rotated');

    if (contactDropdown.classList.contains('show')) {
        renderContacts();
    }
}

function searchContacts() {
    const searchTerm = document.getElementById('assigned-to').value.toLowerCase();

    // Filtere Kontakte basierend auf dem Suchbegriff
    const filteredContacts = allContacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm)
    );

    // Dropdown mit den gefilterten Kontakten aktualisieren
    renderFilteredContacts(filteredContacts);
}

// Funktion, die das Dropdown mit den gefilterten Kontakten rendert
function renderFilteredContacts(contacts) {
    const contactDropdown = document.getElementById('contact-dropdown');
    contactDropdown.innerHTML = ''; // Clear previous items

    if (contacts.length === 0) {
        contactDropdown.innerHTML = '<p>No contacts found.</p>';
        return;
    }

    const contactItemsHTML = contacts.map(contact =>
        createContactItemHTML(contact.id, contact)
    ).join('');

    contactDropdown.innerHTML = contactItemsHTML;

    updateCheckboxesState(); // Restore checkbox states
    addContactClickListeners(); // Add event listeners for contact clicks
}


// ! validation







// ! validation
/**
 * Validates the task form.
 *
 * @returns {boolean} true if the form is valid, false otherwise.
 */
function validateTaskForm() {
    const inputs = getTaskFormInputs();
    const validations = validateTaskInputs(inputs);
    return areAllTaskValid(validations);
}

/**
 * Retrieves the form input elements for the task form.
 *
 * @returns {Object} an object containing the input elements.
 */
function getTaskFormInputs() {
    return {
        title: document.getElementById('task-title'),
        dueDate: document.getElementById('due-date'),
        category: document.getElementById('task-category')
    };
}

/**
 * Validates all input fields in the task form.
 *
 * @param {Object} inputs - the form input elements.
 * @returns {Object} an object containing validation results.
 */
function validateTaskInputs(inputs) {
    return {
        isTitleValid: validateTitle(inputs.title),
        isDueDateValid: validateDueDate(inputs.dueDate),
        isCategoryValid: validateCategory(inputs.category)
    };
}

/**
 * Checks if all validations are true.
 * 
 * @param {Object} validations - the validation results.
 * @returns {boolean} true if all validations are valid, false otherwise.
 */
function areAllTaskValid(validations) {
    return Object.values(validations).every(valid => valid);
}

/**
 * Clears the task form inputs.
 * 
 * @param {Object} inputs - the form input elements.
 */
function clearTaskForm(inputs) {
    inputs.title.value = '';
    inputs.dueDate.value = '';
    inputs.category.value = '';
}

/**
 * Updates the error state of a task input field and its corresponding error message.
 * 
 * @param {HTMLElement} input - the input element to update.
 * @param {HTMLElement} errorElement - the corresponding error message element.
 * @param {boolean} isValid - whether the input is valid or not.
 */
function setTaskInputErrorState(input, errorElement, isValid) {
    if (isValid) {
        input.classList.remove('input-error');
        errorElement.classList.remove('show');
    } else {
        input.classList.add('input-error');
        errorElement.classList.add('show');
    }
}

/**
 * Validates the task title input.
 * Checks if the title is not empty.
 * 
 * @param {HTMLInputElement} titleInput - the task title input element.
 * @returns {boolean} true if the title is valid, false otherwise.
 */
function validateTitle(titleInput) {
    const errorTitle = document.getElementById('error-task-title');
    const isValid = titleInput.value.trim() !== '';

    setTaskInputErrorState(titleInput, errorTitle, isValid);
    return isValid;
}

/**
 * Validates the task due date input.
 * Checks if the due date is selected.
 *
 * @param {HTMLInputElement} dueDateInput - the task due date input element.
 * @returns {boolean} true if the due date is valid, false otherwise.
 */
function validateDueDate(dueDateInput) {
    const errorDueDate = document.getElementById('error-due-date');
    const isValid = dueDateInput.value.trim() !== '';

    setTaskInputErrorState(dueDateInput, errorDueDate, isValid);
    return isValid;
}

/**
 * Validates the task category input.
 * Checks if the category is selected.
 *
 * @param {HTMLSelectElement} categoryInput - the task category select element.
 * @returns {boolean} true if the category is valid, false otherwise.
 */
function validateCategory(categoryInput) {
    const errorCategory = document.getElementById('error-task-category');
    const isValid = categoryInput.value.trim() !== '';

    setTaskInputErrorState(categoryInput, errorCategory, isValid);
    return isValid;
}



/**
 * Adds event listeners to inputs for real-time error handling.
 */
function addInputEventListeners() {
    const titleInput = document.getElementById('task-title');
    const dueDateInput = document.getElementById('due-date');
    const categoryInput = document.getElementById('task-category');

    // Add event listener for the title input
    titleInput.addEventListener('input', function () {
        const errorTitle = document.getElementById('error-task-title');
        setTaskInputErrorState(titleInput, errorTitle, titleInput.value.trim() !== '');
    });

    // Add event listener for the due date input
    dueDateInput.addEventListener('input', function () {
        const errorDueDate = document.getElementById('error-due-date');
        setTaskInputErrorState(dueDateInput, errorDueDate, dueDateInput.value.trim() !== '');
    });

    // Add event listener for the category input
    categoryInput.addEventListener('input', function () {
        const errorCategory = document.getElementById('error-task-category');
        setTaskInputErrorState(categoryInput, errorCategory, categoryInput.value.trim() !== '');
    });
}

// Call the function to initialize date picker on the 'due-date' input


// Add event listeners for real-time validation
addInputEventListeners();














// ! Add task to Firebase
// Hauptfunktion zum Hinzufügen der Aufgabe
async function addTask(event) {
    event.preventDefault(); // Verhindere das Standard-Formular-Submit-Verhalten

    // Führe die Validierung aus und breche ab, wenn das Formular ungültig ist
    if (!validateTaskForm()) return;


    // Sammle die Formulardaten
    const taskTitle = document.getElementById('task-title').value;
    const taskDescription = document.getElementById('task-description').value;
    const dueDate = document.getElementById('due-date').value;
    const taskCategory = document.getElementById('task-category').value;
    const taskPriority = document.getElementById('task-priority')?.value || 'mid'; // Standard auf "medium" setzen

    const taskStatus = 'todo'; // Standardstatus für eine neue Aufgabe

    // Sammle die ausgewählten Kontakte
    const selectedContacts = [];
    const selectedIcons = document.querySelectorAll('.selected-profile-icon');

    selectedIcons.forEach(icon => {
        const contactId = icon.getAttribute('data-id');
        const contact = allContacts.find(c => c.id === contactId);

        if (contact) {
            selectedContacts.push({
                id: contactId,
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                initials: contact.initials,
                color: contact.color,
                status: contact.status
            });
        }
    });

    // Sammle die Subtasks
    const subtasks = collectSubtasks();

    const taskData = {
        title: taskTitle,
        description: taskDescription,
        due_date: dueDate,
        category: taskCategory,
        status: taskStatus,
        priority: taskPriority,
        assigned_to: selectedContacts,
        subtasks: subtasks
    };

    try {
        // Pushe die Aufgabe in die Firebase-Datenbank
        const response = await fetch(`${DB_URL}/tasks.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            throw new Error('Fehler beim Hinzufügen der Aufgabe zu Firebase.');
        }

        showTaskAddedModal(); // Modal anzeigen
        clearInputForm(); // Formular zurücksetzen

    } catch (error) {
        console.error('Fehler beim Hinzufügen der Aufgabe:', error);
        alert('Fehler beim Hinzufügen der Aufgabe. Bitte versuche es später erneut.');
    }
}




// Funktion zum Sammeln der Subtasks
function collectSubtasks() {
    const subtasks = [];
    const subtaskItems = document.querySelectorAll('.subtask-item');

    subtaskItems.forEach(item => {
        const subtaskText = item.querySelector('.subtask-edit-input').value; // Holen des Subtask-Textes
        // Da der Status immer "unchecked" ist, setzen wir ihn direkt
        subtasks.push({
            text: subtaskText,
            status: 'unchecked' // Standardstatus für alle Subtasks
        });
    });

    return subtasks;
}


// Funktion zum Zurücksetzen aller Checkboxen
function resetCheckboxes() {
    const checkboxes = document.querySelectorAll('.contact-checkbox input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false; // Setze jede Checkbox auf "unchecked"
    });

    // Optional: Entferne alle ausgewählten Kontakt-Icons
    const selectedIcons = document.querySelectorAll('.selected-profile-icon');
    selectedIcons.forEach(icon => {
        icon.remove(); // Entferne das Profil-Icon des abgewählten Kontakts
    });
}

// ! SUBTASKS

// Hilfsfunktion, um Sichtbarkeit zu toggeln
function toggleVisibility(element, shouldShow) {
    element.classList.toggle('hidden', !shouldShow);
    element.classList.toggle('show', shouldShow);
}

// Funktion, die die Icons basierend auf dem Eingabefeldstatus wechselt
function toggleIcons() {
    const inputField = document.getElementById('input-subtask');
    const iconWrapper = document.getElementById('edit-icons');
    const plusIcon = document.getElementById('plus-icon');
    const isInputEmpty = inputField.value.trim() === "";

    // Zeige oder verstecke die Icons basierend auf dem Eingabezustand
    toggleVisibility(iconWrapper, !isInputEmpty);
    toggleVisibility(plusIcon, isInputEmpty);
}

// Funktion zum Hinzufügen einer Subtask
function addSubtask() {
    const inputField = document.getElementById('input-subtask');
    const subtaskText = inputField.value.trim();

    if (subtaskText === "") return; // Keine leeren Subtasks hinzufügen

    // Subtask-HTML erstellen und zur Liste hinzufügen
    const subtaskList = document.getElementById('subtask-list');
    subtaskList.innerHTML += `
        <li class="subtask-item">
            <input type="text" value="${subtaskText}" class="subtask-edit-input" readonly tabindex="-1" onclick="preventFocus(event)">
            <div class="subtask-edit-icons">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256" onclick="editSubtask(this)">
                    <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path>
                </svg>
                <div class="edit-divider-vertical"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256" onclick="deleteSubtask(this)">
                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                </svg>
            </div>
        </li>
    `;

    // Eingabefeld leeren und Icons zurücksetzen
    inputField.value = "";
    toggleIcons();

    // Füge Doppelklick-Event-Listener für die neue Subtask hinzu
    addDoubleClickListenerToSubtasks();
}

// Funktion zum Hinzufügen eines Doppelklick-Listeners für alle Subtasks
function addDoubleClickListenerToSubtasks() {
    const subtaskItems = document.querySelectorAll('.subtask-item');

    subtaskItems.forEach(subtaskItem => {
        if (!subtaskItem.hasAttribute('data-doubleclick-bound')) {
            subtaskItem.addEventListener('dblclick', function () {
                const editIcon = subtaskItem.querySelector('.subtask-edit-icons svg');
                if (editIcon) {
                    editSubtask(editIcon); // Bearbeitungsmodus aktivieren
                }
            });
            subtaskItem.setAttribute('data-doubleclick-bound', 'true');
        }
    });
}

// Function to handle the Enter key event in the input field
function handleEnter(event) {
    // Check if the key pressed is Enter
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission
        addSubtask(); // Call addSubtask function
    }
}

// Funktion zum Bearbeiten einer Subtask
function editSubtask(icon) {
    const subtaskItem = icon.closest('.subtask-item');
    const subtaskInput = subtaskItem.querySelector('.subtask-edit-input');

    // Wenn das Eingabefeld bereits bearbeitbar ist, keine erneute Aktion
    if (!subtaskInput.readOnly) return;

    // Eingabefeld bearbeiten aktivieren
    subtaskInput.readOnly = false;
    subtaskInput.tabIndex = 0;
    subtaskInput.focus();

    // Bearbeiten-Icon zu Speichern-Icon ändern
    icon.outerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256" onclick="saveSubtask(this)">
            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
        </svg>
    `;
}

// Funktion zum Speichern der bearbeiteten Subtask
function saveSubtask(icon) {
    const subtaskItem = icon.closest('.subtask-item');
    const subtaskInput = subtaskItem.querySelector('.subtask-edit-input');

    // Eingabefeld wieder nur lesbar machen
    subtaskInput.readOnly = true;
    subtaskInput.tabIndex = -1;

    // Speichern-Icon zurück zu Bearbeiten-Icon ändern
    icon.outerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256" onclick="editSubtask(this)">
            <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path>
        </svg>
    `;
}

// Funktion, die das Fokussieren eines readonly Eingabefelds verhindert
function preventFocus(event) {
    const inputField = event.target;
    if (inputField.readOnly) {
        event.preventDefault(); // verhindert den Fokus auf readonly Felder
    }
}


// Funktion zum Löschen einer Subtask
function deleteSubtask(icon) {
    icon.closest('.subtask-item').remove();
}

// Funktion zum Löschen des Texts im Eingabefeld
function clearSubtaskInput() {
    document.getElementById('input-subtask').value = "";
    toggleIcons(); // Icons zurücksetzen
}




// Funktion, um alle Formularelemente zu erhalten
function getFormElements() {
    return {
        taskTitle: document.getElementById('task-title'),
        taskDescription: document.getElementById('task-description'),
        assignedTo: document.getElementById('assigned-to'),
        selectedContacts: document.getElementById('selected-contacts'),
        dueDate: document.getElementById('due-date'),
        taskCategory: document.getElementById('task-category'),
        subtaskList: document.getElementById('subtask-list'),
        errorTaskTitle: document.getElementById('error-task-title'),
        errorDueDate: document.getElementById('error-due-date'),
        errorTaskCategory: document.getElementById('error-task-category'),
        mediumPriorityButton: document.getElementById('mid-priority-button')
    };
}

// Funktion zum Zurücksetzen des Formulars
function clearInputForm() {
    const elements = getFormElements();
    resetFormFields(elements);
    clearFlatpickr(elements.dueDate);
    resetPriority(elements.mediumPriorityButton);
    removeErrorClasses(elements);
}

// Eingabefelder zurücksetzen
function resetFormFields(elements) {
    elements.taskTitle.value = "";
    elements.taskDescription.value = "";
    elements.assignedTo.value = "";
    elements.selectedContacts.innerHTML = "";
    elements.dueDate.value = "";
    elements.taskCategory.value = "";
    elements.subtaskList.innerHTML = "";
    localStorage.removeItem('checkboxStates');
}

// Flatpickr zurücksetzen, falls vorhanden
function clearFlatpickr(dueDateElement) {
    const datePicker = dueDateElement._flatpickr;
    if (datePicker) datePicker.clear();
}

// Priorität auf Medium setzen
function resetPriority(mediumPriorityButton) {
    if (mediumPriorityButton) setPriority(mediumPriorityButton);
}

// Fehlerklassen entfernen
function removeErrorClasses(elements) {
    const fields = [
        { input: elements.taskTitle, error: elements.errorTaskTitle },
        { input: elements.dueDate, error: elements.errorDueDate },
        { input: elements.taskCategory, error: elements.errorTaskCategory },
    ];

    fields.forEach(({ input, error }) => {
        input.classList.remove('input-error');
        error.classList.remove('show');
    });
}










/**
 * displays the modal for failed login attempts and hides it after 2 seconds.
 * 
 * @function
 * @param {HTMLInputElement} emailInput - the input field for the email.
 * @param {HTMLInputElement} passwordInput - the input field for the password.
 * @returns {Promise<void>} a promise that resolves after the modal is hidden.
 */
function showTaskAddedModal() {
    const modal = document.getElementById('task-added-modal');
    modal.classList.remove('hidden');
    modal.classList.add('show');

    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('show');
    }, 2000);
}