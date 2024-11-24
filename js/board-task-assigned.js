let selectedContacts = new Set();

function restoreContactSelectionState() {
    const savedState = localStorage.getItem('selectedContacts');
    if (savedState) {
        selectedContacts = new Set(JSON.parse(savedState));
        updateContactCheckboxes();
    }
}

function toggleContactSelection(contactItem) {
    const contactId = contactItem.dataset.id;
    const checkbox = contactItem.querySelector('input[type="checkbox"]');
    const checkboxIcon = contactItem.querySelector('img[alt="checkbox icon"]');
    
    if (selectedContacts.has(contactId)) {
        selectedContacts.delete(contactId);
        checkbox.checked = false;
        contactItem.classList.remove('active');
        if (checkboxIcon) {
            checkboxIcon.src = "../assets/icons/unchecked.svg";
        }
    } else {
        selectedContacts.add(contactId);
        checkbox.checked = true;
        contactItem.classList.add('active');
        if (checkboxIcon) {
            checkboxIcon.src = "../assets/icons/checked-dark.svg";
        }
    }
    
    updateSelectedContactsDisplay();
    saveContactSelectionState();
}

function saveContactSelectionState() {
    localStorage.setItem('selectedContacts', JSON.stringify(Array.from(selectedContacts)));
}

function updateContactCheckboxes() {
    document.querySelectorAll('.contact-item').forEach(contact => {
        const contactId = contact.dataset.id;
        const checkbox = contact.querySelector('input[type="checkbox"]');
        const checkboxIcon = contact.querySelector('img[alt="checkbox icon"]');
        const isSelected = selectedContacts.has(contactId);
        
        checkbox.checked = isSelected;
        contact.classList.toggle('active', isSelected);
        if (checkboxIcon) {
            checkboxIcon.src = isSelected ? "../assets/icons/checked-dark.svg" : "../assets/icons/unchecked.svg";
        }
    });
    
    updateSelectedContactsDisplay();
}

function updateSelectedContactsDisplay() {
    const container = document.getElementById('selected-contacts');
    if (!container) return;
    
    container.innerHTML = '';
    
    selectedContacts.forEach(contactId => {
        const contact = document.querySelector(`.contact-item[data-id="${contactId}"]`);
        if (contact) {
            const initials = contact.querySelector('.profil-icon').textContent;
            const color = contact.querySelector('.profil-icon').style.backgroundColor;
            
            const contactElement = document.createElement('div');
            contactElement.className = 'selected-profile-icon';
            contactElement.style.backgroundColor = color;
            contactElement.textContent = initials;
            contactElement.setAttribute('data-id', contactId);
            
            container.appendChild(contactElement);
        }
    });
}

function initializeContactSelection() {
    restoreContactSelectionState();
    document.querySelectorAll('.contact-item').forEach(contact => {
        contact.addEventListener('click', () => toggleContactSelection(contact));
    });
}

function updateDropdownCheckboxes() {
    const selectedContactsContainer = document.getElementById('selected-contacts');
    if (!selectedContactsContainer) return;

    const selectedContactIds = Array.from(selectedContactsContainer.children).map(contactElement => contactElement.dataset.id);

    document.querySelectorAll('#contact-dropdown .contact-item').forEach(contact => {
        const contactId = contact.dataset.id;
        const checkbox = contact.querySelector('input[type="checkbox"]');
        const checkboxIcon = contact.querySelector('img[alt="checkbox icon"]');
        const isSelected = selectedContactIds.includes(contactId);

        checkbox.checked = isSelected;
        contact.classList.toggle('active', isSelected);
        if (checkboxIcon) {
            checkboxIcon.src = isSelected ? "../assets/icons/checked-dark.svg" : "../assets/icons/unchecked.svg";
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeContactSelection();
    updateDropdownCheckboxes(); // Ensure dropdown checkboxes are updated based on selected contacts

    // Add form submit handler
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', () => {
            saveContactSelectionState(); // Save the state before clearing
            selectedContacts.clear();
            localStorage.removeItem('selectedContacts');
        });
    }
});