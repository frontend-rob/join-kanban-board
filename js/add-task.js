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
  initializeDatePicker("#due-date");
  addInputEventListeners();
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


// ! priority btn

let taskPriority = '';


/**
 * sets the task priority and updates button styles
 *
 * @param {HTMLElement} button - the clicked priority button
 */
function setPriority(button) {
  document.querySelectorAll('.prio-buttons .btn').forEach(btn => {
    btn.classList.remove('clicked');
  });

  button.classList.add('clicked');
  switch (button.id) {
    case 'high-priority-button':
      taskPriority = 'high';
      break;
    case 'mid-priority-button':
      taskPriority = 'mid';
      break;
    case 'low-priority-button':
      taskPriority = 'low';
      break;
  }
}


// ! datepicker
/**
 * initializes the Flatpickr date picker.
 * 
 * @param {string} selector - the ID of the input field to apply Flatpickr.
 */
function initializeDatePicker(selector) {
  flatpickr(selector, {
    minDate: "today",
    dateFormat: "Y-m-d",
    altInput: false,
    altFormat: "Y-m-d",
    disableMobile: "true",
    nextArrow: ">",
    prevArrow: "<"
  });
}


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
 * toggles the visibility of the contact dropdown and rotates the dropdown icon.
 */
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


/**
 * closes the contact dropdown and resets the icon rotation.
 */
function closeContactDropdown() {
  const contactDropdown = document.getElementById('contact-dropdown');
  const contactDropdownIcon = document.getElementById('contact-dropdown-icon');

  contactDropdown.classList.add('hidden');
  contactDropdown.classList.remove('show');
  contactDropdownIcon.classList.remove('rotated');
}


/**
 * closes the contact dropdown when a click occurs outside of the dropdown or input field.
 * 
 * @param {MouseEvent} event - the mouse event triggered by a click.
 */
document.addEventListener('click', function (event) {
  const assignedInput = document.getElementById('assigned-to');
  const contactDropdown = document.getElementById('contact-dropdown');

  if (!assignedInput.contains(event.target) && !contactDropdown.contains(event.target)) {
    closeContactDropdown();
  }
});


let allContacts = []; // array, das alle Kontakte speichert, wenn sie einmal abgerufen wurden

/**
 * fetches all contacts from the firebase database.
 * 
 * @async
 * @returns {Promise<Array<Object>|null>} an array of contacts if successful, otherwise null.
 */
async function fetchContacts() {
  const response = await fetch(`${DB_URL}/contacts.json`);

  if (!response.ok) {
    throw new Error('Failed to fetch contacts from Firebase: Network response was not ok.');
  }

  const contactsObj = await response.json();

  const contacts = Object.entries(contactsObj).map(([contactId, contact]) => ({
    ...contact,
    id: contactId
  }));

  allContacts = contacts;
  return contacts;
}


/**
 * generates the contact item template for the dropdown.
 * 
 * @param {string} contactId - the unique id of the contact.
 * @param {string} color - the background color for the contact's initials.
 * @param {string} initials - the initials of the contact.
 * @param {string} name - the full name of the contact.
 * @returns {string} the html template string for the contact item.
 */
const contactTemplate = (contactId, color, initials, name, isChecked) => `
    <div class="contact-item" data-id="${contactId}">
        <div class="contact-info">
            <div class="profil-icon" style="background-color: ${color};">
                ${initials}
            </div>
            <div class="contact-details">
                <p class="contact-name">${name}</p>
            </div>
        </div>
        <label class="contact-checkbox ${isChecked ? 'checked' : 'unchecked'}">
            <!-- Verstecke die Standard-Checkbox -->
            <input type="checkbox" id="${contactId}" ${isChecked ? 'checked' : ''} />
            <!-- Das SVG-Icon für die Checkbox, je nach Status -->
            <img src="../assets/icons/${isChecked ? 'checked-dark.svg' : 'unchecked.svg'}" alt="checkbox icon" />
        </label>
    </div>
`;


