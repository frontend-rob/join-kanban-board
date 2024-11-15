/**
 * Initialisiert den Startinhalt, rendert die Hauptelemente der Seite und
 * setzt Navigations- und Ausrichtungseinschränkungen auf mobilen Geräten.
 * 
 * @async
 * @returns {Promise<void>} - Ein Promise, das aufgelöst wird, sobald der Startinhalt vollständig initialisiert ist.
 */
async function initAddTask() {
  await renderAddTaskContent();
  await setUserDataFromLocalStorage();
  initializeNavigation();
  preventLandscapeOnMobileDevices();
}

/**
 * Rendert den primären Seiteninhalt, indem Vorlagen in spezifische Seitenelemente geladen werden.
 * 
 * @async
 * @returns {Promise<void>} - Ein Promise, das aufgelöst wird, sobald der Inhalt erfolgreich gerendert wurde.
 */
async function renderAddTaskContent() {
  const addTaskComponents = getAddTaskComponents();
  loadAddTaskTemplates(addTaskComponents);
}

/**
 * Ruft die wesentlichen Komponenten der Seite ab, indem relevante DOM-Elemente identifiziert werden.
 * 
 * @returns {Object} - Ein Objekt, das Referenzen zu wichtigen Seitenelementen enthält.
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

// ! contact dropdown Einstellungen der Dropdown-Liste
function initContactDropdown() {
  document.getElementById('contact-dropdown-icon')
      .addEventListener('click', toggleContactDropdown);
  document.addEventListener('click', closeDropdownOnClickOutside);
}

// Fügt Klick-Event-Listener zu allen Kontakt-Checkboxen hinzu, um deren Status zu toggeln
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.contact-checkbox').forEach(label => {
      label.addEventListener('click', (event) => {
          event.preventDefault(); // Verhindert Standardverhalten des Labels
          const checkbox = label.querySelector('input[type="checkbox"]');
          if (checkbox) checkbox.checked = !checkbox.checked; // Toggle Checkbox-Status
      });
  });
});

// Funktion zum Umschalten des Kontakt-Dropdowns
function toggleContactDropdown() {
  const dropdown = document.getElementById('contact-dropdown');
  const icon = document.getElementById('contact-dropdown-icon');
  dropdown.classList.toggle('hidden');
  icon.classList.toggle('rotated');  // Diese Zeile dreht das Icon

  if (dropdown.classList.contains('show')) {
      renderContacts();
  }
}

function closeDropdownOnClickOutside(event) {
  const contactDropdown = document.getElementById('contact-dropdown');
  const contactInput = document.getElementById('assigned-to');

  // Prüfen, ob der Klick außerhalb von Dropdown und Input war
  if (contactDropdown && !contactDropdown.contains(event.target) &&
      contactInput && !contactInput.contains(event.target)) {
      
      // Prüfen, ob der Klick auf eine Checkbox war, die innerhalb des Dropdowns liegt
      if (!event.target.closest('.contact-checkbox')) {
          contactDropdown.classList.add('hidden'); // Schließe das Dropdown
          contactDropdown.classList.remove('show'); // Entferne die Show-Klasse
          document.getElementById('contact-dropdown-icon').classList.remove('rotated'); // Setze das Icon zurück
      }
  }
}

// Event-Listener hinzufügen
document.addEventListener('click', closeDropdownOnClickOutside);

function selectContact(checkbox) {
  const selected = document.getElementById('selected-contacts');
  if (checkbox.checked) {
      selected.innerHTML = `<span id="selected-${checkbox.id}">${checkbox.id}</span>`;
  } else {
      document.getElementById(`selected-${checkbox.id}`).remove();
  }
}

function resetContacts() {
  document.querySelectorAll('.contact-checkbox input').forEach(cb => cb.checked = false);
  document.getElementById('selected-contacts').innerHTML = '';
}

// Funktion zum Zurücksetzen des Formulars
function clearInputForm() {
  const form = document.getElementById('add-task-form');
  form.reset(); // Setzt alle Eingabefelder zurück
  document.querySelectorAll('.error-messages').forEach(e => e.textContent = ''); // Löscht Fehlermeldungen
  document.querySelectorAll('input, textarea').forEach(i => i.style.borderColor = ''); // Rahmenfarbe zurücksetzen
  
  // Priorität auf "Medium" zurücksetzen
  document.getElementById('mid-priority-button').classList.add('clicked');
  document.querySelectorAll('.prio-buttons button').forEach(b => {
      if (b.id !== 'mid-priority-button') b.classList.remove('clicked');
  });

  // Subtasks zurücksetzen
  document.getElementById('subtask-list').innerHTML = ''; // Entfernt alle Subtasks

  // Kontakte zurücksetzen
  document.getElementById('selected-contacts').innerHTML = ''; // Entfernt alle ausgewählten Kontakte

  // Checkboxen zurücksetzen
  document.querySelectorAll('.contact-checkbox input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false;
  });
  
  document.addEventListener('DOMContentLoaded', function() {
    resetContactsOnPageLoad(); // Neue Funktion für Reset
    initAddTask(); // Bestehende Initialisierung
});

  // taskPriority zurücksetzen
  taskPriority = '';

  // Kontakt-Dropdown-Icon zurücksetzen
  document.getElementById('contact-dropdown-icon').classList.remove('rotated');
}

// Event-Listener für das Formular hinzufügen
document.getElementById('add-task-form').addEventListener('submit', function(event) {
  event.preventDefault(); // Verhindert das Standard-Formularverhalten
  addTask(event); // Ruft die Funktion zum Hinzufügen der Aufgabe auf
  clearInputForm(); // Setzt das Formular zurück
});

// Event-Listener für den Reset-Button hinzufügen
document.getElementById('clear-btn').addEventListener('click', clearInputForm);

function resetErrorMessages() {
  document.querySelectorAll('.error-messages').forEach(e => e.textContent = '');
}

function resetSubtasks() {
  document.getElementById('subtask-list').innerHTML = '';
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', initContactDropdown);

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
// Template muss vor createContactItemHTML verfügbar sein
const contactTemplate = (contactId, color = 'gray', initials = 'NA', name = 'Unknown') => `
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
  if (!contactId || !contact || !contact.name) {
      console.error('Invalid contact data:', { contactId, contact });
      return ''; // Leeres HTML zurückgeben, um den Fehler zu verhindern
  }

  const contactItemHTML = `
      <div class="contact-item" data-id="${contactId}">
          <div class="contact-info">
              <div class="profil-icon" style="background-color: ${contact.color || 'gray'};">
                  ${contact.initials || 'NA'}
              </div>
              <div class="contact-details">
                  <p class="contact-name">${contact.name}</p>
                  ${isUserContact ? '<span class="user-indicator">(You)</span>' : ''}
              </div>
          </div>
          <label class="contact-checkbox">
              <input type="checkbox" id="${contactId}"/>
          </label>
      </div>
  `;

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
function resetContactsOnPageLoad() {
  // Alle Checkboxen im Dokument zurücksetzen
  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false; // Setze alle Checkboxen auf "unchecked"
  });

  // Entferne alle ausgewählten Kontakte (falls vorhanden)
  const selectedIconsContainer = document.getElementById('selected-contacts');
  if (selectedIconsContainer) selectedIconsContainer.innerHTML = '';

  // Lösche Checkbox-Zustände aus dem Cache (localStorage)
  localStorage.removeItem('checkboxStates');
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

// Initialisierung
document.addEventListener('DOMContentLoaded', function() {
    resetContactsOnPageLoad(); // Kontakte und Checkboxen zurücksetzen
    initAddTask(); // Initialisiere die Seite
});