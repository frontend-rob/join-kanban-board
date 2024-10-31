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

// Funktion zum Anzeigen/Verstecken von Dropdowns
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        dropdown.classList.toggle("hidden");
    }
}

// Funktion zur Kategorieauswahl und Dropdown schließen
function selectCategory(category) {
    document.getElementById("category").value = category;
    toggleDropdown("category-dropdown");
}


// Funktion zum Umschalten der Anzeige des Subtask-Dropdowns
function toggleSubtaskDropdown() {
    const optionsDiv = document.getElementById("subtask-options");
    optionsDiv.style.display = optionsDiv.style.display === "block" ? "none" : "block";
}

// Funktion zur Auswahl eines Subtasks und zum Hinzufügen zur Liste
function selectSubtask(subtaskName) {
    document.getElementById("subtask").value = subtaskName;  // Gewählten Subtask im Eingabefeld anzeigen
    toggleSubtaskDropdown();  // Dropdown ausblenden
    addSubtask(subtaskName);  // Zur Subtask-Liste hinzufügen
}

// Funktion zum Hinzufügen eines neuen Subtask-Elements zur Liste
function addSubtask(subtaskName) {
    const subtaskList = document.getElementById("subtask-list");

    const subtaskItem = document.createElement("li");
    subtaskItem.classList.add("subtask-item");
    subtaskItem.innerHTML = `
          <span class="bullet">•</span> <span>${subtaskName}</span>
          <div class="subtask-actions">
            <svg onclick="editSubtask(this)" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#000000" viewBox="0 0 256 256">
              <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160,136,75.31,152.69,92,68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188,164,103.31,180.69,120Zm96-96L147.31,64l24-24L216,84.68Z"></path>
            </svg>
            <svg onclick="removeSubtask(this)" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#000000" viewBox="0 0 256 256">
              <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
            </svg>
          </div>
        `;
    subtaskList.appendChild(subtaskItem);
}

// Funktion zum Entfernen eines Subtask-Elements
function removeSubtask(element) {
    element.closest(".subtask-item").remove();
}

// Funktion zum Bearbeiten eines Subtask-Elements
function editSubtask(element) {
    const subtaskText = element.closest(".subtask-item").querySelector("span:nth-child(2)");
    const newSubtaskName = prompt("Edit Subtask:", subtaskText.textContent);
    if (newSubtaskName) {
        subtaskText.textContent = newSubtaskName;
    }
}

// Dropdown schließen, wenn außerhalb geklickt wird
document.addEventListener("click", function (event) {
    const optionsDiv = document.getElementById("subtask-options");
    const icon = document.querySelector(".input-field svg");
    if (!optionsDiv.contains(event.target) && event.target !== icon) {
        optionsDiv.style.display = "none";
    }
});

// Eventlistener für das Icon hinzufügen, um Dropdown bei Klick anzuzeigen
document.querySelector(".input-field svg").addEventListener("click", toggleSubtaskDropdown);


// Initialisierungsfunktion
function init() {
    includeHTML(() => {
        initializeFlatpickr();
        initializePrioButtons();
        initializeContactsDropdown();
        initializeAddContactButton();
    });

    // Eventlistener für die Kontakt-Dropdown-Funktion
    document.getElementById("assigned").addEventListener("click", () => toggleDropdown("contact-dropdown"));

    // Eventlistener für die Kategorie-Dropdown-Funktion auf Eingabefeld und SVG-Icon
    const categoryInput = document.getElementById("category");
    const categoryIcon = document.querySelector(".input-group.category-container svg");

    categoryInput.addEventListener("click", () => toggleDropdown("category-dropdown"));
    categoryIcon.addEventListener("click", () => toggleDropdown("category-dropdown"));

    // Eventlistener für das Subtask-Eingabefeld und das SVG-Icon
    const subtaskInput = document.getElementById("subtask");
    const subtaskIcon = document.querySelector("#subtask + svg");

    subtaskInput.addEventListener("click", addSubtask);
    subtaskIcon.addEventListener("click", addSubtask);
}