/**
 * saves the state of a contact checkbox in local storage.
 * 
 * @param {string} contactId - the unique id of the contact.
 * @param {boolean} isChecked - the current state of the checkbox.
 */
function toggleCheckboxState(contactId, isChecked) {
  const checkboxStates = JSON.parse(localStorage.getItem('checkboxStates')) || {};
  checkboxStates[contactId] = isChecked;
  localStorage.setItem('checkboxStates', JSON.stringify(checkboxStates));
}


/**
 * restores the state of contact checkboxes and applies 'active' classes from local storage.
 */
function updateCheckboxesState() {
  const checkboxes = document.querySelectorAll('.contact-checkbox input[type="checkbox"]');
  const checkboxStates = getCheckboxStates();

  checkboxes.forEach(checkbox => updateContactItemState(checkbox, checkboxStates));
}


/**
 * retrieves the stored checkbox states from local storage.
 * 
 * @returns {object} - the stored states of checkboxes, defaulting to an empty object if not found.
 */
function getCheckboxStates() {
  return JSON.parse(localStorage.getItem('checkboxStates')) || {};
}


/**
 * updates the visual and functional state of a contact item.
 * 
 * @param {htmlinputelement} checkbox - the checkbox element to update.
 * @param {object} checkboxStates - the stored states of checkboxes.
 */
function updateContactItemState(checkbox, checkboxStates) {
  const contactItem = checkbox.closest('.contact-item');
  const contactId = contactItem.getAttribute('data-id');
  const isChecked = checkboxStates[contactId] || false;

  updateCheckboxIcon(checkbox, isChecked);
  updateContactItemClass(contactItem, checkbox, isChecked);
}


/**
 * updates the checkbox icon based on its checked state.
 * 
 * @param {htmlinputelement} checkbox - the checkbox element.
 * @param {boolean} isChecked - the checked state of the checkbox.
 */
function updateCheckboxIcon(checkbox, isChecked) {
  const img = checkbox.closest('.contact-checkbox').querySelector('img');
  if (img) {
    img.src = `../assets/icons/${isChecked ? 'checked-dark.svg' : 'unchecked.svg'}`;
  }
}


/**
 * updates the class and checked state of a contact item.
 * 
 * @param {htmlelement} contactItem - the contact item element.
 * @param {htmlinputelement} checkbox - the checkbox element within the contact item.
 * @param {boolean} isChecked - the checked state of the checkbox.
 */
function updateContactItemClass(contactItem, checkbox, isChecked) {
  checkbox.checked = isChecked;
  if (isChecked) {
    contactItem.classList.add('active');
  } else {
    contactItem.classList.remove('active');
  }
}


/**
 * creates the html structure for a contact item.
 * 
 * @param {string} contactId - the unique id of the contact.
 * @param {object} contact - the contact object containing details like color, initials, and name.
 * @param {string} contact.color - the background color for the contact's initials.
 * @param {string} contact.initials - the initials of the contact.
 * @param {string} contact.name - the full name of the contact.
 * @param {boolean} [isUserContact=false] - whether the contact is the current user.
 * @returns {string} the html string for the contact item.
 */
function createContactItemHTML(contactId, contact, isUserContact = false) {
  const isChecked = getCheckboxState(contactId);
  const checkboxHTML = generateCheckboxHTML(contactId, isChecked);
  const userIndicatorHTML = isUserContact ? '<span class="user-indicator">(you)</span>' : '';

  return `
        <div class="contact-item ${isUserContact ? 'user-contact' : ''}" data-id="${contactId}">
            <div class="contact-info">
                <div class="profil-icon" style="background-color: ${contact.color};">
                    ${contact.initials}
                </div>
                <div class="contact-details">
                    <p class="contact-name">
                        ${contact.name} ${userIndicatorHTML}
                    </p>
                </div>
            </div>
            ${checkboxHTML}
        </div>
    `;
}


