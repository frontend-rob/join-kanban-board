// Funktion, um HTML-Inhalte aus externen Dateien zu laden
function includeHTML(callback) {
    const elements = document.querySelectorAll('[include-html]');
    let loadedElements = 0;

    elements.forEach(async (el) => {
        const file = el.getAttribute("include-html");
        if (file) {
            try {
                const response = await fetch(file);
                if (response.ok) {
                    const text = await response.text();
                    el.innerHTML = text;
                    el.removeAttribute("include-html");
                    loadedElements++;

                    if (loadedElements === elements.length) {
                        callback();
                    }
                }
            } catch (err) {
                console.error(`Error fetching ${file}: `, err);
                el.innerHTML = "Content not found.";
                loadedElements++;

                if (loadedElements === elements.length) {
                    callback();
                }
            }
        }
    });
}

// Funktion zum Anzeigen/Verstecken des Dropdowns und Drehen des Icons beim Klick
document.addEventListener('DOMContentLoaded', function () {
    // Elemente für den Category-Dropdown
    const categoryInput = document.getElementById('category');
    const categoryDropdownIcon = document.getElementById('dropdown-icon');
    const categoryDropdown = document.getElementById('category-dropdown');
    const categoryDropdownItems = document.querySelectorAll('.dropdown-item');

    // Elemente für den Kontakt-Dropdown
    const assignedInput = document.getElementById('assigned');
    const contactDropdownIcon = document.getElementById('contact-dropdown-icon');
    const contactDropdown = document.getElementById('contact-dropdown');

    // Status, um zu prüfen, ob die Kontakte bereits geladen wurden
    let contactsLoaded = false;

    // Funktion für Category-Dropdown
    function toggleCategoryDropdown() {
        toggleDropdown(categoryDropdown, categoryDropdownIcon);
    }

    // Funktion für Kontakt-Dropdown
    async function toggleContactDropdown() {
        // Kontakte nur einmal laden
        if (!contactsLoaded) {
            await initializeContactsDropdown();
            contactsLoaded = true;
        }

        // Dropdown-Anzeige umschalten
        toggleDropdown(contactDropdown, contactDropdownIcon);
    }

    // Event-Listener für Category-Dropdown
    if (categoryInput) categoryInput.addEventListener('click', toggleCategoryDropdown);
    if (categoryDropdownIcon) categoryDropdownIcon.addEventListener('click', toggleCategoryDropdown);

    categoryDropdownItems.forEach(item => {
        item.addEventListener('click', function () {
            categoryInput.value = this.getAttribute('data-category');
            toggleCategoryDropdown();
        });
    });

    // Event-Listener für Kontakt-Dropdown (Input und Icon)
    assignedInput.addEventListener('click', toggleContactDropdown);
    contactDropdownIcon.addEventListener('click', toggleContactDropdown);

    // Schließe Dropdown, wenn außerhalb geklickt wird
    document.addEventListener('click', function (event) {
        if (!assignedInput.contains(event.target) && !contactDropdown.contains(event.target) && event.target !== contactDropdownIcon) {
            if (!contactDropdown.classList.contains('hidden')) {
                toggleDropdown(contactDropdown, contactDropdownIcon);
            }
        }

        if (!categoryInput.contains(event.target) && !categoryDropdown.contains(event.target) && event.target !== categoryDropdownIcon) {
            if (!categoryDropdown.classList.contains('hidden')) {
                toggleDropdown(categoryDropdown, categoryDropdownIcon);
            }
        }
    });
});

