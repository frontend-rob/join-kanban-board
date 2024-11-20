/**
 * Initializes the auto-scroll by capturing the initial touch or mouse position.
 * 
 * @param {Event} e - The touch or mouse event triggering the auto-scroll.
 */
function startAutoScroll(e) {
    currentMouseY = e.touches ? e.touches[0].clientY : e.clientY;
    currentTouchY = currentMouseY;
    
    if (autoScrollInterval) return;

    lastScrollY = window.scrollY;
    startAutoScrollInterval();
}


/**
 * Starts the auto-scroll interval that moves the page based on the current mouse/touch position.
 */
function startAutoScrollInterval() {
    autoScrollInterval = setInterval(() => {
        const windowHeight = window.innerHeight;
        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        let scrollDelta = getScrollDelta(windowHeight, scrollY, maxScroll);
        applyScroll(scrollDelta);
    }, AUTO_SCROLL_INTERVAL);
}


/**
 * Determines the scroll delta based on the current mouse or touch position.
 * 
 * @param {number} windowHeight - The height of the window.
 * @param {number} scrollY - The current vertical scroll position.
 * @param {number} maxScroll - The maximum scrollable height of the document.
 * @returns {number} - The scroll delta to apply.
 */
function getScrollDelta(windowHeight, scrollY, maxScroll) {
    let scrollDelta = 0;

    if (currentMouseY < AUTO_SCROLL_THRESHOLD) {
        if (scrollY > 0) {
            scrollDelta = -AUTO_SCROLL_SPEED;
        }
    } else if (currentMouseY > windowHeight - AUTO_SCROLL_THRESHOLD) {
        if (scrollY < maxScroll) {
            scrollDelta = AUTO_SCROLL_SPEED;
        }
    }

    return scrollDelta;
}


/**
 * Applies the scroll by updating the window's scroll position and the dragged element's position.
 * 
 * @param {number} scrollDelta - The scroll delta to apply to the page.
 */
function applyScroll(scrollDelta) {
    if (scrollDelta !== 0) {
        window.scrollBy(0, scrollDelta);
        updateDraggedElementPosition(scrollDelta);
    }
}


/**
 * Updates the dragged element's position during scrolling.
 * 
 * @param {number} scrollDelta - The scroll delta to update the dragged element's Y position.
 */
function updateDraggedElementPosition(scrollDelta) {
    if (activeElement) {
        const currentTransform = getComputedStyle(activeElement).transform;
        const matrix = new DOMMatrixReadOnly(currentTransform);
        const currentY = matrix.m42 || 0;

        const touchDeltaY = currentTouchY - initialTouchY;
        const scrollOffset = window.scrollY - lastScrollY;
        const newY = touchDeltaY + scrollOffset;

        activeElement.style.transform = `translate(${matrix.m41 || 0}px, ${newY}px)`;
    }
}


/**
 * Updates the position of the dragged element by applying a transform translation.
 * 
 * @param {number} deltaX - The change in the X position.
 * @param {number} deltaY - The change in the Y position.
 */
function updateDraggedElementPosition(deltaX, deltaY) {
    if (activeElement) {
        const currentTransform = window.getComputedStyle(activeElement).transform;
        const matrix = new DOMMatrixReadOnly(currentTransform);
        const currentX = matrix.m41;
        const currentY = matrix.m42;
        
        activeElement.style.transform = `translate(${currentX + deltaX}px, ${currentY + deltaY}px)`;
    }
}


/**
 * Stops the auto-scrolling behavior by clearing the interval.
 */
function stopAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
}