/**
 * retrieves the checkbox state for a contact from local storage.
 * 
 * @param {string} contactId - the unique id of the contact.
 * @returns {boolean} the checked state of the checkbox.
 */
function getCheckboxState(contactId) {
  const checkboxStates = JSON.parse(localStorage.getItem('checkboxStates')) || {};
  return checkboxStates[contactId] || false;
}


/**
 * generates the html for a checkbox with its associated icon.
 * 
 * @param {string} contactId - the unique id of the contact.
 * @param {boolean} isChecked - the checked state of the checkbox.
 * @returns {string} the html string for the checkbox element.
 */
function generateCheckboxHTML(contactId, isChecked) {
  return `
        <label class="contact-checkbox ${isChecked ? 'checked' : 'unchecked'}">
            <input type="checkbox" id="${contactId}" ${isChecked ? 'checked' : ''} />
            <img src="../assets/icons/${isChecked ? 'checked-dark.svg' : 'unchecked.svg'}" alt="checkbox icon" />
        </label>
    `;
}


/**
 * adds a user indicator to a specific contact item in the dom.
 * 
 * @param {string} contactId - the unique id of the contact.
 */
function renderUserIndicator(contactId) {
  const contactItem = document.querySelector(`.contact-item[data-id="${contactId}"]`);
  if (contactItem) {
    const contactNameElement = contactItem.querySelector('.contact-name');
    contactNameElement.innerHTML += ' <span class="user-indicator">(you)</span>';
  }
}


/**
 * adds the contact to the selected contacts container.
 * 
 * @param {string} contactId - the unique id of the contact.
 * @param {string} color - the background color for the contact's initials.
 * @param {string} initials - the initials of the contact.
 */
function addSelectedContactIcon(contactId, color, initials) {
  const existingIcon = document.querySelector(`#selected-contacts .selected-profile-icon[data-id="${contactId}"]`);
  if (!existingIcon) {
    const selectedIcon = `
            <div class="selected-profile-icon" style="background-color: ${color};" data-id="${contactId}">
                ${initials}
            </div>
        `;
    document.getElementById('selected-contacts').innerHTML += selectedIcon;
  }
}


/**
 * adds a contact's profile icon to the selected contacts section.
 * 
 * @param {string} contactId - the unique id of the contact to be added.
 */
function addSelectedContacts(contactId) {
  const contact = allContacts.find(c => c.id === contactId);

  if (contact) {
    addSelectedContactIcon(contactId, contact.color, contact.initials);
  }
}


/**
 * removes the contact's profile icon from the selected contacts container.
 * 
 * @param {string} contactId - the unique id of the contact to be removed.
 */
function removeSelectedContactIcon(contactId) {
  const selectedIcons = document.querySelectorAll('.selected-profile-icon');
  selectedIcons.forEach(icon => {
    if (icon.getAttribute('data-id') === contactId) {
      icon.remove();
    }
  });
}


/**
 * handles the click on a contact card, toggling the checkbox and updating selected contact icons.
 * 
 * @param {HTMLElement} contactItem - the clicked contact card element.
 */
function handleContactClick(contactItem) {
  const { checkbox, checkboxLabel, contactId, isChecked } = getContactDetails(contactItem);

  toggleCheckboxState(contactId, isChecked);
  updateCheckboxIcon(checkboxLabel, isChecked);
  toggleContactSelection(contactItem, contactId, isChecked);
}


/**
 * Retrieves the details of the contact from the contact item.
 * 
 * @param {HTMLElement} contactItem - the contact card element.
 * @returns {Object} - Contains checkbox, checkboxLabel, contactId, and isChecked.
 */
