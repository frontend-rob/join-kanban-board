/**
 * Löscht die ausgewählte Aufgabe aus der geladenen Aufgabenliste und aktualisiert die Benutzeroberfläche.
 * 
 * @function deleteTask
 */
async function deleteTask() {
    const overlay = document.getElementById('overlay');
    const taskId = overlay.getAttribute('data-task-id');

    if (!taskId) {
        return;
    }

    try {
        await sendToFirebase(`${DB_URL}/tasks/${taskId}.json`, null, 'DELETE');
        console.log(`Aufgabe mit ID ${taskId} erfolgreich aus Firebase gelöscht.`);

        if (allTasks[taskId]) {
            delete allTasks[taskId];
            closeTaskOverlay(); 
            getTaskTemplate(allTasks);
        }
    } catch (error) {
        console.error('Fehler beim Löschen der Aufgabe:', error);
    }
}