// Funktion, um den Kontakt-Dropdown zu initialisieren und Kontakte zu laden
function initializeContactsDropdown() {
    const dropdownContainer = document.getElementById('contact-dropdown');
    const contacts = [];

    async function loadContacts() {
        try {
            console.log("Loading contacts...");
            const response = await fetch('https://join-379-kanban-board-default-rtdb.europe-west1.firebasedatabase.app/contacts.json');
            const data = await response.json();
            console.log("Contacts loaded:", data);

            for (let id in data) {
                contacts.push({ id, ...data[id] });
            }
            renderDropdown();
        } catch (error) {
            console.error('Error loading contacts:', error);
        }
    }

    function renderDropdown() {
        dropdownContainer.innerHTML = '';
        contacts.forEach(contact => {
            const contactDiv = document.createElement('div');
            contactDiv.classList.add('contact-option');
            const avatarColor = getRandomColor();
            contactDiv.innerHTML = `
                <div class="contact-avatar" style="background-color: ${avatarColor}">${getInitials(contact.name)}</div>
                <span>${contact.name}</span>
                <input type="checkbox">
            `;
    
            // Klick auf gesamten Bereich der `contact-option`
            contactDiv.addEventListener('click', function (event) {
                const checkbox = contactDiv.querySelector('input[type="checkbox"]');
                if (event.target.tagName !== 'INPUT') {
                    checkbox.checked = !checkbox.checked; // Toggle Checkbox-Status
                }
                toggleContactSelection(event, contact.id, contact.name, avatarColor);
            });
    
            dropdownContainer.appendChild(contactDiv);
        });
    }

    loadContacts();
}

// Funktion zum Hinzufügen oder Entfernen eines Kontakts
function toggleContactSelection(event, id, name, avatarColor) {
    const selectedContactsDiv = document.getElementById('selected-contacts');
    const existingContact = Array.from(selectedContactsDiv.children).find(child => child.getAttribute('data-id') === id);

    if (existingContact) {
        // Entferne den Kontakt, wenn er vorhanden ist und das Kontrollkästchen deaktiviert wird
        if (!event?.target.checked && event?.target.tagName === 'INPUT') {
            selectedContactsDiv.removeChild(existingContact);
        }
    } else {
        // Füge den Kontakt hinzu, wenn er nicht vorhanden ist
        const avatar = document.createElement('div');
        avatar.className = 'contact-avatar';
        avatar.style.backgroundColor = avatarColor;
        avatar.setAttribute('data-id', id);
        avatar.innerText = getInitials(name);
        selectedContactsDiv.appendChild(avatar);
    }
    updateAssignedInput();
}

// Funktion, um Initialen eines Namens zu generieren
function getInitials(name) {
    return name.split(' ').map(part => part[0]).join('');
}