function getContactDetails(contactItem) {
  const checkbox = contactItem.querySelector('input[type="checkbox"]');
  const checkboxLabel = contactItem.querySelector('.contact-checkbox');
  const contactId = contactItem.getAttribute('data-id');
  const isChecked = !checkbox.checked;

  checkbox.checked = isChecked;

  return { checkbox, checkboxLabel, contactId, isChecked };
}

/**
 * Updates the checkbox icon based on its checked state.
 * 
 * @param {HTMLElement} checkboxLabel - the label containing the checkbox icon.
 * @param {boolean} isChecked - the new checked state of the checkbox.
 */
function updateCheckboxIcon(checkboxLabel, isChecked) {
  const img = checkboxLabel.querySelector('img');
  if (img) {
    img.src = `../assets/icons/${isChecked ? 'checked-dark.svg' : 'unchecked.svg'}`;
  }
}


/**
 * toggles the contact selection status by updating the icons and adding/removing styles.
 * 
 * @param {HTMLElement} contactItem - the contact card element.
 * @param {string} contactId - the unique id of the contact.
 * @param {boolean} isChecked - whether the checkbox is checked.
 */
function toggleContactSelection(contactItem, contactId, isChecked) {
  const initials = contactItem.querySelector('.profil-icon').innerText;
  const color = contactItem.querySelector('.profil-icon').style.backgroundColor;

  if (isChecked) {
    addSelectedContactIcon(contactId, color, initials);
    contactItem.classList.add('active');
  } else {
    removeSelectedContactIcon(contactId);
    contactItem.classList.remove('active');
  }
}


/**
 * fetches and renders contacts in the dropdown.
 * ensures the user contact appears first and the rest are sorted alphabetically.
 */
async function renderContacts() {
  const contactDropdown = prepareContactDropdown();

  const contacts = await fetchContacts();
  if (!contacts) {
    displayError(contactDropdown);
    return;
  }

  const sortedContacts = sortContactsAlphabetically(contacts);
  const updatedContacts = prioritizeUserContact(sortedContacts);

  renderContactList(contactDropdown, updatedContacts);
  initializeContactInteractions();
}


/**
 * prepares the contact dropdown for rendering.
 * @returns {HTMLElement} the prepared contact dropdown element.
 */
function prepareContactDropdown() {
  const contactDropdown = document.getElementById('contact-dropdown');
  contactDropdown.classList.remove('hidden');
  contactDropdown.innerHTML = '';
  return contactDropdown;
}


/**
 * sorts the contacts alphabetically by their name.
 * @param {Array<Object>} contacts - the list of contacts.
 * @returns {Array<Object>} the sorted contact list.
 */
function sortContactsAlphabetically(contacts) {
  return contacts.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
}


/**
 * moves the user contact to the top of the contact list if it exists.
 * @param {Array<Object>} contacts - the sorted list of contacts.
 * @returns {Array<Object>} the updated contact list with the user contact prioritized.
 */
function prioritizeUserContact(contacts) {
  const userContact = getUserContact(contacts);
  if (userContact) {
    moveUserContactToTop(contacts, userContact);
  }
  return contacts;
}


/**
 * renders the contact list into the dropdown.
 * @param {HTMLElement} contactDropdown - the dropdown element.
 * @param {Array<Object>} contacts - the list of contacts to render.
 */
function renderContactList(contactDropdown, contacts) {
  renderContactItems(contactDropdown, contacts);
}


/**
 * initializes the interactions for the contacts (checkboxes and click listeners).
 */
function initializeContactInteractions() {
  updateCheckboxesState();
  addContactClickListeners();
}


/**
 * displays an error message when contacts can't be loaded.
 * @param {HTMLElement} contactDropdown - the contact dropdown element to update.
 */
function displayError(contactDropdown) {
  contactDropdown.innerHTML = '<p>error loading contacts.</p>';
}


/**
 * retrieves the user contact from the list of contacts.
 * @param {Array} contacts - the list of all contacts.
 * @returns {Object|null} - the user contact object or null if not found.
 */
