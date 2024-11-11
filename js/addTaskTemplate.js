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
 * initialize flatpickr on the input field
 * 
 * @param {string} "#due-date" - input field id
 * @param {Object} options - flatpickr settings
 * @param {string} options.minDate - disable past dates ("today")
 * @param {string} options.dateFormat - date format for form submission (yyyy-mm-dd)
 * @param {boolean} options.altInput - show alternative readable date format
 * @param {string} options.altFormat - format for visible date in altInput
 * @param {boolean} options.allowInput - allow manual date input
 */
flatpickr("#due-date", {
    minDate: "today",        // disable past dates
    dateFormat: "Y-m-d",     // format for hidden input
    altInput: true,          // readable date format
    altFormat: "Y-m-d",      // visible format in altInput
    allowInput: true         // allow manual input
});


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

    categoryInput.value = selectedCategory;
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
    const assignedInput = document.getElementById('assigned');
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
        console.log('Fetched contacts:', contactsObj); // Überprüfen der abgerufenen Daten

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
function createContactItemHTML(contactId, contact) {
    return contactTemplate(contactId, contact.color, contact.initials, contact.name);
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
async function renderContacts() {
    const contactDropdown = document.getElementById('contact-dropdown');
    contactDropdown.classList.remove('hidden');
    contactDropdown.innerHTML = ''; // Leert das Dropdown

    // Kontakte abrufen
    const contacts = await fetchContacts();
    if (!contacts) {
        contactDropdown.innerHTML = '<p>Error loading contacts.</p>';
        return;
    }

    // Jedes Kontaktobjekt durchlaufen und das HTML mit der Firebase-ID erstellen
    const contactItemsHTML = contacts.map(contact =>
        createContactItemHTML(contact.id, contact)
    ).join('');

    contactDropdown.innerHTML = contactItemsHTML;

    updateCheckboxesState(); // Zustand der Checkboxen wiederherstellen
    addContactClickListeners(); // Event-Listener für Klicks auf Kontaktkarten hinzufügen
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

// ! add task to firebase
// ! Add task to Firebase
async function addTask(event) {
    event.preventDefault(); // Verhindere das Standard-Formular-Submit-Verhalten

    // Sammle die Formulardaten
    const taskTitle = document.getElementById('task-title').value;
    const taskDescription = document.getElementById('task-description').value;
    const dueDate = document.getElementById('due-date').value;
    const taskCategory = document.getElementById('task-category').value;

    // Der Status ist immer "inprogress", wenn eine Aufgabe erstellt wird
    const taskStatus = 'todo';

    // Wenn keine Priorität gesetzt wurde, setze die Priorität auf "medium" (oder eine andere Standardpriorität)
    if (!taskPriority) {
        taskPriority = 'medium'; // Standardpriorität, falls der Benutzer keine auswählt
    }

    // Hier sammeln wir alle ausgewählten Kontakte mit vollständigen Details
    const selectedContacts = [];
    const selectedIcons = document.querySelectorAll('.selected-profile-icon');

    selectedIcons.forEach(icon => {
        const contactId = icon.getAttribute('data-id'); // ID aus dem 'data-id' Attribut holen

        // Hier greifst du direkt auf den Kontakt in der 'contacts' Datenbank zu, die du von Firebase bekommen hast
        const contact = allContacts.find(c => c.id === contactId); // Zugriff auf den Kontakt anhand der ID als Schlüssel

        // Überprüfen, ob der Kontakt existiert
        if (contact) {
            selectedContacts.push({
                id: contactId,  // Verwende den Kontakt ID-Schlüssel aus der 'contacts' Datenbank
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                initials: contact.initials,
                color: contact.color,
                status: contact.status // Optional, je nachdem ob du es auch brauchst
            });
        }
    });

    // Sammle die Subtasks
    const subtasks = collectSubtasks();

    console.log('Selected Contacts:', selectedContacts); // Überprüfen, ob die Kontakte korrekt hinzugefügt wurden
    console.log('Subtasks:', subtasks); // Überprüfen, ob die Subtasks korrekt gesammelt wurden

    const taskData = {
        title: taskTitle,
        description: taskDescription,
        due_date: dueDate,
        category: taskCategory,
        status: taskStatus, // Der Status bleibt immer "inprogress"
        priority: taskPriority, // Die gewählte Priorität
        assigned_to: selectedContacts, // Hier kommen nun die ausgewählten Kontakte mit vollständigen Daten rein
        subtasks: subtasks // Hier fügen wir die gesammelten Subtasks hinzu
    };

    try {
        // Pushe die Aufgabe in den 'tasks'-Pfad der Firebase-Datenbank
        const response = await fetch(`${DB_URL}/tasks.json`, {
            method: 'POST', // POST für das Erstellen einer neuen Aufgabe
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData) // Konvertiere das Aufgabendaten-Objekt in JSON
        });

        if (!response.ok) {
            throw new Error('Fehler beim Hinzufügen der Aufgabe zu Firebase.');
        }

        showTaskAddedModal();
        clearInputForm();

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
}

// Funktion zum Bearbeiten einer Subtask
function editSubtask(icon) {
    const subtaskItem = icon.closest('.subtask-item');
    const subtaskInput = subtaskItem.querySelector('.subtask-edit-input');

    // Prüfen, ob das Eingabefeld bereits bearbeitbar ist
    if (!subtaskInput.readOnly) return;

    // Eingabefeld bearbeitbar machen, tabIndex auf 0 setzen und den Fokus setzen
    subtaskInput.readOnly = false;
    subtaskInput.tabIndex = 0;
    subtaskInput.focus();

    // Bearbeiten-Icon durch Speichern-Icon ersetzen
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

    // Eingabefeld speichern, wieder auf readOnly setzen und tabIndex entfernen
    subtaskInput.readOnly = true;
    subtaskInput.tabIndex = -1; // Macht es nicht fokussierbar

    // Speichern-Icon wieder durch Bearbeiten-Icon ersetzen
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




// Funktion zum Zurücksetzen des Formulars
function clearInputForm() {
    document.getElementById('task-title').value = "";
    document.getElementById('task-description').value = "";
    document.getElementById('selected-contacts').innerHTML = "";
    document.getElementById('due-date').value = "";
    document.getElementById('task-category').value = "";
    document.getElementById('subtask-list').innerHTML = "";
    localStorage.removeItem('checkboxStates');

    // Setze das Datum in Flatpickr zurück, falls es vorhanden ist
    const datePicker = document.getElementById('due-date')._flatpickr;
    if (datePicker) {
        datePicker.clear();
    }

    // Stelle sicher, dass die "Medium" Priorität nach dem Zurücksetzen aktiv ist
    const mediumPriorityButton = document.getElementById('mid-priority-button');
    if (mediumPriorityButton) {
        setPriority(mediumPriorityButton);
    }
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