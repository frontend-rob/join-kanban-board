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
document.addEventListener('DOMContentLoaded', function() {
    const categoryInput = document.getElementById('category');
    const dropdownIcon = document.getElementById('dropdown-icon');
    const dropdown = document.getElementById('category-dropdown');
    const dropdownItems = document.querySelectorAll('.dropdown-item');

    function toggleDropdown() {
        dropdown.classList.toggle('hidden');
        dropdownIcon.style.transform = dropdown.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    }

    categoryInput.addEventListener('click', toggleDropdown);
    dropdownIcon.addEventListener('click', toggleDropdown);

    dropdownItems.forEach(item => {
        item.addEventListener('click', function() {
            categoryInput.value = this.getAttribute('data-category');
            toggleDropdown();
        });
    });
});


// Funktion, um den Dropdown für Kontakte zu initialisieren und zu laden

function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const inputField = document.querySelector('.input-field');
    const icon = inputField.querySelector('svg');
    
    if (dropdown && icon) {
        dropdown.classList.toggle("hidden");
        icon.style.transform = dropdown.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)";
    }
}

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
            contactDiv.innerHTML = `
                <div class="contact-avatar" style="background-color: ${getRandomColor()}">${getInitials(contact.name)}</div>
                <span>${contact.name}</span>
                <input type="checkbox" onclick="selectContact('${contact.id}', '${contact.name}')">
            `;
            dropdownContainer.appendChild(contactDiv);
        });
    }

    loadContacts();
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

        // Neuer Code für den Icon-Event-Listener
        const dropdownIcon = document.querySelector('.input-field svg');
        if (dropdownIcon) {
            dropdownIcon.addEventListener('click', () => toggleDropdown('contact-dropdown'));
        }
    });
}

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
}


// Funktion zum Öffnen des Kontakt-Overlays
function openAddContactOverlay() {
    console.log('Opening add contact overlay');
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', init);

// Funktion für das Hinzufügen von Subtasks
function addSubtask() {
    const subtaskInput = document.getElementById('subtask');
    const subtaskList = document.getElementById('subtask-list');
    
    if (!subtaskInput.value.trim()) {
        console.warn('Subtask input is empty.');
        return;
    }

    const subtaskItem = document.createElement('li');
    subtaskItem.className = 'subtask-item';
    subtaskItem.innerHTML = `
        <span class="bullet">•</span> ${subtaskInput.value.trim()}
    `;
    subtaskList.appendChild(subtaskItem);
    subtaskInput.value = '';
}

function selectCategory(category) {
    const categoryInput = document.getElementById('category');
    if (categoryInput) {
        categoryInput.value = category;  // Setzt den ausgewählten Wert in das Eingabefeld
    }
    toggleDropdown('category-dropdown');  // Schließt das Dropdown-Menü nach Auswahl
}

function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const icon = document.querySelector('#category-dropdown ~ svg');  // Wählt das Icon neben dem Dropdown

    if (dropdown) {
        dropdown.classList.toggle("hidden");
        
        // Drehung des Icons beim Öffnen oder Schließen des Dropdowns
        if (icon) {
            icon.classList.toggle('rotate-180', !dropdown.classList.contains('hidden'));
        }
    }
}