function getUserContact(contacts) {
  const userName = localStorage.getItem('userName');
  if (!userName) return null;

  const userContactIndex = contacts.findIndex(contact => contact.name === userName);
  if (userContactIndex !== -1) {
    const userContact = contacts.splice(userContactIndex, 1)[0];
    userContact.isUserContact = true;
    return userContact;
  }

  return null;
}



/**
 * moves the user contact to the top of the contacts list.
 * @param {Array} contacts - the list of all contacts.
 * @param {Object} userContact - the user contact object.
 */
function moveUserContactToTop(contacts, userContact) {
  userContact.isUserContact = true;
  contacts.unshift(userContact);
}


/**
 * renders the contact items in the dropdown.
 * @param {HTMLElement} contactDropdown - the dropdown element to populate.
 * @param {Array} contacts - the list of contacts to render.
 */
function renderContactItems(contactDropdown, contacts) {
  const contactItemsHTML = contacts
    .map(contact => createContactItemHTML(contact.id, contact, contact.isUserContact))
    .join('');
  contactDropdown.innerHTML = contactItemsHTML;
}


/**
 * adds click listeners to all contact items to toggle checkboxes and icons.
 */
function addContactClickListeners() {
  const contactItems = document.querySelectorAll('.contact-item');
  contactItems.forEach(contactItem => {
    contactItem.addEventListener('click', () => handleContactClick(contactItem));
  });
}



/**
 * toggles the visibility of the contact dropdown and updates the icon rotation.
 */
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


/**
 * filters contacts based on the search term and updates the dropdown display.
 */
function searchContacts() {
  const searchTerm = document.getElementById('assigned-to').value.toLowerCase();

  const filteredContacts = allContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm)
  );

  renderFilteredContacts(filteredContacts);
}


/**
 * renders the dropdown with the filtered list of contacts.
 * if no contacts match, displays a 'no contacts found' message.
 * 
 * @param {Array} contacts - list of filtered contacts to render
 */
function renderFilteredContacts(contacts) {
  const contactDropdown = document.getElementById('contact-dropdown');
  contactDropdown.innerHTML = '';

  if (contacts.length === 0) {
    contactDropdown.innerHTML = '<p>no contacts found.</p>';
    return;
  }

  const contactItemsHTML = contacts.map(contact =>
    createContactItemHTML(contact.id, contact)
  ).join('');

  contactDropdown.innerHTML = contactItemsHTML;

  updateCheckboxesState();
  addContactClickListeners();
}


// ! validation
/**
 * validates the task form.
 *
 * @returns {boolean} true if the form is valid, false otherwise.
 */
function validateTaskForm() {
  const inputs = getTaskFormInputs();
  const validations = validateTaskInputs(inputs);
  return areAllTaskValid(validations);
}


/**
 * retrieves the form input elements for the task form.
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
 * validates all input fields in the task form.
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
 * checks if all validations are true.
 * 
 * @param {Object} validations - the validation results.
 * @returns {boolean} true if all validations are valid, false otherwise.
 */
function areAllTaskValid(validations) {
  return Object.values(validations).every(valid => valid);
}


/**
 * clears the task form inputs.
 * 
 * @param {Object} inputs - the form input elements.
 */
function clearTaskForm(inputs) {
  inputs.title.value = '';
  inputs.dueDate.value = '';
  inputs.category.value = '';
}


/**
 * updates the error state of a task input field and its corresponding error message.
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
 * validates the task title input.
 * checks if the title is not empty.
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
 * validates the task due date input.
 * checks if the due date is selected.
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
 * validates the task category input.
 * checks if the category is selected.
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
 * adds event listeners to inputs for real-time error handling.
 */
