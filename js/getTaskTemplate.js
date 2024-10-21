async function loadTasks() {
    try {
        const response = await fetch('../joinDB.json');
        const data = await response.json();
        return data.tasks;
    } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        return {};
    }
}

function getTaskTemplate(tasks) {
    let toDoTasks = '';
    let inProgressTasks = '';
    let awaitFeedbackTasks = '';
    let doneTasks = '';

    for (const taskId in tasks) {
        const task = tasks[taskId];

        const subtasksCompleted = task.subtasks.filter(subtask => subtask.status === "checked").length;
        const totalSubtasks = task.subtasks.length;
        const progressPercentage = totalSubtasks > 0 ? (subtasksCompleted / totalSubtasks) * 100 : 0;

        const assignedToHTML = task.assigned_to.map(person => `
            <div class="profile-icon" style="background-color: ${person.color};">
                ${person.initials}
            </div>
        `).join('');

        const taskTemplate = `
            <div class="task" draggable="true" ondragstart="drag(event)" id="${task.id}"
                onclick="openTaskOverlay('${task.id}')">
                <div class="task-type">${task.category}</div>
                <span class="task-title">${task.title}</span>
                <p class="task-description">${task.description}</p>
                <div class="subtask">
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${progressPercentage}%"></div>
                    </div>
                    <div class="subtask-text">${subtasksCompleted}/${totalSubtasks} Subtasks</div>
                </div>
                <div class="profile-icon-and-level">
                    <div class="icons">
                        ${assignedToHTML}
                    </div>
                    <img class="level" src="../assets/icons/priority-${task.priority}.svg" alt="Priority Level">
                </div>
            </div>
        `;

        switch (task.status) {
            case 'todo':
                toDoTasks += taskTemplate;
                break;
            case 'inprogress':
                inProgressTasks += taskTemplate;
                break;
            case 'awaitfeedback':
                awaitFeedbackTasks += taskTemplate;
                break;
            case 'done':
                doneTasks += taskTemplate;
                break;
        }
    }

    document.getElementById('to-do').innerHTML = toDoTasks;
    document.getElementById('in-progress').innerHTML = inProgressTasks;
    document.getElementById('await-feedback').innerHTML = awaitFeedbackTasks;
    document.getElementById('done').innerHTML = doneTasks;
}
