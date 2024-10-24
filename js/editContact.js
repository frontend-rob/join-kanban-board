async function editContact(contactId) {
    const overlay = document.getElementById('edit-contact-overlay');
    const overlayContent = document.getElementById('overlay-content-edit-contact');

    overlay.style.display = 'flex'; 
    overlayContent.style.right = '-60%'; 

    setTimeout(() => {
        overlayContent.classList.add('show-edit-contact'); 
        overlayContent.style.right = '20%'; 
    }, 0); 

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeEditOverlay(); 
        }
    });

    try {
        const response = await fetch(`${DB_URL}/contacts/${contactId}.json`);
        const contact = await response.json();

        if (!contact) {
            console.error('Kontakt nicht gefunden.');
            return;
        }

        document.getElementById('edit-contact-name').value = contact.name || '';
        document.getElementById('edit-contact-email').value = contact.email || '';
        document.getElementById('edit-contact-phone').value = contact.phone || '';

        const userContactHTML = `
            <div class="user-contact">
                <div class="profile-icon-contact" style="background-color: ${contact.color};">
                    <span style="color: white;">${contact.initials}</span>
                </div>
            </div>
        `;

        document.getElementById('edit-profile-icon').innerHTML = userContactHTML;
        overlay.setAttribute('data-contact-id', contactId);

    } catch (error) {
        console.error('Fehler beim Laden der Kontaktinformationen:', error);
    }
}

function closeEditOverlay() {
    const overlay = document.getElementById('edit-contact-overlay');
    const overlayContent = document.getElementById('overlay-content-edit-contact');

    overlayContent.style.right = '-60%'; 

    setTimeout(() => {
        overlayContent.classList.remove('show-edit-contact');
    }, 200); 

    overlayContent.addEventListener('transitionend', function handler() {
        overlay.style.display = 'none'; 
        overlayContent.removeEventListener('transitionend', handler); 
    });
}

async function saveContact() {
    const overlay = document.getElementById('edit-contact-overlay');
    const contactId = overlay.getAttribute('data-contact-id');

    const updatedContact = {
        name: document.getElementById('edit-contact-name').value,
        email: document.getElementById('edit-contact-email').value,
        phone: document.getElementById('edit-contact-phone').value,
        color: document.getElementById('edit-profile-icon').querySelector('.profile-icon-contact').style.backgroundColor,
        initials: document.getElementById('edit-profile-icon').querySelector('.profile-icon-contact span').textContent
    };

    if (!updatedContact.name || !updatedContact.email || !updatedContact.phone) {
        alert('Bitte alle Felder ausfüllen.');
        return;
    }

    try {
        const response = await fetch(`${DB_URL}/contacts/${contactId}.json`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedContact)
        });

        if (!response.ok) {
            throw new Error('Fehler beim Aktualisieren des Kontakts.');
        }

        console.log('Kontakt erfolgreich aktualisiert.');
        closeEditOverlay();
        showContactDetails(updatedContact, contactId); 

    } catch (error) {
        console.error('Fehler beim Speichern der Kontaktinformationen:', error);
    }
}