function addInputEventListeners() {
  const titleInput = document.getElementById('task-title');
  const dueDateInput = document.getElementById('due-date');
  const categoryInput = document.getElementById('task-category');

  titleInput.addEventListener('input', function () {
    const errorTitle = document.getElementById('error-task-title');
    setTaskInputErrorState(titleInput, errorTitle, titleInput.value.trim() !== '');
  });

  dueDateInput.addEventListener('input', function () {
    const errorDueDate = document.getElementById('error-due-date');
    setTaskInputErrorState(dueDateInput, errorDueDate, dueDateInput.value.trim() !== '');
  });

  categoryInput.addEventListener('input', function () {
    const errorCategory = document.getElementById('error-task-category');
    setTaskInputErrorState(categoryInput, errorCategory, categoryInput.value.trim() !== '');
  });
}


// ! Add task to Firebase

/**
 * handles the task addition process by validating the form, gathering data,
 * collecting subtasks, and saving the task to the database.
 * @param {Event} event - the submit event triggered by the form.
 */
async function addTask(event) {
  event.preventDefault();

  if (!validateTaskForm()) return;

  const taskData = gatherTaskData();
  const subtasks = collectSubtasks();

  taskData.subtasks = subtasks;

  try {
    const response = await saveTaskToDatabase(taskData);
    if (!response.ok) throw new Error('error adding task to firebase.');

    handleTaskSuccess();
    await reloadTasksInBoard(response, taskData);

  } catch (error) {
    handleTaskError();
  }
}

/**
 * processes the task response by checking if the 'add-task-content' element exists,
 * and if so, updates the task data and the task template.
 * @param {Object} response - the response object from the database.
 * @param {Object} taskData - the task data to be updated.
 */
async function reloadTasksInBoard(response, taskData) {
  const addTaskContent = document.getElementById('add-task-content');
  if (!addTaskContent) {
    return;
  }

  const responseData = await response.json();
  const newTaskId = responseData.name;

  taskData.id = newTaskId;
  allTasks[newTaskId] = taskData;

  getTaskTemplate(allTasks);
}




let taskStatus = 'todo';

/**
 * gathers the task data from the form inputs.
 * @returns {object} - the task data object containing title, description, 
 * due date, category, priority, and assigned contacts.
 */
function gatherTaskData() {
  const taskTitle = document.getElementById('task-title').value;
  const taskDescription = document.getElementById('task-description').value;
  const dueDate = document.getElementById('due-date').value;
  const taskCategory = document.getElementById('task-category').value;
  const taskPriority = getTaskPriority();

  const selectedContacts = getSelectedContacts();

  return {
    title: taskTitle,
    description: taskDescription,
    due_date: dueDate,
    category: taskCategory,
    status: taskStatus,
    priority: taskPriority,
    assigned_to: selectedContacts
  };
}


/**
 * retrieves the priority of the task, defaults to 'mid' if not set.
 * @returns {string} - the priority of the task.
 */
function getTaskPriority() {
  return taskPriority || 'mid';
}


/**
 * collects the selected contacts from the UI.
 * @returns {array} - an array of selected contact objects.
 */
function getSelectedContacts() {
  const selectedIcons = document.querySelectorAll('.selected-profile-icon');
  const selectedContacts = [];

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

  return selectedContacts;
}


/**
 * saves the task data to the database.
 * @param {object} taskData - the task data to be saved.
 * @returns {Promise<Response>} - the fetch response from the database.
 */
