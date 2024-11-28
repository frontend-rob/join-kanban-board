let activeElement = null;
let lastHighlightedZone = null;
let dropZoneCounters = new Map();

/**
 * Allows the drop action by preventing the default behavior.
 * @param {Event} event - The drag event
 */
function allowDrop(event) {
    event.preventDefault();
}

/**
 * Handles the drag start action by marking the element as dragging.
 * @param {Event} event - The drag event
 */
function drag(event) {
    const target = event.target;
    if (!target) return;
    event.dataTransfer.setData("text", target.id);
    target.classList.add("dragging");
}

/**
 * Handles the drop action when the dragged element is dropped into a drop zone.
 * @param {Event} event - The drop event
 */
async function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
    const dropZone = event.target.closest('.drop-zone');

    if (draggedElement && dropZone) {
        draggedElement.classList.remove('dragging');
        dropZone.appendChild(draggedElement);
        draggedElement.style.pointerEvents = "none";
        const newStatus = dropZone.id;
        await updateTaskStatus(data, newStatus);
        resetHighlights();
    }
}

/**
 * Handles the drag over action by preventing the default behavior.
 * @param {Event} event - The drag event
 */
function handleDragOver(event) {
    event.preventDefault();
}

/**
 * Handles the drag enter event by highlighting the drop zone.
 * @param {Event} event - The drag event
 */
function handleDragEnter(event) {
    event.preventDefault();
    const dropZone = event.target.closest('.drop-zone');
    if (!dropZone) return;

    document.querySelectorAll('.drop-zone').forEach(zone => {
        if (zone !== dropZone) {
            zone.classList.remove('highlight');
            dropZoneCounters.set(zone, 0);
        }
    });

    const counter = dropZoneCounters.get(dropZone) || 0;
    dropZoneCounters.set(dropZone, counter + 1);
    dropZone.classList.add('highlight');
}

/**
 * Handles the drag leave event by removing the highlight from the drop zone.
 * @param {Event} event - The drag event
 */
function handleDragLeave(event) {
    const dropZone = event.target.closest('.drop-zone');
    if (!dropZone) return;

    const counter = dropZoneCounters.get(dropZone) || 0;
    dropZoneCounters.set(dropZone, counter - 1);

    if (dropZoneCounters.get(dropZone) <= 0) {
        dropZone.classList.remove('highlight');
        dropZoneCounters.set(dropZone, 0);
    }
}

/**
 * Resets all the highlights from drop zones.
 */
function resetHighlights() {
    const dropZones = document.querySelectorAll('.drop-zone');
    dropZones.forEach(zone => {
        zone.classList.remove('highlight');
        dropZoneCounters.set(zone, 0);
    });
}

/**
 * Initializes the drop zones and sets up event listeners for drag and drop.
 */
function initializeDropZones() {
    const dropZones = document.querySelectorAll('.drop-zone');
    dropZones.forEach(dropZone => {
        dropZoneCounters.set(dropZone, 0);
        dropZone.addEventListener('dragover', allowDrop);
        dropZone.addEventListener('dragenter', handleDragEnter);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', drop);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeDropZones();
    loadTasks().then(getTaskTemplate);
});

/**
 * Highlights the drop zone based on the current position of the dragged element.
 * @param {Event} event - The mouse event
 */
function highlightDropZone(event) {
    const elementUnderCursor = document.elementFromPoint(event.clientX, event.clientY);
    const dropZone = elementUnderCursor?.closest('.drop-zone');

    if (lastHighlightedZone && lastHighlightedZone !== dropZone) {
        lastHighlightedZone.classList.remove('highlight');
    }

    if (dropZone && dropZone !== activeElement?.parentElement) {
        dropZone.classList.add('highlight');
        lastHighlightedZone = dropZone;
    }
}
