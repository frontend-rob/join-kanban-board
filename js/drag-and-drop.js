let isDragging = false;
let isScrolling = false;
let touchStartX = 0;
let touchStartY = 0;
let scrollStartX = 0;
let longPressTimer = null;
let activeElement = null;
let taskIdForClick = null;
let autoScrollInterval = null;
let lastScrollTime = 0;
let currentMouseY = 0;
let enterCounter = 0; 
let lastScrollY = 0; 
let initialTouchY = 0; 
let currentTouchY = 0;
let lastHighlightedZone = null;
let dropZoneCounters = new Map();
let isVerticalScroll = false;
let LONG_PRESS_DELAY = 500;
let SCROLL_THRESHOLD = 10;
let DRAG_THRESHOLD = 30;
let AUTO_SCROLL_THRESHOLD = 200; 
let AUTO_SCROLL_SPEED = 10; 
let AUTO_SCROLL_INTERVAL = 16; 
let VERTICAL_SCROLL_THRESHOLD = 20;


function determineScrollDirection(touchX, touchY) {
    const deltaX = Math.abs(touchX - touchStartX);
    const deltaY = Math.abs(touchY - touchStartY);
    
    if (deltaY > VERTICAL_SCROLL_THRESHOLD && deltaY > deltaX * 1.5) {
        return 'vertical';
    } else if (deltaX > SCROLL_THRESHOLD && deltaX > deltaY * 1.5) {
        return 'horizontal';
    }
    return null;
}

/**
 * Allows an element to be dropped by preventing the default behavior.
 * 
 * @param {Event} event - The dragover event.
 */
function allowDrop(event) {
    event.preventDefault();
}


/**
 * Handles the drag event by adding a "dragging" class and setting the data to be transferred.
 * 
 * @param {DragEvent} event - The drag event.
 */
function drag(event) {
    const target = event.target;
    if (!target) return;
    event.dataTransfer.setData("text", target.id);
    target.classList.add("dragging");
}


/**
 * Handles the drop event by moving the dragged element to the drop zone and updating the task status.
 * 
 * @param {DragEvent} event - The drop event.
 * @returns {Promise<void>} - A promise that resolves when the task status is updated.
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
 * Handles the dragover event by preventing the default behavior.
 * 
 * @param {DragEvent} event - The dragover event.
 */
function handleDragOver(event) {
    event.preventDefault();
}


/**
 * Handles the dragenter event by highlighting the drop zone.
 * 
 * @param {DragEvent} event - The dragenter event.
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
 * Handles the dragleave event by removing the highlight from the drop zone.
 * 
 * @param {DragEvent} event - The dragleave event.
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
 * Resets the highlights from all drop zones.
 */
function resetHighlights() {
    const dropZones = document.querySelectorAll('.drop-zone');
    dropZones.forEach(zone => {
        zone.classList.remove('highlight');
        dropZoneCounters.set(zone, 0);
    });
}


/**
 * Initializes the drop zones by adding event listeners for drag events.
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


/**
 * Handles the DOMContentLoaded event by initializing drop zones and loading tasks.
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeDropZones();
    loadTasks().then(getTaskTemplate);
});


/**
 * Initiates the dragging process for a specified element.
 * 
 * This function sets up the element with the given taskId to be dragged by modifying its
 * style properties and adding a 'dragging' class. It also ensures that the element is positioned 
 * absolutely and has a higher z-index during the dragging process.
 * 
 * @param {Event} event - The event triggered when the drag starts (usually a mouse or touch event).
 * @param {string} taskId - The id of the element to be dragged.
 */
function startDragging(event, taskId) {
    const target = document.getElementById(taskId);
    if (!target) return;

    // Calculate the offset from the touch/mouse point to the element's position
    const rect = target.getBoundingClientRect();
    const touch = event.touches ? event.touches[0] : event;
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;

    activeElement = target;
    activeElement.classList.add('dragging');
    activeElement.style.position = 'fixed';
    activeElement.style.left = `${rect.left}px`;
    activeElement.style.top = `${rect.top}px`;
    activeElement.style.zIndex = '1000';
    
    // Store the offset for use in handleDragging
    activeElement.dataset.offsetX = offsetX;
    activeElement.dataset.offsetY = offsetY;
}