async function saveTaskToDatabase(taskData) {
  const response = await fetch(`${DB_URL}/tasks.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskData)
  });
  return response;
}


/**
 * handles the success scenario after a task is added.
 */
function handleTaskSuccess() {
  if (document.getElementById('add-task-content')) {
    closeAddTaskOverlay();
  }
  showTaskAddedModal();
  clearInputForm();
}


/**
 * handles the error scenario if there was an issue adding the task.
 */
function handleTaskError() {
  alert('error adding task. please try again later.');
}


/**
 * collects all subtasks from the current task form.
 * each subtask is stored with its text and a default status of 'unchecked'.
 * 
 * @returns {Array} list of subtasks with text and status
 */
function collectSubtasks() {
  const subtasks = [];
  const subtaskItems = document.querySelectorAll('.subtask-item');

  subtaskItems.forEach(item => {
    const subtaskText = item.querySelector('.subtask-edit-input').value;
    subtasks.push({
      text: subtaskText,
      status: 'unchecked'
    });
  });

  return subtasks;
}


/**
 * resets all contact checkboxes to their default 'unchecked' state.
 * also removes all selected profile icons from the UI.
 */
function resetCheckboxes() {
  const checkboxes = document.querySelectorAll('.contact-checkbox input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
  });

  const selectedIcons = document.querySelectorAll('.selected-profile-icon');
  selectedIcons.forEach(icon => {
    icon.remove();
  });
}


// ! SUBTASKS
/**
 * toggles the visibility of an element based on a condition.
 * 
 * @param {HTMLElement} element - the element to toggle visibility for
 * @param {boolean} shouldShow - if true, the element will be shown, otherwise hidden
 */
function toggleVisibility(element, shouldShow) {
  element.classList.toggle('hidden', !shouldShow);
  element.classList.toggle('show', shouldShow);
}


/**
 * toggles the visibility of icons based on the state of the input field.
 * if the input field is empty, the plus icon is shown and other icons are hidden, 
 * otherwise, the other icons are shown and the plus icon is hidden.
 */
function toggleIcons() {
  const inputField = document.getElementById('input-subtask');
  const iconWrapper = document.getElementById('edit-icons');
  const plusIcon = document.getElementById('plus-icon');
  const isInputEmpty = inputField.value.trim() === "";

  toggleVisibility(iconWrapper, !isInputEmpty);
  toggleVisibility(plusIcon, isInputEmpty);
}


/**
 * escapes input values to ensure that special characters are safely used in HTML attributes.
 * this will encode characters like double quotes, ampersands, etc.
 * 
 * @function
 * @param {string} text - the text to escape.
 * @returns {string} the escaped text.
 */
function escapeHTMLTags(text) {
  return text.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


/**
 * adds a subtask to the list.
 * creates a new subtask HTML element and appends it to the subtask list.
 * also clears the input field and resets the icons.
 */
function addSubtask() {
  const inputField = document.getElementById('input-subtask');
  const subtaskText = inputField.value.trim();

  if (subtaskText === "") return;

  const escapedSubTaskText = escapeHTMLTags(subtaskText);

  const subtaskList = document.getElementById('subtask-list');
  subtaskList.innerHTML += `
        <li class="subtask-item">
            <input type="text" value="${escapedSubTaskText}" class="subtask-edit-input" readonly tabindex="-1" onclick="preventFocus(event)">
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

  inputField.value = "";
  toggleIcons();
  addDoubleClickListenerToSubtasks();
}


/**
 * adds a double-click event listener to all subtasks.
 * enables editing mode when a subtask item is double-clicked.
 */
function addDoubleClickListenerToSubtasks() {
  const subtaskItems = document.querySelectorAll('.subtask-item');

  subtaskItems.forEach(subtaskItem => {
    if (!subtaskItem.hasAttribute('data-doubleclick-bound')) {
      subtaskItem.addEventListener('dblclick', function () {
        const editIcon = subtaskItem.querySelector('.subtask-edit-icons svg');
        if (editIcon) {
          editSubtask(editIcon);
        }
      });
      subtaskItem.setAttribute('data-doubleclick-bound', 'true');
    }
  });
}


/**
 * handles the enter key event in the input field.
 * prevents form submission and calls the addSubtask function when enter is pressed.
 */
function handleEnter(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    addSubtask();
  }
}


/**
 * enables editing mode for a subtask when the edit icon is clicked.
 * changes the edit icon to a save icon.
 */
