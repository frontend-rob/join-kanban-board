let isDragging = false;
let enterCounter = 0;
let longPressTimer = null;
let taskIdForClick = null;
let activeElement = null;
let startX = 0;
let startY = 0;
let isSwipe = false;



/**
 * Allows the drop action by preventing the default behavior.
 * @param {Event} event - The dragover event.
 */
function allowDrop(event) {
    event.preventDefault();
}

/**
 * Handles the start of a drag event, marking the element as "dragging".
 * @param {DragEvent} event - The dragstart event.
 */
function drag(event) {
    const target = event.target;
    if (!target) return;

    event.dataTransfer.setData("text", target.id);
    target.classList.add("dragging");
}

/**
 * Handles the drop action by moving the dragged element to the drop zone.
 * @param {Event} event - The drop event.
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
 * Updates the task status in local data.
 * @param {string} taskId - The ID of the task.
 * @param {string} newStatus - The new status of the task.
 */
function updateTaskStatusInLocalData(taskId, newStatus) {
    allTasks[taskId].status = newStatus;
}

/**
 * Sends a PATCH request to Firebase to update the task status.
 * @param {string} taskId - The ID of the task.
 * @param {string} newStatus - The new status of the task.
 * @returns {Promise<Response>} - The response from the Firebase request.
 */