// Flatpickr-Initialisierung mit Deaktivierung des Mobilansicht-Inputs
function initializeFlatpickr() {
    const dueDateInput = document.getElementById('due-date');
    const logo = document.querySelector('#logo-svg');
    const logoPathData = "M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-68-76a12,12,0,1,1-12-12A12,12,0,0,1,140,132Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,132ZM96,172a12,12,0,1,1-12-12A12,12,0,0,1,96,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,140,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,172Z";

    if (!dueDateInput) {
        console.error('Due date input not found.');
        return;
    }

    if (dueDateInput._flatpickr) return;

    flatpickr(dueDateInput, {
        minDate: "today",
        dateFormat: "d/m/Y",
        locale: { firstDayOfWeek: 1 },
        animate: true,
        disableMobile: true  // Deaktiviert die mobile Datumsanzeige
    });

    if (logo) {
        logo.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="${logoPathData}"/></svg>`;
        logo.addEventListener('click', () => {
            if (dueDateInput._flatpickr) {
                dueDateInput._flatpickr.open();
            }
        });
    } else {
        console.warn('Element mit ID #logo-svg nicht gefunden.');
    }
}

// Prio-Buttons Initialisierung
function initializePrioButtons() {
    const buttons = document.querySelectorAll('.prio-button');
    if (buttons.length > 0) {
        buttons.forEach(button => {
            button.addEventListener('click', function () {
                buttons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.style.backgroundColor = '';
                    btn.style.color = '';
                    btn.style.transform = '';
                    btn.style.boxShadow = '';
                    const svgElement = btn.querySelector('svg');
                    if (svgElement) {
                        svgElement.style.fill = '';
                        svgElement.style.stroke = '';
                        svgElement.style.transform = '';
                    }
                    const textElement = btn.querySelector('span') || btn;
                    if (textElement) {
                        textElement.style.transform = '';
                        textElement.style.textShadow = '';
                    }
                });

                button.classList.add('active');
                const backgroundColor = button.classList.contains('urgent') ? '#ff3d00' : button.classList.contains('medium') ? '#fea800' : '#7be129';
                button.style.backgroundColor = backgroundColor;
                button.style.color = '#ffffff';
                button.style.transform = 'scale(1.05)';
                button.style.boxShadow = `0 0 2px ${backgroundColor}`;
                button.style.transition = 'all 0.3s ease';

                const svgElement = button.querySelector('svg');
                if (svgElement) {
                    svgElement.style.fill = '#ffffff';
                    svgElement.style.stroke = '#ffffff';
                    svgElement.style.transform = 'rotate(360deg)';
                    svgElement.style.transition = 'transform 0.5s ease';
                }

                const textElement = button.querySelector('span') || button;
                if (textElement) {
                    textElement.style.transform = 'translateY(-2px)';
                    textElement.style.textShadow = '0 2px 4px rgba(0,0,0,0.2)';
                    textElement.style.transition = 'all 0.3s ease';
                }

                button.style.animation = 'pulse 0.5s';
                button.style.animationIterationCount = '1';
            });
        });

        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1.05); }
            }
        `;
        document.head.appendChild(style);
    } else {
        console.error('Keine .prio-button Elemente gefunden.');
    }
}

// Kontakte-Dropdown Initialisierung
function initializeContactsDropdown() {
    const dropdownContainer = document.getElementById('contact-dropdown');
    const assignedInput = document.getElementById('assigned');

    if (!dropdownContainer || !assignedInput) {
        console.error('Contact dropdown container or assigned input not found.');
        return;
    }

    async function loadContacts() {
        try {
            const response = await fetch('/joinDB.json');
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            const contacts = Object.values(data.contacts);
            createLetterGroups(contacts);
        } catch (error) {
            console.error('Error loading contacts:', error);
        }
    }

    function createLetterGroups(contacts) {
        const container = document.getElementById('contact-dropdown');
        if (!container) {
            console.error('Element mit ID "contact-dropdown" nicht gefunden.');
            return;
        }

        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

        alphabet.forEach(letter => {
            const letterContacts = contacts.filter(contact => contact.name.toUpperCase().startsWith(letter));

            if (letterContacts.length > 0) {
                const letterGroup = document.createElement('div');
                letterGroup.classList.add('letter-group');

                const letterHeader = document.createElement('h2');
                letterHeader.textContent = letter;
                letterGroup.appendChild(letterHeader);

                letterContacts.forEach(contact => {
                    const contactElement = document.createElement('div');
                    contactElement.classList.add('contact');
                    contactElement.textContent = contact.name;
                    letterGroup.appendChild(contactElement);
                });

                container.appendChild(letterGroup);
            }
        });
    }

    loadContacts();
}

// Funktion zum Initialisieren des "Add Contact" Buttons
function initializeAddContactButton() {
    const addContactButton = document.getElementById('add-contact-button');
    if (addContactButton) {
        addContactButton.addEventListener('click', openAddContactOverlay);
    } else {
        console.error('Add contact button not found.');
    }
}

// Funktion zum Öffnen des Kontakt-Overlays
function openAddContactOverlay() {
    console.log('Opening add contact overlay');
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', init);