// Funktion, um eine zufällige Farbe auszuwählen
function getRandomColor() {
    const colors = ['#FF5733', '#33C1FF', '#8E44AD', '#FFC300', '#DAF7A6'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function selectContact(id, name) {
    const selectedContactsDiv = document.getElementById('selected-contacts');
    const existingContact = Array.from(selectedContactsDiv.children).find(child => child.getAttribute('data-id') === id);

    if (existingContact) {
        console.warn(`Contact with id ${id} is already selected.`);
        return;
    }

    const avatar = document.createElement('div');
    avatar.className = 'contact-avatar';
    avatar.style.backgroundColor = getRandomColor();
    avatar.setAttribute('data-id', id);
    avatar.innerText = getInitials(name);
    selectedContactsDiv.appendChild(avatar);
}

// Initialisierungsfunktion
function init() {
    includeHTML(() => {
        initializeFlatpickr();
        initializePrioButtons();
        initializeContactsDropdown();

        const addContactButton = document.getElementById('add-contact-button');
        if (addContactButton) {
            addContactButton.addEventListener('click', openAddContactOverlay);
        }
    });
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', init);

// Flatpickr-Initialisierung
function initializeFlatpickr() {
    const dueDateInput = document.getElementById('due-date');
    const dateIcon = document.getElementById('date-icon');

    if (!dueDateInput) {
        console.error('Due date input not found.');
        return;
    }

    if (typeof flatpickr !== 'undefined') {
        const calendar = flatpickr(dueDateInput, {
            minDate: "today",
            dateFormat: "d/m/Y",
            locale: { firstDayOfWeek: 1 },
            animate: true,
            disableMobile: true
        });

        // Event-Listener für das Icon, um den Kalender zu öffnen
        if (dateIcon) {
            dateIcon.addEventListener('click', () => {
                dueDateInput.focus(); // Setzt den Fokus auf das Eingabefeld und öffnet den Kalender
            });
        } else {
            console.error('Date icon not found.');
        }
    } else {
        console.error('Flatpickr library is not loaded.');
    }
}

// Prio-Buttons Initialisierung
function initializePrioButtons() {
    const urgentButton = document.getElementById('urgent-button');
    const mediumButton = document.getElementById('medium-button');
    const lowButton = document.getElementById('low-button');
    const buttons = [urgentButton, mediumButton, lowButton];

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
            if (button.id === 'urgent-button') {
                button.style.backgroundColor = 'var(--priority-urgent)';
                button.querySelector('svg').style.fill = 'var(--white-content)';
                button.querySelector('svg').style.stroke = 'var(--white-content)';
                button.style.color = 'var(--white-content)';
            } else if (button.id === 'medium-button') {
                button.style.backgroundColor = 'var(--priority-medium)';
                button.querySelector('svg').style.fill = 'var(--white-content)';
                button.querySelector('svg').style.stroke = 'var(--white-content)';
                button.style.color = 'var(--white-content)';
            } else if (button.id === 'low-button') {
                button.style.backgroundColor = 'var(--priority-low)';
                button.querySelector('svg').style.fill = 'var(--white-content)';
                button.querySelector('svg').style.stroke = 'var(--white-content)';
                button.style.color = 'var(--white-content)';
            }
        });
    });
}

// Funktion zum Öffnen des Kontakt-Overlays
function openAddContactOverlay() {
    console.log('Opening add contact overlay');
}

// Funktion zum Umschalten des Dropdowns
function toggleDropdown(dropdown, icon = null) {
    if (dropdown.classList.contains('hidden')) {
        dropdown.classList.remove('hidden');
        if (icon) {
            icon.style.transform = 'rotate(180deg)';
        }
    } else {
        dropdown.classList.add('hidden');
        if (icon) {
            icon.style.transform = 'rotate(0deg)';
        }
    }
}

// Funktion zum Aktualisieren des `Assigned to` Eingabefelds
function updateAssignedInput() {
    const selectedContacts = document.getElementById('selected-contacts');
    const assignedInput = document.getElementById('assigned');
    if (selectedContacts && selectedContacts.children.length > 0) {
        assignedInput.value = "Contacts selected";
    } else {
        assignedInput.value = "";
    }
}

// Initialisierung des Hauptinhalts
document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.querySelector('.main-content');
    mainContent.classList.add('visible');
});


// Dieser Event-Listener wird ausgelöst, sobald das Dokument geladen ist
document.addEventListener('DOMContentLoaded', () => {
    const subtaskInput = document.getElementById('addSubtask-input');
    
    // Zeigt die Bearbeitungsicons an, wenn das Eingabefeld fokussiert wird
    subtaskInput.addEventListener('focus', showEditIcons);

    // Setzt die Icons auf das Plus-Icon zurück, wenn das Eingabefeld den Fokus verliert
    subtaskInput.addEventListener('blur', resetIcons);

    // Fügt eine Subtask hinzu, wenn die Enter-Taste gedrückt wird
    subtaskInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            addSubtask();
            event.preventDefault();
        }
    });
});

// Funktion, um die Bearbeitungsicons anzuzeigen und das Plus-Icon auszublenden
function showEditIcons() {
    document.getElementById('plus-icon').style.display = 'none'; // Hide plus icon
    document.getElementById('edit-icons').style.display = 'flex'; // Show edit icons with flex layout
}

