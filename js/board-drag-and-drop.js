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
let rafId = null;

const LONG_PRESS_DELAY = 500;
const SCROLL_THRESHOLD = 15;
const DRAG_THRESHOLD = 50;
const AUTO_SCROLL_THRESHOLD = 200;
const AUTO_SCROLL_SPEED = 10;
const AUTO_SCROLL_INTERVAL = 16;
const VERTICAL_SCROLL_THRESHOLD = 30;
const TOUCH_SENSITIVITY = 0.5;

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

function determineScrollDirection(touchX, touchY) {
    const deltaX = Math.abs(touchX - touchStartX);
    const deltaY = Math.abs(touchY - touchStartY);
    
    if (deltaY > VERTICAL_SCROLL_THRESHOLD && deltaY > deltaX * 1.2) {
        return 'vertical';
    } else if (deltaX > SCROLL_THRESHOLD && deltaX > deltaY * 1.2) {
        return 'horizontal';
    }
    return null;
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    const target = event.target;
    if (!target) return;
    event.dataTransfer.setData("text", target.id);
    target.classList.add("dragging");
}

async function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
    const dropZone = event.target.closest('.drop-zone');

    if (!draggedElement || !dropZone) return;

    draggedElement.classList.remove('dragging');
    dropZone.appendChild(draggedElement);
    draggedElement.style.pointerEvents = "none";
    resetHighlights();

    try {
        await updateTaskStatus(data, dropZone.id);
    } catch (error) {
        console.error('Error updating task status:', error);
    }
}

const handleDragOver = throttle((event) => {
    event.preventDefault();
}, 16);

const handleDragEnter = throttle((event) => {
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
}, 16);

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

function resetHighlights() {
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('highlight');
        dropZoneCounters.set(zone, 0);
    });
}

function initializeDropZones() {
    const dropZones = document.querySelectorAll('.drop-zone');
    dropZones.forEach(dropZone => {
        dropZoneCounters.set(dropZone, 0);
        dropZone.addEventListener('dragover', handleDragOver, { passive: false });
        dropZone.addEventListener('dragenter', handleDragEnter, { passive: false });
        dropZone.addEventListener('dragleave', handleDragLeave, { passive: true });
        dropZone.addEventListener('drop', drop, { passive: false });
    });
}

function startDragging(event, taskId) {
    const target = document.getElementById(taskId);
    if (!target) return;

    const touch = getTouchPoint(event);
    const rect = target.getBoundingClientRect();
    const { offsetX, offsetY } = calculateOffsets(touch, rect);

    setupDraggingElement(target, rect, offsetX, offsetY);
    storeDraggingOffsets(target, offsetX, offsetY);
}

function getTouchPoint(event) {
    return event.touches ? event.touches[0] : event;
}

function calculateOffsets(touch, rect) {
    const offsetX = (touch.clientX - rect.left) * TOUCH_SENSITIVITY;
    const offsetY = (touch.clientY - rect.top) * TOUCH_SENSITIVITY;
    return { offsetX, offsetY };
}

function setupDraggingElement(target, rect, offsetX, offsetY) {
    activeElement = target;
    activeElement.classList.add('dragging');
    activeElement.style.position = 'fixed';
    activeElement.style.left = `${rect.left}px`;
    activeElement.style.top = `${rect.top}px`;
    activeElement.style.zIndex = '1000';
    activeElement.style.pointerEvents = 'none';
}

function storeDraggingOffsets(target, offsetX, offsetY) {
    target.dataset.offsetX = offsetX;
    target.dataset.offsetY = offsetY;
}

function handleDragging(deltaX, deltaY, event) {
    if (!activeElement) return;
    
    event.preventDefault();
    startAutoScroll(event);

    const scrollOffset = window.scrollY - lastScrollY;
    const offsetX = parseFloat(activeElement.dataset.offsetX) || 0;
    const offsetY = parseFloat(activeElement.dataset.offsetY) || 0;

    const newX = (deltaX * TOUCH_SENSITIVITY) - offsetX;
    const newY = (deltaY * TOUCH_SENSITIVITY) - offsetY + scrollOffset;

    activeElement.style.transform = `translate(${newX}px, ${newY}px)`;
    highlightDropZone(event);
}

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

const handleScrolling = throttle((deltaX, event, dropZone) => {
    if (!dropZone) return;
    
    isScrolling = true;
    dropZone.scrollLeft = scrollStartX - (deltaX * TOUCH_SENSITIVITY);
    event.preventDefault();
}, 16);

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
    activeElement.style.pointerEvents = "";
    activeElement = null;
    lastHighlightedZone = null;
}

function initializeDragAndDrop() {
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseup', handleTouchEnd, { passive: true });
    
    document.addEventListener('mouseleave', () => {
        stopAutoScroll();
        if (isDragging) {
            handleTouchEnd(new MouseEvent('mouseup'));
        }
    }, { passive: true });

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
}

const handleTouchStart = (event) => {
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
};

const handleTouchMove = throttle((event) => {
    if (!isDragging) {
        clearTimeout(longPressTimer);
        const touch = event.touches[0];
        const deltaX = (touch.clientX - touchStartX) * TOUCH_SENSITIVITY;
        const deltaY = (touch.clientY - touchStartY) * TOUCH_SENSITIVITY;
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
}, 16);

function handleTouchEnd(event) {
    clearTimeout(longPressTimer);
    stopAutoScroll();
    if (isDragging) {
        finishDrag(event);
        isDragging = false;
    }
}

function handleMouseMove(event) {
    if (isDragging) {
        const deltaX = event.clientX - touchStartX;
        const deltaY = event.clientY - touchStartY;
        handleDragging(deltaX, deltaY, event);
    }
}

const startAutoScroll = throttle((event) => {
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
}, 16);

function stopAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
}

function cleanup() {
    stopAutoScroll();
    clearTimeout(longPressTimer);
    if (rafId) {
        cancelAnimationFrame(rafId);
    }
    resetHighlights();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeDropZones();
        initializeDragAndDrop();
        loadTasks().then(getTaskTemplate);
    });
} else {
    initializeDropZones();
    initializeDragAndDrop();
    loadTasks().then(getTaskTemplate);
}

window.addEventListener('unload', cleanup);