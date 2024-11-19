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
let dropZoneCounters = new Map();




const LONG_PRESS_DELAY = 500;
const SCROLL_THRESHOLD = 10;
const DRAG_THRESHOLD = 30;
const AUTO_SCROLL_THRESHOLD = 200; 
const AUTO_SCROLL_SPEED = 10; 
const AUTO_SCROLL_INTERVAL = 16; 

function startAutoScroll(e) {
    currentMouseY = e.touches ? e.touches[0].clientY : e.clientY;
    currentTouchY = currentMouseY; 
    
    if (autoScrollInterval) return;

    lastScrollY = window.scrollY; 

    autoScrollInterval = setInterval(() => {
        const windowHeight = window.innerHeight;
        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        let scrollDelta = 0;

        if (currentMouseY < AUTO_SCROLL_THRESHOLD) {
            
            if (scrollY > 0) {
                scrollDelta = -AUTO_SCROLL_SPEED;
                window.scrollBy(0, scrollDelta);
            }
        } else if (currentMouseY > windowHeight - AUTO_SCROLL_THRESHOLD) {
            
            if (scrollY < maxScroll) {
                scrollDelta = AUTO_SCROLL_SPEED;
                window.scrollBy(0, scrollDelta);
            }
        }

        
        if (activeElement && scrollDelta !== 0) {
            const currentTransform = getComputedStyle(activeElement).transform;
            const matrix = new DOMMatrixReadOnly(currentTransform);
            const currentY = matrix.m42 || 0;
            
            
            const touchDeltaY = currentTouchY - initialTouchY;
            const scrollOffset = window.scrollY - lastScrollY;
            const newY = touchDeltaY + scrollOffset;
            
            activeElement.style.transform = `translate(${matrix.m41 || 0}px, ${newY}px)`;
        }
    }, AUTO_SCROLL_INTERVAL);
}

function updateDraggedElementPosition(deltaX, deltaY) {
    if (activeElement) {
        const currentTransform = window.getComputedStyle(activeElement).transform;
        const matrix = new DOMMatrixReadOnly(currentTransform);
        const currentX = matrix.m41;
        const currentY = matrix.m42;
        
        activeElement.style.transform = `translate(${currentX + deltaX}px, ${currentY + deltaY}px)`;
    }
}


function stopAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
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

    if (draggedElement && dropZone) {
        draggedElement.classList.remove('dragging');
        dropZone.appendChild(draggedElement);
        draggedElement.style.pointerEvents = "none";
        const newStatus = dropZone.id;
        await updateTaskStatus(data, newStatus);
        resetHighlights(); // Hier werden alle Highlights und Counter zurückgesetzt
    }
}

function updateTaskStatusInLocalData(taskId, newStatus) {
    allTasks[taskId].status = newStatus;
}


async function sendStatusUpdateToFirebase(taskId, newStatus) {
    const response = await fetch(`${DB_URL}/tasks/${taskId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
    });

    return response;
}


async function updateTaskStatus(taskId, newStatus) {
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


function handleDragOver(event) {
    event.preventDefault();
}


function handleDragEnter(event) {
    event.preventDefault();
    const dropZone = event.target.closest('.drop-zone');
    
    if (!dropZone) return;

    // Alle anderen Highlights entfernen
    document.querySelectorAll('.drop-zone').forEach(zone => {
        if (zone !== dropZone) {
            zone.classList.remove('highlight');
            dropZoneCounters.set(zone, 0);
        }
    });

    // Counter für diese Zone erhöhen
    const counter = dropZoneCounters.get(dropZone) || 0;
    dropZoneCounters.set(dropZone, counter + 1);
    
    dropZone.classList.add('highlight');
}


function handleDragLeave(event) {
    const dropZone = event.target.closest('.drop-zone');
    
    if (!dropZone) return;

    // Counter für diese Zone verringern
    const counter = dropZoneCounters.get(dropZone) || 0;
    dropZoneCounters.set(dropZone, counter - 1);

    // Highlight nur entfernen, wenn Counter 0 erreicht
    if (dropZoneCounters.get(dropZone) <= 0) {
        dropZone.classList.remove('highlight');
        dropZoneCounters.set(dropZone, 0);
    }
}


function resetHighlights() {
    const dropZones = document.querySelectorAll('.drop-zone');
    dropZones.forEach(zone => {
        zone.classList.remove('highlight');
        dropZoneCounters.set(zone, 0);
    });
}

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


function handleTaskClick(event, taskId) {
    const target = document.getElementById(taskId);
    if (target.classList.contains("dragging")) {
        return;
    }
    getTaskOverlay(taskId);
}


function handleTouchStart(event, taskId) {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    initialTouchY = touch.clientY; 
    currentTouchY = touch.clientY; 
    lastScrollY = window.scrollY; 
    taskIdForClick = taskId;
    
    const dropZone = event.target.closest('.drop-zone');
    if (dropZone) {
        scrollStartX = dropZone.scrollLeft;
    }

    longPressTimer = setTimeout(() => {
        isDragging = true;
        startDragging(event, taskId);
    }, LONG_PRESS_DELAY);
}



function startDragging(event, taskId) {
    const target = document.getElementById(taskId);
    if (!target) return;

    activeElement = target;
    activeElement.classList.add('dragging');
    activeElement.style.position = 'absolute';
    activeElement.style.zIndex = '1000';
}



function handleTouchMove(event) {
    
    if (event.cancelable) {
        event.preventDefault();
    }
    if (!taskIdForClick && !isDragging) return;

    const touch = event.touches[0];
    currentTouchY = touch.clientY; 
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const dropZone = event.target.closest('.drop-zone');

    if (isDragging) {
        event.preventDefault();
        startAutoScroll(event);
        
        
        const scrollOffset = window.scrollY - lastScrollY;
        const newY = deltaY + scrollOffset;
        
        if (activeElement) {
            activeElement.style.transform = `translate(${deltaX}px, ${newY}px)`;
        }
    } else if (Math.abs(deltaX) > SCROLL_THRESHOLD && dropZone) {
        isScrolling = true;
        dropZone.scrollLeft = scrollStartX - deltaX;
        event.preventDefault();
    }

    if (Math.abs(deltaX) > SCROLL_THRESHOLD || Math.abs(deltaY) > SCROLL_THRESHOLD) {
        clearTimeout(longPressTimer);
    }

    
    if (isDragging) {
        highlightDropZone(event);
    }
}


function handleDragMove(event, deltaX, deltaY) {
    if (!activeElement) return;

    const touch = event.touches ? event.touches[0] : event;
    const elementUnderCursor = document.elementFromPoint(touch.clientX, touch.clientY);

    activeElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    activeElement.style.position = "absolute";
    activeElement.style.zIndex = "1000";

    
    highlightDropZone(event);
}


function handleMouseMove(event) {
    if (!isDragging || !activeElement) return;

    event.preventDefault();

    const deltaX = event.clientX - touchStartX;
    const deltaY = event.clientY - touchStartY;

    activeElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    
    
    startAutoScroll(event);

    
    highlightDropZone(event);
}


function handleTouchEnd(event) {
    clearTimeout(longPressTimer);
    stopAutoScroll();

    if (isDragging) {
        isDragging = false;
        finishDrag(event);
    } else if (!isScrolling && taskIdForClick) {
        handleTaskClick(event, taskIdForClick);
    }

    
    isScrolling = false;
    taskIdForClick = null;
    activeElement = null;

    
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('highlight');
    });
}


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


let lastHighlightedZone = null;
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
document.addEventListener('touchmove', handleTouchMove, { passive: false });