function resetIcons() {
    document.getElementById('plus-icon').style.display = 'block'; // Show plus icon
    document.getElementById('edit-icons').style.display = 'none'; // Hide edit icons
}

// Funktion zum Leeren des Eingabefelds
function clearSubtaskInput() {
    const subtaskInput = document.getElementById('addSubtask-input');
    subtaskInput.value = ''; // Setzt den Inhalt des Eingabefelds auf leer
}

// Funktion zum Hinzufügen einer neuen Subtask
function addSubtask() {
    const subtaskInput = document.getElementById('addSubtask-input');
    const subtaskList = document.getElementById('addSubtask-list');
    const subtaskText = subtaskInput.value.trim();

    if (!subtaskText) return; // Verhindert das Hinzufügen, wenn das Feld leer ist

    // Erstellt eine neue Subtask-Listenelement
    const subtaskItem = document.createElement('li');
    subtaskItem.className = 'addSubtask-item';
    subtaskItem.innerHTML = `
        <span class="subtask-text" style="margin-left: 16px;">• ${subtaskText}</span>
        <div class="addSubtask-actions">
            <!-- Edit-Icon -->
            <svg onclick="editSubtask(this)" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256">
                <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160,136,75.31,152.69,92,68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188,164,103.31,180.69,120Zm96-96L147.31,64l24-24L216,84.68Z"></path>
            </svg>
            <div class="vertical-divider"></div>
            <!-- Delete-Icon -->
            <svg onclick="deleteSubtask(this)" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256">
                <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
            </svg>
        </div>
    `;

    subtaskList.appendChild(subtaskItem); // Fügt das Listenelement zur Subtask-Liste hinzu
    subtaskInput.value = ''; // Setzt das Eingabefeld zurück
    resetIcons(); // Setzt die Icons zurück
}

// Funktion zum Bearbeiten einer Subtask
function editSubtask(element) {
    const subtaskItem = element.closest('.addSubtask-item');
    const currentText = subtaskItem.querySelector('.subtask-text').textContent.trim();

    // Erstellt ein Eingabefeld mit dem aktuellen Text
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = currentText.replace('• ', '');
    editInput.className = 'subtask-edit-input';

    subtaskItem.innerHTML = ''; // Löscht den Inhalt des Listenelements
    subtaskItem.appendChild(editInput); // Fügt das Eingabefeld hinzu
    subtaskItem.appendChild(createEditActions()); // Fügt die Bearbeitungsaktionen hinzu

    editInput.focus(); // Setzt den Fokus auf das Eingabefeld
}

// Funktion zur Erstellung der Bearbeitungsaktionen (Icons)
function createEditActions() {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'addSubtask-actions';
    actionsDiv.innerHTML = `
        <!-- Delete-Icon -->
        <svg onclick="deleteSubtask(this)" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256">
            <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
        </svg>
        <div class="vertical-divider"></div>
        <!-- Confirm-Icon -->
        <svg onclick="confirmEdit(this)" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256">
            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1-11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
        </svg>
    `;
    return actionsDiv;
}

// Funktion zur Bestätigung der Bearbeitung einer Subtask
function confirmEdit(confirmIcon) {
    const subtaskItem = confirmIcon.closest('.addSubtask-item');
    const editInput = subtaskItem.querySelector('.subtask-edit-input');
    
    if (!editInput) {
        console.warn('Edit input element not found.');
        return;
    }
    
    const newText = editInput.value.trim();

    if (newText) {
        subtaskItem.innerHTML = `
            <span class="subtask-text" style="margin-left: 16px;">• ${newText}</span>
        `;
        subtaskItem.appendChild(createEditActions()); // Fügt die Bearbeitungsaktionen wieder hinzu
    }
}