function editSubtask(icon) {
  const subtaskItem = icon.closest('.subtask-item');
  const subtaskInput = subtaskItem.querySelector('.subtask-edit-input');

  if (!subtaskInput.readOnly) return;

  subtaskInput.readOnly = false;
  subtaskInput.tabIndex = 0;
  subtaskInput.focus();

  icon.outerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256" onclick="saveSubtask(this)">
            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
        </svg>
    `;
}


/**
 * saves the edited subtask when the save icon is clicked.
 * changes the save icon back to the edit icon.
 */
function saveSubtask(icon) {
  const subtaskItem = icon.closest('.subtask-item');
  const subtaskInput = subtaskItem.querySelector('.subtask-edit-input');

  subtaskInput.readOnly = true;
  subtaskInput.tabIndex = -1;

  icon.outerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256" onclick="editSubtask(this)">
            <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path>
        </svg>
    `;
}


/**
 * prevents focusing on a read-only input field.
 * this function is triggered by a click event on the input field.
 * @param {Event} event - the click event that triggered the function.
 */
function preventFocus(event) {
  const inputField = event.target;
  if (inputField.readOnly) {
    event.preventDefault();
  }
}


/**
 * deletes a subtask when the delete icon is clicked.
 * removes the entire subtask item from the list.
 * @param {HTMLElement} icon - the delete icon that was clicked.
 */
function deleteSubtask(icon) {
  icon.closest('.subtask-item').remove();
}


/**
 * clears the text in the subtask input field.
 * resets the input field and toggles the icons back to the default state.
 */
function clearSubtaskInput() {
  const inputField = document.getElementById('input-subtask');
  inputField.value = "";
  toggleIcons();
}


/**
 * retrieves all form elements from the dom.
 * @returns {object} an object containing references to all form elements.
 */
function getFormElements() {
  return {
    taskTitle: document.getElementById('task-title'),
    taskDescription: document.getElementById('task-description'),
    assignedTo: document.getElementById('assigned-to'),
    selectedContacts: document.getElementById('selected-contacts'),
    dueDate: document.getElementById('due-date'),
    taskCategory: document.getElementById('task-category'),
    subtaskInput: document.getElementById('input-subtask'),
    subtaskList: document.getElementById('subtask-list'),
    errorTaskTitle: document.getElementById('error-task-title'),
    errorDueDate: document.getElementById('error-due-date'),
    errorTaskCategory: document.getElementById('error-task-category'),
    mediumPriorityButton: document.getElementById('mid-priority-button')
  };
}


/**
 * clears the entire input form by resetting the fields and removing error classes.
 */
function clearInputForm() {
  const elements = getFormElements();
  resetFormFields(elements);
  clearFlatpickr(elements.dueDate);
  resetPriority(elements.mediumPriorityButton);
  removeErrorClasses(elements);
}


/**
 * resets all form fields to their default state (empty values).
 * @param {object} elements - the form elements to reset.
 */
function resetFormFields(elements) {
  elements.taskTitle.value = "";
  elements.taskDescription.value = "";
  elements.assignedTo.value = "";
  elements.selectedContacts.innerHTML = "";
  elements.dueDate.value = "";
  elements.taskCategory.value = "";
  elements.subtaskInput.value = "";
  elements.subtaskList.innerHTML = "";
  localStorage.removeItem('checkboxStates');
}


/**
 * clears the flatpickr date picker, if it exists.
 * @param {object} duedateelement - the due date input element.
 */
function clearFlatpickr(dueDateElement) {
  const datePicker = dueDateElement._flatpickr;
  if (datePicker) datePicker.clear();
}


/**
 * resets the task priority to medium.
 * @param {object} mediumprioritybutton - the button element for setting the priority.
 */
function resetPriority(mediumPriorityButton) {
  if (mediumPriorityButton) setPriority(mediumPriorityButton);
}

/**
 * removes error classes from the input fields.
 * @param {object} elements - the form elements containing inputs and error messages.
 */
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