/**
 * Handles the dragging behavior by updating the position of the element being dragged.
 * 
 * @param {number} deltaX - The horizontal movement of the touch.
 * @param {number} deltaY - The vertical movement of the touch.
 * @param {TouchEvent} event - The touchmove event triggered by the user's touch move.
 */
function handleDragging(deltaX, deltaY, event) {
    event.preventDefault();
    startAutoScroll(event);

    const scrollOffset = window.scrollY - lastScrollY;
    const offsetX = parseFloat(activeElement.dataset.offsetX) || 0;
    const offsetY = parseFloat(activeElement.dataset.offsetY) || 0;

    // Adjust the position by subtracting the initial offset
    const newX = deltaX - offsetX;
    const newY = deltaY - offsetY + scrollOffset;

    if (activeElement) {
        activeElement.style.transform = `translate(${newX}px, ${newY}px)`;
    }
}


/**
 * Handles the dragging logic by updating the element's position during the touch move.
 * 
 * @param {number} deltaX - The horizontal movement during the drag.
 * @param {number} deltaY - The vertical movement during the drag.
 * @param {TouchEvent} event - The touchmove event triggered by the user's touch.
 */
function handleDragging(deltaX, deltaY, event) {
    event.preventDefault();
    startAutoScroll(event);

    const scrollOffset = window.scrollY - lastScrollY;
    const newY = deltaY + scrollOffset;

    if (activeElement) {
        activeElement.style.transform = `translate(${deltaX}px, ${newY}px)`;
    }
}


/**
 * Handles the scrolling behavior when the user drags horizontally over a drop zone.
 * 
 * @param {number} deltaX - The horizontal movement during the drag.
 * @param {TouchEvent} event - The touchmove event triggered by the user's touch.
 * @param {Element} dropZone - The closest drop zone element.
 */
function handleScrolling(deltaX, event, dropZone) {
    isScrolling = true;
    dropZone.scrollLeft = scrollStartX - deltaX;
    event.preventDefault();
}


/**
 * Finalizes the drag operation by appending the dragged element to a drop zone.
 * 
 * @param {TouchEvent|MouseEvent} event - The touchend or mouseup event triggered by the user.
 */
function finishDrag(event) {
    if (!activeElement) return;
    const touch = event.changedTouches ? event.changedTouches[0] : event;
    const dropZone = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.drop-zone');
    if (dropZone) {
        dropZone.appendChild(activeElement);
        updateTaskStatus(activeElement.id, dropZone.id);
    }
    activeElement.classList.remove('dragging');
    activeElement.style.transform = "";
    activeElement.style.position = "";
    activeElement.style.zIndex = "";
    resetHighlights();
}


/**
 * Highlights the drop zone based on the current cursor or touch position.
 * 
 * @param {TouchEvent|MouseEvent} event - The touchmove or mousemove event triggered by the user.
 */
function highlightDropZone(event) {
    const touch = event.touches ? event.touches[0] : event;
    const elementUnderCursor = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = elementUnderCursor?.closest('.drop-zone');

    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('highlight');
    });

    if (dropZone && dropZone !== activeElement?.parentElement) {
        dropZone.classList.add('highlight');
    }
}


/**
 * Initializes drag-and-drop events, including mouse and touch interactions.
 */
function initializeDragAndDrop() {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleTouchEnd);
    
    document.addEventListener('mouseleave', () => {
        stopAutoScroll();
        if (isDragging) {
            handleTouchEnd(new MouseEvent('mouseup'));
        }
    });
}

document.addEventListener('DOMContentLoaded', initializeDragAndDrop);