// Funktion zum Löschen einer Subtask
document.addEventListener('DOMContentLoaded', function () {
    const clearButton = document.querySelector('.btn.btn-outline');
    
    if (clearButton) {
        clearButton.addEventListener('click', function () {
            // Alle Input-Felder auswählen und leeren
            const inputFields = document.querySelectorAll('input[type="text"], input[type="date"], input[type="email"], input[type="number"], input[type="password"]');
            inputFields.forEach(input => input.value = '');

            // Textareas leeren
            const textAreas = document.querySelectorAll('textarea');
            textAreas.forEach(textarea => textarea.value = '');

            // Checkbox-Felder zurücksetzen
            const checkboxFields = document.querySelectorAll('input[type="checkbox"]');
            checkboxFields.forEach(checkbox => checkbox.checked = false);

            // Prio-Buttons zurücksetzen
            const prioButtons = document.querySelectorAll('.prio-button');
            prioButtons.forEach(button => {
                button.classList.remove('active'); // Entfernt die aktive Markierung
                button.style.backgroundColor = ''; // Setzt den Hintergrund zurück
                const svg = button.querySelector('svg');
                if (svg) {
                    svg.style.fill = ''; // Setzt die SVG-Farben zurück
                    svg.style.stroke = ''; 
                }
                button.style.color = ''; // Setzt die Schriftfarbe zurück
            });

            // Kontakte zurücksetzen (z.B. ausgewählte Kontakte entfernen)
            const selectedContactsDiv = document.getElementById('selected-contacts');
            if (selectedContactsDiv) {
                selectedContactsDiv.innerHTML = ''; // Entfernt alle hinzugefügten Kontakte
            }

            // Datum zurücksetzen
            const dateInputs = document.querySelectorAll('input[type="date"]');
            dateInputs.forEach(dateInput => {
                dateInput.value = ''; // Leert das Datumsauswahlfeld
            });

            // Subtask-Listen zurücksetzen
            const subtaskList = document.getElementById('addSubtask-list');
            if (subtaskList) {
                subtaskList.innerHTML = ''; // Entfernt alle angelegten Subtasks
            }

            console.log('All inputs, textareas, priority buttons, contacts, date fields, and subtasks reset.');
        });
    } else {
        console.warn('Clear button not found.');
    }
});

// Funktion zum Löschen eines einzelnen Subtasks (bleibt unverändert)
function deleteSubtask(deleteIcon) {
    const subtaskItem = deleteIcon.closest('.addSubtask-item');
    if (subtaskItem) subtaskItem.remove();
}

// Initialisierung des Hauptinhalts
document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.querySelector('.main-content');
    mainContent.classList.add('visible');
});

//Lösch Button////////////////////////////////////////

// Firebase configuration
// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "https://join-379-kanban-board-default-rtdb.europe-west1.firebasedatabase.app/"
};

// Initialize Firebase
if (typeof firebase === 'undefined') {
  console.error('Firebase SDK not loaded. Check your script tags.');
} else {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
}

// Initialize Realtime Database
const database = firebase.database();

