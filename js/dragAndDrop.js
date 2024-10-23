/**
 * Allows the drop action by preventing the default behavior.
 * 
 * @param {Event} event - The dragover event that occurs when the task is dragged over a drop zone.
 */
function allowDrop(event) {
    event.preventDefault();
}

/**
 * Stores the ID of the dragged element when dragging starts.
 * 
 * @param {Event} event - The dragstart event that occurs when a task starts being dragged.
 */
function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

/**
 * Behandelt die Drop-Aktion, indem das gezogene Task-Element zur neuen Drop-Zone hinzugefügt wird
 * und der Status der Aufgabe aktualisiert wird.
 * 
 * @param {Event} event - Das Drop-Event, das ausgelöst wird, wenn eine Aufgabe in eine Drop-Zone gezogen wird.
 */
function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("text"); // ID der gezogenen Aufgabe abrufen
    var draggedElement = document.getElementById(data); // Das gezogene Task-Element abrufen

    if (event.target.classList.contains('drop-zone')) {
        event.target.appendChild(draggedElement); // Das Task-Element zur neuen Drop-Zone hinzufügen

        var newStatus = event.target.id; // Den neuen Status aus der ID der Drop-Zone abrufen (z. B. "to-do", "in-progress")
        updateTaskStatus(data, newStatus); // Den Status der Aufgabe in Firebase aktualisieren
    }
    
    // Entfernt den Hervorhebungseffekt nach dem Ablegen
    event.target.classList.remove('highlight');
}

/**
 * Aktualisiert den Status der Aufgabe in Firebase und rendert das Board neu.
 * 
 * @param {string} taskId - Die ID der zu aktualisierenden Aufgabe.
 * @param {string} newStatus - Der neue Status der Aufgabe (z. B. "to-do", "in-progress").
 */
async function updateTaskStatus(taskId, newStatus) {
    // Den Status der Aufgabe lokal aktualisieren
    allTasks[taskId].status = newStatus;

    try {
        // Den Status der Aufgabe in Firebase aktualisieren
        const response = await fetch(`${DB_URL}/tasks/${taskId}.json`, {
            method: 'PATCH', // 'PATCH' wird verwendet, um nur den Status zu aktualisieren
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }), // Neuen Status an Firebase senden
        });

        if (!response.ok) {
            throw new Error('Fehler beim Aktualisieren des Aufgabenstatus');
        }

        console.log(`Aufgabe ${taskId} wurde auf ${newStatus} aktualisiert`);

        // Aufgaben neu rendern, damit sie in der richtigen Spalte erscheinen
        getTaskTemplate(allTasks);
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Aufgabenstatus in Firebase:', error);
    }
}



/**
 * Adds the "highlight" effect when a draggable element is dragged over a drop zone.
 * 
 * @param {DragEvent} event - The drag event.
 */
function handleDragOver(event) {
    event.preventDefault();
    if (event.target.classList.contains('drop-zone')) {
        event.target.classList.add('highlight');
    }
}

/**
 * Removes the "highlight" effect when the draggable element leaves the drop zone.
 * 
 * @param {DragEvent} event - The drag event.
 */
function handleDragLeave(event) {
    if (event.target.classList.contains('drop-zone')) {
        event.target.classList.remove('highlight');
    }
}

/**
 * Initializes all drop zones on the page and adds the necessary event listeners
 * for drag-and-drop functionality.
 */
function initializeDropZones() {
    const dropZones = document.querySelectorAll('.drop-zone');

    dropZones.forEach((dropZone) => {
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', drop);
    });
}