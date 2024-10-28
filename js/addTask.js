// Funktion, um HTML-Inhalte aus externen Dateien zu laden
function includeHTML() {
    const elements = document.querySelectorAll('[include-html]');
    elements.forEach(async (el) => {
        const file = el.getAttribute("include-html");
        if (file) {
            try {
                const response = await fetch(file);
                if (response.ok) {
                    const text = await response.text();
                    el.innerHTML = text;
                    el.removeAttribute("include-html");
                    includeHTML(); // rekursive Aufrufe, falls es geschachtelte Includes gibt
                }
            } catch (err) {
                console.error(`Error fetching ${file}: `, err);
                el.innerHTML = "Content not found.";
            }
        }
    });
}

// Initialisierungsfunktion
function init() {
    // Kalender-Popup für Due Date Input und Logo-Klick
    const dueDateInputContainer = document.querySelector('.date-input .input-field');
    const dueDateInput = document.querySelector('#due-date');
    const logo = document.querySelector('#logo-svg');
    const logoPathData = "M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-68-76a12,12,0,1,1-12-12A12,12,0,0,1,140,132Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,132ZM96,172a12,12,0,1,1-12-12A12,12,0,0,1,96,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,140,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,172Z";
    
    const openCalendar = function(event) {
        event.preventDefault(); // Verhindert das Standard-Verhalten des Inputs
        if (typeof flatpickr === 'undefined') {
            console.error('Flatpickr ist nicht geladen. Bitte sicherstellen, dass die Bibliothek eingebunden ist.');
            return;
        }
        const calendar = flatpickr(dueDateInput, {
            minDate: "today",
            dateFormat: "d/m/Y",
            locale: {
                firstDayOfWeek: 1 // Start the week on Monday
            },
            animate: true // Cool animation effect
        });
        if (calendar) {
            setTimeout(() => calendar.open(), 0); // Kalender nach kurzer Verzögerung öffnen
        }
    };

    if (dueDateInputContainer) {
        dueDateInputContainer.addEventListener('click', openCalendar);
    } else {
        console.error('Element mit der Klasse .input-field konnte nicht gefunden werden.');
    }

    // Logo prüfen, ob es existiert
    if (logo) {
        logo.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="${logoPathData}"/></svg>`;
        logo.addEventListener('click', openCalendar);
    } else {
        console.warn('Element mit ID #logo-svg konnte nicht gefunden werden. Eventuell wurde das Element nicht korrekt eingebunden.');
    }

    // Farbwechsel und Effekte für Prio-Buttons
    const buttons = document.querySelectorAll('.prio-button');
    if (buttons.length > 0) {
        buttons.forEach(button => {
            button.addEventListener('click', function () {
                // Entfernt die 'active'-Klasse und Effekte von allen Buttons
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

                // Fügt der angeklickten Schaltfläche die 'active'-Klasse und Effekte hinzu
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

                // Texteffekt
                const textElement = button.querySelector('span') || button;
                if (textElement) {
                    textElement.style.transform = 'translateY(-2px)';
                    textElement.style.textShadow = '0 2px 4px rgba(0,0,0,0.2)';
                    textElement.style.transition = 'all 0.3s ease';
                }

                // Hinzufügen eines Pulse-Effekts
                button.style.animation = 'pulse 0.5s';
                button.style.animationIterationCount = '1';
            });
        });

        // Füge CSS-Animation für den Pulse-Effekt hinzu
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

// Aufruf der Funktionen beim Laden des Dokuments
window.addEventListener('DOMContentLoaded', () => {
    includeHTML();
    init(); // init() nach includeHTML aufrufen, damit Inhalte geladen sind
});