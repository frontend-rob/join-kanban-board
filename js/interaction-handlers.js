/**
 * Handles the long press start event by initiating the dragging process.
 * 
 * @param {Event} event - The long press event.
 * @param {string} taskId - The ID of the task to be dragged.
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
 * Handles the long press end event by stopping the drag and resetting styles.
 * 
 * @param {Event} event - The long press end event.
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
 * Initializes a drag operation for a mobile device by setting the target element as draggable
 * and dispatching a "dragstart" event.
 * 
 * @param {HTMLElement} target - The element to be made draggable.
 * @param {string} taskId - The ID of the task associated with the drag operation.
 */
function startMobileDrag(target, taskId) {
    if (!target) {
        console.error("startMobileDrag: Target is null or undefined.");
        return;
    }
    
    // Store the original position before dragging
    const originalRect = target.getBoundingClientRect();
    target.dataset.originalLeft = originalRect.left + 'px';
    target.dataset.originalTop = originalRect.top + 'px';
    
    target.setAttribute("draggable", "true");
    target.classList.add("dragging");
    target.style.position = 'absolute';
    target.style.left = originalRect.left + 'px';
    target.style.top = originalRect.top + 'px';

    const dragEvent = new DragEvent("dragstart", {
        bubbles: true,
        cancelable: true,
    });
    target.dispatchEvent(dragEvent);
}


/**
 * Handles a click event on a task. If the task is not being dragged, it displays the task overlay.
 * 
 * @param {MouseEvent} event - The mouse event triggered by clicking the task.
 * @param {string} taskId - The ID of the task being clicked.
 */
function handleTaskClick(event, taskId) {
    const target = document.getElementById(taskId);
    if (target.classList.contains("dragging")) {
        return;
    }
    getTaskOverlay(taskId);
}


/**
 * Handles the touch start event by initializing touch coordinates and preparing for a drag action.
 * 
 * @param {TouchEvent} event - The touch start event.
 * @param {string} taskId - The ID of the task being interacted with.
 */
function handleTouchStart(event, taskId) {
    const touch = event.touches[0];
    initializeTouchCoordinates(touch);
    taskIdForClick = taskId;
    initialScrollTop = window.scrollY;

    const dropZone = event.target.closest('.drop-zone');
    if (dropZone) {
        scrollStartX = dropZone.scrollLeft;
    }

    longPressTimer = setTimeout(() => {
        isDragging = true;
        startDragging(event, taskId);
    }, LONG_PRESS_DELAY);
}


/**
 * Initializes the touch coordinates for drag and scroll calculations.
 * 
 * @param {Touch} touch - The first touch point of the touch event.
 */
function initializeTouchCoordinates(touch) {
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    initialTouchY = touch.clientY;
    currentTouchY = touch.clientY;
    lastScrollY = window.scrollY;
    isVerticalScroll = false;
}


/**
 * Handles the touchmove event, managing the drag and scroll behavior during a touch event.
 * 
 * @param {TouchEvent} event - The touchmove event triggered by the user's touch move.
 */
function handleTouchMove(event) {
    if (!taskIdForClick && !isDragging) return;

    const touch = event.touches[0];
    currentTouchY = touch.clientY;
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const dropZone = event.target.closest('.drop-zone');

    if (!isDragging && !isScrolling) {
        const scrollDirection = determineScrollDirection(touch.clientX, touch.clientY);
        
        if (scrollDirection === 'vertical') {
            isVerticalScroll = true;
            clearTimeout(longPressTimer);
            return;
        }
    }

    if (isDragging) {
        event.preventDefault();
        handleDragging(deltaX, deltaY, event);
        highlightDropZone(event);
    } else if (!isVerticalScroll && Math.abs(deltaX) > SCROLL_THRESHOLD && dropZone) {
        event.preventDefault();
        handleScrolling(deltaX, event, dropZone);
    }

    handleLongPressClear(deltaX, deltaY);
}


/**
 * Handles both the dragging and scrolling behavior based on touch movement.
 * 
 * @param {number} deltaX - The horizontal movement of the touch.
 * @param {number} deltaY - The vertical movement of the touch.
 * @param {TouchEvent} event - The touchmove event triggered by the user's touch move.
 * @param {Element} dropZone - The drop zone element where scrolling is happening.
 */
function handleDragOrScroll(deltaX, deltaY, event, dropZone) {
    if (isDragging) {
        handleDragging(deltaX, deltaY, event);
    } else if (Math.abs(deltaX) > SCROLL_THRESHOLD && dropZone) {
        handleScrolling(deltaX, event, dropZone);
    }
}


/**
 * Handles the scrolling behavior when dragging horizontally over a drop zone.
 * 
 * @param {number} deltaX - The horizontal movement of the touch.
 * @param {TouchEvent} event - The touchmove event triggered by the user's touch move.
 * @param {Element} dropZone - The drop zone element where scrolling is happening.
 */
function handleScrolling(deltaX, event, dropZone) {
    isScrolling = true;
    dropZone.scrollLeft = scrollStartX - deltaX;
    event.preventDefault();
}


/**
 * Clears the long press timeout if the touch move distance exceeds a threshold.
 * 
 * @param {number} deltaX - The horizontal movement of the touch.
 * @param {number} deltaY - The vertical movement of the touch.
 */
function handleLongPressClear(deltaX, deltaY) {
    if (Math.abs(deltaX) > SCROLL_THRESHOLD || Math.abs(deltaY) > SCROLL_THRESHOLD) {
        clearTimeout(longPressTimer);
    }
}


/**
 * Handles the movement of a dragged element during touch events.
 * 
 * @param {TouchEvent|MouseEvent} event - The event triggered by the user's touch or mouse move.
 * @param {number} deltaX - The horizontal distance moved by the element.
 * @param {number} deltaY - The vertical distance moved by the element.
 */
function handleDragMove(event, deltaX, deltaY) {
    if (!activeElement) return;

    const touch = event.touches ? event.touches[0] : event;
    const elementUnderCursor = document.elementFromPoint(touch.clientX, touch.clientY);

    // Use the stored original position as the reference point
    const originalLeft = parseFloat(activeElement.dataset.originalLeft || 0);
    const originalTop = parseFloat(activeElement.dataset.originalTop || 0);

    activeElement.style.left = `${originalLeft + deltaX}px`;
    activeElement.style.top = `${originalTop + deltaY}px`;
    activeElement.style.zIndex = "1000";

    highlightDropZone(event);
}


/**
 * Handles the mouse movement during a drag operation.
 * 
 * @param {MouseEvent} event - The mousemove event triggered by the user's mouse move.
 */
function handleMouseMove(event) {
    if (!isDragging || !activeElement) return;
    event.preventDefault();
    const deltaX = event.clientX - touchStartX;
    const deltaY = event.clientY - touchStartY;
    activeElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    startAutoScroll(event);
    highlightDropZone(event);
}


/**
 * Handles the end of a touch or mouse interaction, stopping drag and scroll actions.
 * 
 * @param {TouchEvent|MouseEvent} event - The touchend or mouseup event triggered by the user.
 */
function handleTouchEnd(event) {
    clearTimeout(longPressTimer);
    stopAutoScroll();
    
    if (isDragging) {
        isDragging = false;
        finishDrag(event);
    } else if (!isScrolling && !isVerticalScroll && taskIdForClick) {
        handleTaskClick(event, taskIdForClick);
    }
    
    isScrolling = false;
    isVerticalScroll = false;
    taskIdForClick = null;
    activeElement = null;
    resetHighlights();
}

