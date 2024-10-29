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
                    
                    // Wenn alle Elemente geladen sind, rufe die Callback-Funktion auf
                    if (loadedElements === elements.length) {
                        callback();
                    }
                }
            } catch (err) {
                console.error(`Error fetching ${file}: `, err);
                el.innerHTML = "Content not found.";
                loadedElements++;
                
                // Wenn alle Elemente geladen sind, rufe die Callback-Funktion auf
                if (loadedElements === elements.length) {
                    callback();
                }
            }
        }
    });
}

// Initialisierungsfunktion
function init() {
    includeHTML(() => {
        // Rufe die Initialisierungsfunktionen erst auf, nachdem includeHTML fertig ist
        initializeFlatpickr();
        initializePrioButtons();
        initializeContactsDropdown();
        initializeAddContactButton();
    });
}

// Flatpickr-Initialisierung
function initializeFlatpickr() {
    const dueDateInput = document.getElementById('due-date');
    const logo = document.querySelector('#logo-svg');

    if (!dueDateInput) {
        console.error('Due date input not found. Check if the element exists and the ID is correct.');
        return;
    }

    // Prüfen, ob Flatpickr bereits initialisiert wurde
    if (dueDateInput._flatpickr) {
        console.warn('Flatpickr ist bereits initialisiert.');
        return;
    }

    // Flatpickr initialisieren
    const calendar = flatpickr(dueDateInput, {
        minDate: "today",
        dateFormat: "m/d/Y",
        locale: { firstDayOfWeek: 1 },
        animate: true,
        onReady: function(selectedDates, dateStr, instance) {
            if (instance && instance.calendarContainer) {
                instance.calendarContainer.classList.add('initialized');
            }
        }
    });

    // Event-Listener für das Datumseingabefeld hinzufügen, um den Kalender zu öffnen
    dueDateInput.addEventListener('focus', () => {
        if (calendar && typeof calendar.open === 'function') {
            calendar.open();
        }
    });

    // Event-Listener für das SVG-Icon hinzufügen
    if (logo) {
        logo.addEventListener('click', () => {
            if (calendar && typeof calendar.open === 'function') {
                calendar.open();
            }
        });
    } else {
        console.warn('Element mit ID #logo-svg konnte nicht gefunden werden.');
    }

    // Verhindern, dass der Benutzer direkt in das Eingabefeld schreibt
    dueDateInput.addEventListener('keydown', (e) => {
        e.preventDefault();
    });
}

// Funktion aufrufen, wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', initializeFlatpickr);

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
                button.style.boxShadow = `0 0 15px ${backgroundColor}`;
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
        console.error('Keine Elemente mit der Klasse .prio-button gefunden.');
    }
}

// Kontakte-Dropdown Initialisierung
function initializeContactsDropdown() {
    const dropdownContainer = document.getElementById('contact-dropdown');
    const assignedInput = document.getElementById('assigned');

    if (!dropdownContainer || !assignedInput) {
        console.error('Contact dropdown container or assigned input not found. Check if the elements exist and the IDs are correct.');
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
            console.error('Element mit ID "contact-dropdown" wurde nicht gefunden. Sicherstellen, dass dieses HTML-Element existiert.');
            return;  // Abbruch, falls das Element fehlt
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
        console.error('Add contact button not found. Check if the element with id "add-contact-button" exists in your HTML.');
    }
}

// Funktion zum Öffnen des Kontakt-Overlays
function openAddContactOverlay() {
    console.log('Opening add contact overlay');
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', init);
