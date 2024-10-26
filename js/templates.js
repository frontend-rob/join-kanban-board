function getSummaryContent() {
    return `
        <section class="summary-stats-container">
            <div class="first-stats-section">
                <a href="../pages/board.html" id="summary-todo" class="summary-card">
                    <div class="summary-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                            <path
                                d="M230.14,70.54,185.46,25.85a20,20,0,0,0-28.29,0L33.86,149.17A19.85,19.85,0,0,0,28,163.31V208a20,20,0,0,0,20,20H92.69a19.86,19.86,0,0,0,14.14-5.86L230.14,98.82a20,20,0,0,0,0-28.28ZM91,204H52V165l84-84,39,39ZM192,103,153,64l18.34-18.34,39,39Z">
                            </path>
                        </svg>
                    </div>
                    <div class="task-count">
                        <span id="amount-todo" class="summary-card-number"></span>
                        <span class="summary-card-label">To-Do</span>
                    </div>
                </a>
                <a href="../pages/board.html" id="summary-done" class="summary-card">
                    <div class="summary-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                            <path d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z"></path>
                        </svg>
                    </div>
                    <div class="task-count">
                        <span id="amount-done" class="summary-card-number"></span>
                        <span class="summary-card-label">Done</span>
                    </div>
                </a>
            </div>
            <a href="../pages/board.html" class="second-stats-section">
                <div id="summary-priority" class="summary-card-secondary">
                    <div id="summary-urgent" class="summary-card-urgent">
                        <div class="summary-icon-urgent">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 256 256">
                                <path
                                    d="M216.49,191.51a12,12,0,0,1-17,17L128,137,56.49,208.49a12,12,0,0,1-17-17l80-80a12,12,0,0,1,17,0Zm-160-63L128,57l71.51,71.52a12,12,0,0,0,17-17l-80-80a12,12,0,0,0-17,0l-80,80a12,12,0,0,0,17,17Z">
                                </path>
                            </svg>
                        </div>
                        <div class="task-count">
                            <span id="amount-urgent" class="summary-card-number"></span>
                            <span class="summary-card-label">Urgent</span>
                        </div>
                    </div>
                </div>
                <div class="divider-vertical-summary"></div>
                <div class="due-date">
                    <span id="due-date" class="summary-card-date"></span>
                    <span id="due-date-label" class="summary-card-label"></span>
                </div>
            </a>
            <div class="third-stats-section">
                <a href="../pages/board.html" id="summary-total" class="summary-card-tertiary">
                    <div class="task-count">
                        <span id="amount-total" class="summary-card-number"></span>
                        <span class="summary-card-label">Tasks in <br>Board</span>
                    </div>
                </a>
                <a href="../pages/board.html" id="summary-progress" class="summary-card-tertiary">
                    <div class="task-count">
                        <span id="amount-inprogress" class="summary-card-number"></span>
                        <span class="summary-card-label">Tasks in <br>Processes</span>
                    </div>
                </a>
                <a href="../pages/board.html" id="summary-feedback" class="summary-card-tertiary">
                    <div class="task-count">
                        <span id="amount-feedback" class="summary-card-number"></span>
                        <span class="summary-card-label">Awaiting <br>Feedback</span>
                    </div>
                </a>
            </div>
        </section>
        <section class="summary-greeting-container">
            <span id="greeting-time">Good afternoon,</span>
            <span id="greeting-username">Guest</span>
        </section>
    `;
}