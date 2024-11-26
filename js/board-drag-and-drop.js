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

/**
 * Determines the scroll direction based on touch movement.
 * 
 * This function compares the distance moved horizontally (deltaX) and vertically (deltaY)
 * to determine whether the scroll is primarily vertical or horizontal.
 * 
 * @param {number} touchX - The current X-coordinate of the touch.
 * @param {number} touchY - The current Y-coordinate of the touch.
 * @returns {string|null} Returns 'vertical' if the scroll is more vertical, 'horizontal' if more horizontal, 
 *                        or null if neither direction is clearly dominant.
 */
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
 * This function serves as the entry point for dragging, setting up the element 
 * and delegating specific tasks to helper functions.
 * 
 * @param {Event} event - The event triggered when the drag starts (usually a mouse or touch event).
 * @param {string} taskId - The id of the element to be dragged.
 */
function startDragging(event, taskId) {
    const target = document.getElementById(taskId);
    if (!target) return;

    const touch = getTouchPoint(event);
    const rect = target.getBoundingClientRect();
    const { offsetX, offsetY } = calculateOffsets(touch, rect);

    setupDraggingElement(target, rect, offsetX, offsetY);
    storeDraggingOffsets(target, offsetX, offsetY);
}

/**
 * Retrieves the touch or mouse point from the event.
 * 
 * @param {Event} event - The drag start event, either a mouse or touch event.
 * @returns {Touch|MouseEvent} - The touch or mouse point.
 */
function getTouchPoint(event) {
    return event.touches ? event.touches[0] : event;
}

/**
 * Calculates the offset between the touch/mouse point and the element's position.
 * 
 * @param {Touch|MouseEvent} touch - The touch or mouse point.
 * @param {DOMRect} rect - The bounding rectangle of the element.
 * @returns {Object} - An object containing offsetX and offsetY values.
 */
function calculateOffsets(touch, rect) {
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;
    return { offsetX, offsetY };
}

/**
 * Sets up the element to be dragged by initializing its styles and position.
 * 
 * @param {HTMLElement} target - The element to be dragged.
 * @param {DOMRect} rect - The bounding rectangle of the element.
 * @param {number} offsetX - The horizontal offset between the touch point and the element.
 * @param {number} offsetY - The vertical offset between the touch point and the element.
 */
function setupDraggingElement(target, rect, offsetX, offsetY) {
    activeElement = target;
    activeElement.classList.add('dragging');
    activeElement.style.position = 'fixed';
    activeElement.style.left = `${rect.left}px`;
    activeElement.style.top = `${rect.top}px`;
    activeElement.style.zIndex = '1000';
}

/**
 * Stores the calculated offsets in the element's dataset for future reference.
 * 
 * @param {HTMLElement} target - The element being dragged.
 * @param {number} offsetX - The horizontal offset between the touch point and the element.
 * @param {number} offsetY - The vertical offset between the touch point and the element.
 */
function storeDraggingOffsets(target, offsetX, offsetY) {
    target.dataset.offsetX = offsetX;
    target.dataset.offsetY = offsetY;
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

    const newX = deltaX - offsetX;
    const newY = deltaY - offsetY + scrollOffset;

    if (activeElement) {
        activeElement.style.transform = `translate(${newX}px, ${newY}px)`;
        highlightDropZone(event);
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
        dropZone.classList.remove('highlight');
    }
    activeElement.classList.remove('dragging');
    activeElement.style.transform = "";
    activeElement.style.position = "";
    activeElement.style.zIndex = "";
    activeElement = null;
    lastHighlightedZone = null;
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

    if (lastHighlightedZone && lastHighlightedZone !== dropZone) {
        lastHighlightedZone.classList.remove('highlight');
    }

    if (dropZone && dropZone !== activeElement?.parentElement) {
        dropZone.classList.add('highlight');
        lastHighlightedZone = dropZone;
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

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
}

/**
 * Handles the touch start event by initializing the dragging process.
 * 
 * @param {TouchEvent} event - The touchstart event triggered by the user's touch.
 */
function handleTouchStart(event) {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    initialTouchY = touch.clientY;
    lastScrollY = window.scrollY;

    const target = event.target.closest('.task');
    if (target) {
        taskIdForClick = target.id;
        longPressTimer = setTimeout(() => {
            startDragging(event, taskIdForClick);
            isDragging = true;
        }, LONG_PRESS_DELAY);
    }
}

/**
 * Handles the touch move event by updating the dragging behavior.
 * 
 * @param {TouchEvent} event - The touchmove event triggered by the user's touch.
 */
function handleTouchMove(event) {
    if (!isDragging) {
        clearTimeout(longPressTimer);
        const touch = event.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        const scrollDirection = determineScrollDirection(touch.clientX, touch.clientY);

        if (scrollDirection === 'vertical') {
            isVerticalScroll = true;
            return;
        } else if (scrollDirection === 'horizontal') {
            isVerticalScroll = false;
            handleScrolling(deltaX, event, event.target.closest('.drop-zone'));
        }
    } else {
        const touch = event.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        handleDragging(deltaX, deltaY, event);
    }
}

/**
 * Handles the touch end event by finalizing the drag operation.
 * 
 * @param {TouchEvent} event - The touchend event triggered by the user's touch.
 */
function handleTouchEnd(event) {
    clearTimeout(longPressTimer);
    if (isDragging) {
        finishDrag(event);
        isDragging
= false;
    }
}

/**
 * Handles the mouse move event by updating the dragging behavior.
 * 
 * @param {MouseEvent} event - The mousemove event triggered by the user's mouse move.
 */
function handleMouseMove(event) {
    if (isDragging) {
        const deltaX = event.clientX - touchStartX;
        const deltaY = event.clientY - touchStartY;
        handleDragging(deltaX, deltaY, event);
    }
}

/**
 * Starts the auto-scroll behavior when the user drags near the edge of the viewport.
 * 
 * @param {TouchEvent|MouseEvent} event - The touchmove or mousemove event triggered by the user.
 */
function startAutoScroll(event) {
    const touch = event.touches ? event.touches[0] : event;
    currentMouseY = touch.clientY;

    if (!autoScrollInterval) {
        autoScrollInterval = setInterval(() => {
            const now = Date.now();
            if (now - lastScrollTime < AUTO_SCROLL_INTERVAL) return;

            if (currentMouseY < AUTO_SCROLL_THRESHOLD) {
                window.scrollBy(0, -AUTO_SCROLL_SPEED);
            } else if (window.innerHeight - currentMouseY < AUTO_SCROLL_THRESHOLD) {
                window.scrollBy(0, AUTO_SCROLL_SPEED);
            }

            lastScrollTime = now;
        }, AUTO_SCROLL_INTERVAL);
    }
}

/**
 * Stops the auto-scroll behavior.
 */
function stopAutoScroll() {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
}

document.addEventListener('DOMContentLoaded', initializeDragAndDrop);

