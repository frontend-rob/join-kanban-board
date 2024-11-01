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

// Funktion zum Anzeigen/Verstecken des Dropdowns beim Klicken auf das Icon
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        dropdown.classList.toggle("hidden");
        console.log("Dropdown content:", dropdown.innerHTML); // Zeigt den gesamten Inhalt des Dropdowns
        console.log("Dropdown toggled:", dropdown.classList.contains("hidden") ? "hidden" : "visible");
    }
}

// Kontakte-Dropdown Initialisierung und API-Aufruf
function initializeContactsDropdown() {
    const dropdownContainer = document.getElementById('contact-dropdown');
    const contacts = []; // Kontakte aus Firebase-Datenbank

    if (!dropdownContainer) {
        console.error('Contact dropdown container not found.');
        return;
    }

    // API-Aufruf zur Firebase-Datenbank
    async function loadContacts() {
        try {
            console.log("Loading contacts...");
            const response = await fetch('https://join-379-kanban-board-default-rtdb.europe-west1.firebasedatabase.app/contacts.json');
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
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

    // Dropdown mit Kontakten füllen
    function renderDropdown() {
        const dropdownContainer = document.getElementById('contact-dropdown');
        dropdownContainer.innerHTML = ''; // Zurücksetzen
        console.log("Rendering contacts in dropdown...");
    
        contacts.forEach(contact => {
            const contactDiv = document.createElement('div');
            contactDiv.classList.add('contact-option');
            contactDiv.innerHTML = `
                <div class="contact-avatar" style="background-color: ${getRandomColor()}">${getInitials(contact.name)}</div>
                <span>${contact.name}</span>
                <input type="checkbox" onclick="selectContact('${contact.id}', '${contact.name}')">
            `;
            dropdownContainer.appendChild(contactDiv);
            console.log("Contact added:", contact); // Sicherstellen, dass jeder Kontakt gerendert wird
        });
    }

    // Zufällige Farbe für Avatar
    function getRandomColor() {
        const colors = ['#FF5733', '#33C1FF', '#8E44AD', '#FFC300', '#DAF7A6'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Initialen des Namens generieren
    function getInitials(name) {
        return name.split(' ').map(part => part[0]).join('');
    }

    loadContacts();
}

// Kontakt auswählen und anzeigen
function selectContact(id, name) {
    const selectedContactsDiv = document.getElementById('selected-contacts');

    // Überprüfen, ob der Kontakt bereits ausgewählt ist
    if (Array.from(selectedContactsDiv.children).some(child => child.getAttribute('data-id') === id)) {
        console.warn(`Contact with id ${id} is already selected.`);
        return;
    }
    
    // Avatar erstellen und anzeigen
    const avatar = document.createElement('div');
    avatar.className = 'contact-avatar';
    avatar.style.backgroundColor = getRandomColor();
    avatar.setAttribute('data-id', id); // Hinzufügen der Kontakt-ID als Attribut
    avatar.innerText = getInitials(name);
    
    selectedContactsDiv.appendChild(avatar);
    console.log("Contact selected:", name); // Log für jeden ausgewählten Kontakt
}

// Eventlistener für das Icon, um Dropdown bei Klick anzuzeigen/zu verstecken
document.addEventListener("click", function (event) {
    const optionsDiv = document.getElementById("contact-dropdown");
    const icon = document.querySelector(".input-field svg");

    if (icon && icon.contains(event.target)) {
        toggleDropdown("contact-dropdown"); // Toggle nur bei Klick auf das Icon
    } else if (optionsDiv && !optionsDiv.contains(event.target)) {
        optionsDiv.classList.add("hidden"); // Dropdown schließen, wenn außerhalb geklickt wird
    }
});

// Initialisierungsfunktion
function init() {
    includeHTML(() => {
        initializeFlatpickr();
        initializePrioButtons();
        initializeContactsDropdown();
        
        // Überprüfung und optionales Initialisieren des Add Contact Buttons
        const addContactButton = document.getElementById('add-contact-button');
        if (addContactButton) {
            addContactButton.addEventListener('click', openAddContactOverlay);
        }
    });
}

// Flatpickr-Initialisierung
function initializeFlatpickr() {
    const dueDateInput = document.getElementById('due-date');
    if (!dueDateInput) {
        console.error('Due date input not found.');
        return;
    }

    flatpickr(dueDateInput, {
        minDate: "today",
        dateFormat: "d/m/Y",
        locale: { firstDayOfWeek: 1 },
        animate: true,
        disableMobile: true  // Deaktiviert die mobile Datumsanzeige
    });
}

// Prio-Buttons Initialisierung
function initializePrioButtons() {
    const buttons = document.querySelectorAll('.prio-button');
    if (buttons.length > 0) {
        buttons.forEach(button => {
            button.addEventListener('click', function () {
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    } else {
        console.error('Keine .prio-button Elemente gefunden.');
    }
}

// Funktion zum Öffnen des Kontakt-Overlays
function openAddContactOverlay() {
    console.log('Opening add contact overlay');
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', init);