document.addEventListener('DOMContentLoaded', function () {
  const createTaskButton = document.querySelector('.btn.btn-lg');
  const clearButton = document.querySelector('.btn.btn-outline');
  const priorityButtons = document.querySelectorAll('.prio-button');

  let selectedPriority = 'mid'; // Default to 'mid' priority

  // Required fields
  const requiredFields = [
    { id: 'title', name: 'Title', type: 'input' },
    { id: 'due-date', name: 'Due Date', type: 'input' },
    { id: 'assigned', name: 'Assigned To', type: 'dropdown' },
    { id: 'category', name: 'Category', type: 'dropdown' }
  ];

  // Add event listener for each required field for validation
  requiredFields.forEach(field => {
    const input = document.getElementById(field.id);
    if (input) {
      const errorMessage = input.parentElement.querySelector('.error-message-addtask');

      if (field.type === 'input') {
        input.addEventListener('input', () => {
          validateField(input, errorMessage, field);
        });
      } else if (field.type === 'dropdown') {
        if (field.id === 'assigned') {
          // MutationObserver for the 'assigned' area
          const selectedContacts = document.getElementById('selected-contacts');
          const observer = new MutationObserver(() => {
            updateAssignedInput();
            removeError(input, errorMessage);
          });

          observer.observe(selectedContacts, {
            childList: true,
          });

          input.addEventListener('click', () => {
            removeError(input, errorMessage);
          });

        } else if (field.id === 'category') {
          const categoryDropdown = document.getElementById('category-dropdown');
          categoryDropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('dropdown-item')) {
              input.value = e.target.dataset.category;
              removeError(input, errorMessage);
            }
          });

          input.addEventListener('click', () => {
            removeError(input, errorMessage);
          });
        }
      }
    }
  });

  // Add event listeners for priority buttons
  priorityButtons.forEach(button => {
    button.addEventListener('click', () => {
      priorityButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      selectedPriority = button.id === 'medium-button' ? 'mid' : 
                         button.id === 'low-button' ? 'low' : 'high';
    });
  });

  if (createTaskButton) {
    createTaskButton.addEventListener('click', function (event) {
      event.preventDefault();

      let hasError = false;

      requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        if (input) {
          const errorMessage = input.parentElement.querySelector('.error-message-addtask');

          if (!isFieldValid(input, field)) {
            hasError = true;
            showError(input, errorMessage);
          } else {
            removeError(input, errorMessage);
          }
        }
      });

      if (!hasError) {
        const formData = {
          title: document.getElementById('title')?.value || '',
          dueDate: document.getElementById('due-date')?.value || '',
          description: document.getElementById('description')?.value || '',
          priority: selectedPriority,
          category: document.getElementById('category')?.value || '',
          assigned: getAssignedContactIds(),
          subtasks: getSubtasks()
        };

        sendDataToFirebase(formData);
      }
    });
  } else {
    console.error('Create Task Button not found');
  }

  if (clearButton) {
    clearButton.addEventListener('click', clearForm);
  } else {
    console.error('Clear Button not found');
  }

  function showError(input, errorMessage) {
    if (input && !input.classList.contains('error')) {
      input.classList.add('error');
    }

    if (errorMessage) {
      errorMessage.textContent = 'This field is required!';
      errorMessage.style.display = 'block';
    }
  }

  function removeError(input, errorMessage) {
    if (input && input.classList.contains('error')) {
      input.classList.remove('error');
    }

    if (errorMessage) {
      errorMessage.style.display = 'none';
      errorMessage.textContent = '';
    }
  }

  function validateField(input, errorMessage, field) {
    if (isFieldValid(input, field)) {
      removeError(input, errorMessage);
    } else {
      showError(input, errorMessage);
    }
  }

  function isFieldValid(input, field) {
    if (field.type === 'input') {
      return input.value.trim() !== '';
    } else if (field.type === 'dropdown') {
      if (field.id === 'assigned') {
        const selectedContacts = document.getElementById('selected-contacts');
        return selectedContacts && selectedContacts.children.length > 0;
      } else if (field.id === 'category') {
        return input.value.trim() !== '';
      }
    }
    return false;
  }

  function updateAssignedInput() {
    const selectedContacts = document.getElementById('selected-contacts');
    const assignedInput = document.getElementById('assigned');
    if (assignedInput) {
      if (selectedContacts && selectedContacts.children.length > 0) {
        assignedInput.value = "Contacts selected";
      } else {
        assignedInput.value = "";
      }
    }
  }

  function getAssignedContactIds() {
    const selectedContacts = document.getElementById('selected-contacts');
    if (selectedContacts) {
      const selectedNames = Array.from(selectedContacts.children).map(child => child.textContent.trim());
      
      if (typeof window.contacts !== 'undefined' && window.contacts !== null && typeof window.contacts === 'object') {
        return Object.entries(window.contacts)
          .filter(([id, contact]) => selectedNames.includes(contact.name))
          .map(([id, contact]) => id);
      } else {
        console.warn('Contacts data is not available');
        return selectedNames;
      }
    }
    return [];
  }

  function sendDataToFirebase(formData) {
    loadContacts().then(() => {
      formData.assigned = getAssignedContactIds();
      
      if (!formData.priority) {
        formData.priority = 'mid';
      }
      
      formData.createdAt = firebase.database.ServerValue.TIMESTAMP;
      
      const tasksRef = database.ref('tasks');
      tasksRef.push(formData)
        .then(() => {
          console.log('Task created successfully!');
          clearForm();
        })
        .catch((error) => {
          console.error('Error creating task:', error);
        });
    }).catch(error => {
      console.error('Error loading contacts:', error);
    });
  }

  function loadContacts() {
    return new Promise((resolve, reject) => {
      database.ref('contacts').once('value')
        .then(snapshot => {
          window.contacts = snapshot.val();
          resolve();
        })
        .catch(error => {
          console.error('Error loading contacts:', error);
          reject(error);
        });
    });
  }

  function clearForm() {
    const fieldsToClean = [
      'title', 'due-date', 'description', 'category', 'assigned', 'addSubtask-input'
    ];

    fieldsToClean.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.value = '';
        removeError(field, field.parentElement.querySelector('.error-message-addtask'));
      }
    });

    const selectedContacts = document.getElementById('selected-contacts');
    if (selectedContacts) {
      selectedContacts.innerHTML = '';
    }

    updateAssignedInput();

    // Clear subtasks
    const subtaskList = document.getElementById('addSubtask-list');
    if (subtaskList) {
      subtaskList.innerHTML = '';
    }

    // Reset priority buttons
    priorityButtons.forEach(btn => btn.classList.remove('active'));
    selectedPriority = 'mid';
  }

  // Subtask functionality
  function addSubtask() {
    const input = document.getElementById('addSubtask-input');
    const subtaskText = input.value.trim();

    if (subtaskText) {
      const subtaskList = document.getElementById('addSubtask-list');
      const newSubtaskItem = document.createElement('li');
      newSubtaskItem.textContent = subtaskText;
      subtaskList.appendChild(newSubtaskItem);

      showEditIcons(newSubtaskItem);

      input.value = '';
    }
  }

  function showEditIcons(subtaskItem) {
    const editIcon = document.createElement('span');
    editIcon.innerHTML = '&#9998;';
    editIcon.className = 'edit-icon';
    editIcon.onclick = function() { editSubtask(subtaskItem); };

    const deleteIcon = document.createElement('span');
    deleteIcon.innerHTML = '&#10006;';
    deleteIcon.className = 'delete-icon';
    deleteIcon.onclick = function() { deleteSubtask(subtaskItem); };

    subtaskItem.appendChild(editIcon);
    subtaskItem.appendChild(deleteIcon);
  }

  function editSubtask(subtaskItem) {
    const newText = prompt("Edit subtask:", subtaskItem.textContent);
    if (newText !== null && newText.trim() !== "") {
      subtaskItem.textContent = newText.trim();
      showEditIcons(subtaskItem);
    }
  }

  function deleteSubtask(subtaskItem) {
    if (confirm("Are you sure you want to delete this subtask?")) {
      subtaskItem.remove();
    }
  }

  function getSubtasks() {
    const subtaskList = document.getElementById('addSubtask-list');
    return Array.from(subtaskList.children).map(li => li.textContent.trim());
  }

  // Event listener for adding subtasks
  const addSubtaskInput = document.getElementById('addSubtask-input');
  if (addSubtaskInput) {
    addSubtaskInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        addSubtask();
      }
    });
  }

  // Load contacts when the page loads
  loadContacts().catch(error => {
    console.error('Error loading contacts on page load:', error);
  });
});

// Log Firebase SDK version
if (firebase.SDK_VERSION) {
  console.log('Firebase SDK version:', firebase.SDK_VERSION);
}