async function sendStatusUpdateToFirebase(taskId, newStatus) {
    const response = await fetch(`${DB_URL}/tasks/${taskId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
    });

    return response;
}

/**
 * Updates the task status both locally and on Firebase.
 * @param {string} taskId - The ID of the task.
 * @param {string} newStatus - The new status of the task.
 */
async function updateTaskStatus(taskId, newStatus) {
    try {
        updateTaskStatusInLocalData(taskId, newStatus);
        const response = await sendStatusUpdateToFirebase(taskId, newStatus);

        if (!response.ok) {
            throw new Error('Error updating task status');async function updateTaskStatus(taskId, newStatus) {
                try {
                    updateTaskStatusInLocalData(taskId, newStatus);
                    const response = await sendStatusUpdateToFirebase(taskId, newStatus);
            
                    if (!response.ok) {
                        throw new Error('Error updating task status');
                    }
            
                    const updatedTasks = await loadTasks();
                    getTaskTemplate(updatedTasks);
                } catch (error) {
                    console.error('Error updating task status in Firebase:', error);
                }
            }
        }

        const updatedTasks = await loadTasks();
        getTaskTemplate(updatedTasks);
    } catch (error) {
        console.error('Error updating task status in Firebase:', error);
    }
}

/**
 * Handles the dragover event to allow a drop action.
 * @param {DragEvent} event - The drag event.
 */
function handleDragOver(event) {
    event.preventDefault();
}

/**
 * Handles the dragenter event to highlight the drop zone.
 * @param {DragEvent} event - The dragenter event.
 */
function handleDragEnter(event) {
    const dropZone = event.target.closest('.drop-zone');
    if (dropZone) {
        enterCounter++;
        resetHighlights();
        dropZone.classList.add('highlight');
    }
}

/**
 * Handles the dragleave event to manage the enter counter and remove highlight.
 * @param {DragEvent} event - The dragleave event.
 */
function handleDragLeave(event) {
    const dropZone = event.target.closest('.drop-zone');
    if (dropZone) {
        enterCounter--;
        if (enterCounter === 0) {
            dropZone.classList.remove('highlight');
        }
    }
}

/**
 * Resets the highlight effect for all drop zones.
 */
function resetHighlights() {
    const dropZones = document.querySelectorAll('.drop-zone');
    dropZones.forEach(zone => {
        zone.classList.remove('highlight');
    });
    lastHighlightedZone = null;
}


/**
 * Initializes the drop zones and adds event listeners for drag-and-drop functionality.
 */
function initializeDropZones() {
    const dropZones = document.querySelectorAll('.drop-zone');
    dropZones.forEach(dropZone => {
        dropZone.addEventListener('dragover', allowDrop);
        dropZone.addEventListener('dragenter', handleDragEnter);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', drop);
    });
}

/**
 * Sets up event listeners for page loading and task rendering.
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeDropZones();
    loadTasks().then(getTaskTemplate);
});


/**
 * Starts the drag process after a long press.
 * @param {Event} event - The touch or mouse event.
 * @param {string} taskId - The ID of the task being dragged.
 */
function handleLongPressStart(event, taskId) {
    event.preventDefault();

    isDragging = true;
    activeElement = document.getElementById(taskId);

    const touch = event.touches ? event.touches[0] : event;
    startX = touch.clientX;
    startY = touch.clientY;

    activeElement.classList.add('dragging');
    activeElement.style.position = 'absolute';
    activeElement.style.zIndex = '1000';

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mousemove', handleTouchMove, { passive: false });
}

/**
 * Ends the drag process, removing event listeners and resetting task styles.
 * @param {Event} event - The touch or mouse event.
 */
function handleLongPressEnd(event) {
    if (!isDragging) return;

    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('mousemove', handleTouchMove);

    isDragging = false;
    if (activeElement) {
        activeElement.classList.remove('dragging');
        activeElement.style.position = 'initial';
        activeElement.style.zIndex = 'initial';
    }

    event.preventDefault();
}

/**
 * Starts the mobile drag event by setting the element as draggable and dispatching a dragstart event.
 * @param {HTMLElement} target - The target element.
 * @param {string} taskId - The task ID.
 */
function startMobileDrag(target, taskId) {
    if (!target) {
        console.error("startMobileDrag: Target is null or undefined.");
        return;
    }

    target.setAttribute("draggable", "true");

    target.classList.add("dragging");

    try {
        const dragEvent = new DragEvent("dragstart", {
            bubbles: true,
            cancelable: true,
        });
        target.dispatchEvent(dragEvent);
    } catch (error) {
        console.error("startMobileDrag: Error dispatching dragstart event:", error);
    }
}

/**
 * Handles click events on tasks, opening the task overlay.
 * @param {Event} event - The click event.
 * @param {string} taskId - The task ID.
 */
function handleTaskClick(event, taskId) {
    const target = document.getElementById(taskId);
    if (target.classList.contains("dragging")) {
        return;
    }
    getTaskOverlay(taskId);
}



/**
 * Starts the touch drag process by marking the element as "dragging".
 * @param {Event} event - The touchstart event.
 * @param {string} taskId - The task ID.
 */
function handleTouchStart(event, taskId) {
    taskIdForClick = taskId;

    longPressTimer = setTimeout(() => {
        isDragging = true;
        startDragging(event, taskId);
    }, 800);

    event.preventDefault();
}

/**
 * Die Funktion behandelt das Starten der Dragging-Aktion nach einem langen Druck.
 */
function startDragging(event, taskId) {
    const target = document.getElementById(taskId);
    if (!target) return;

    activeElement = target;
    activeElement.classList.add('dragging');
    activeElement.style.position = 'absolute';
    activeElement.style.zIndex = '1000';

    const touch = event.touches ? event.touches[0] : event;
    startX = touch.clientX;
    startY = touch.clientY;
}

/**
 * Handles touch move events to simulate element dragging visually.
 * @param {Event} event - The touchmove event.
 */
function handleTouchMove(event) {
    if (!activeElement || !isDragging) return;

    event.preventDefault();

    const touch = event.touches ? event.touches[0] : event;
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    activeElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    activeElement.style.position = "absolute";
    activeElement.style.zIndex = "1000";
    activeElement.style.transition = 'none';

    highlightDropZone(event);
}

function handleMouseMove(event) {
    if (!activeElement || !isDragging) return;

    event.preventDefault();

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    // Dragging verschieben
    activeElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    activeElement.style.position = "absolute";
    activeElement.style.zIndex = "1000";
    activeElement.style.transition = 'none';

    highlightDropZone(event);
}

document.addEventListener('mousemove', handleMouseMove, { passive: false });
document.addEventListener('touchmove', handleTouchMove, { passive: false });


/**
 * Ends the touch drag process and checks for a valid drop zone.
 * @param {Event} event - The touchend event.
 */
function handleTouchEnd(event) {
    clearTimeout(longPressTimer);

    if (isDragging) {
        isDragging = false;
        finishDrag(event);
        return;
    }

    if (!isSwipe) {
        const taskId = taskIdForClick;
        if (taskId) {
            handleTaskClick(event, taskId);
        }
    }

    taskIdForClick = null;
    isSwipe = false;
}

/**
 * Handles the end of the drag event (mobile).
 * @param {Event} event - The touchend event.
 */
function finishDrag(event) {
    if (!activeElement) return;

    const touch = event.changedTouches ? event.changedTouches[0] : event;
    const dropZone = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.drop-zone');

    if (dropZone) {
        dropZone.appendChild(activeElement);
        const taskId = activeElement.id;
        updateTaskStatus(taskId, dropZone.id);
    } else {
        console.log("Dropped outside any zone.");
    }

    activeElement.classList.remove('dragging');
    activeElement.style.transform = "";
    activeElement.style.position = "";
    activeElement.style.zIndex = "";

    activeElement = null;

    resetHighlights();
}

/**
 * Sets up touch event listeners on task elements after DOM is loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
    const tasks = document.querySelectorAll('.task');
    tasks.forEach(task => {
        task.setAttribute("draggable", "true");
        task.addEventListener('touchstart', (e) => handleTouchStart(e, task.id));
        task.addEventListener('dragstart', drag);
        task.addEventListener('dragend', () => task.classList.remove('dragging'));
    });

    initializeDropZones();
});

let autoScrollInterval = null;

/**
 * Handles the auto-scroll behavior when the user drags near the edge of the screen.
 * @param {Event} event - The touchmove event.
 */
function handleAutoScroll(event) {
    const touch = event.touches[0];
    const scrollMargin = 50;

    if (touch.clientY < scrollMargin) {
        startAutoScroll(-5);
    } else if (touch.clientY > window.innerHeight - scrollMargin) {
        startAutoScroll(5);
    } else {
        stopAutoScroll();
    }
}

/**
 * Starts the auto-scroll action.
 * @param {number} scrollSpeed - The speed of scrolling.
 */
function startAutoScroll(scrollSpeed) {
    if (autoScrollInterval) return;
    autoScrollInterval = setInterval(() => {
        window.scrollBy(0, scrollSpeed);
    }, 10);
}

/**
 * Stops the auto-scroll action.
 */
function stopAutoScroll() {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
}

let lastHighlightedZone = null;

/**
 * Highlights the drop zone when the element is dragged over it.
 * @param {Event} event - The touchmove event.
 */
function highlightDropZone(event) {
    const touch = event.touches ? event.touches[0] : event;
    const touchY = touch.clientY + window.scrollY;

    let found = false;

    document.querySelectorAll('.drop-zone').forEach(dropZone => {
        const rect = dropZone.getBoundingClientRect();
        const dropZoneTop = rect.top + window.scrollY;
        const dropZoneBottom = dropZoneTop + rect.height;

        if (touchY >= dropZoneTop && touchY <= dropZoneBottom) {
            if (!found) {
                resetHighlights();
                dropZone.classList.add("highlight");
                lastHighlightedZone = dropZone;
                found = true;
            }
        }
    });


    if (!found) {
        resetHighlights();
        lastHighlightedZone = null;
    }
}
