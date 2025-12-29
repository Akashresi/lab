/**
 * QuizMaster Pro - Core Application Logic
 * Refactored for modern standards, accessibility, and UX.
 */

/* === State & Storage === */
const Store = {
    get: (key) => JSON.parse(localStorage.getItem(key)) || [],
    set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
    theme: () => localStorage.getItem('theme') || 'light'
};

/* === UI Components (Modal, Toast, Router) === */
const UI = {
    modal: {
        overlay: document.getElementById('modal-overlay'),
        title: document.getElementById('modal-title'),
        body: document.getElementById('modal-body'),
        actions: document.getElementById('modal-actions'),

        show(title, content, onConfirm = null, confirmText = 'OK', type = 'info') {
            this.title.textContent = title;
            this.body.innerHTML = content;
            this.actions.innerHTML = '';

            const closeBtn = document.createElement('button');
            closeBtn.className = 'btn btn-outline';
            closeBtn.textContent = onConfirm ? 'Cancel' : 'Close';
            closeBtn.onclick = () => this.hide();
            this.actions.appendChild(closeBtn);

            if (onConfirm) {
                const confirmBtn = document.createElement('button');
                confirmBtn.className = `btn btn-${type === 'danger' ? 'danger' : 'primary'}`;
                confirmBtn.textContent = confirmText;
                confirmBtn.onclick = () => {
                    onConfirm();
                    this.hide();
                };
                this.actions.appendChild(confirmBtn);
            }

            this.overlay.classList.add('open');
            this.overlay.setAttribute('aria-hidden', 'false');
            // Trap focus roughly
            closeBtn.focus();
        },

        hide() {
            this.overlay.classList.remove('open');
            this.overlay.setAttribute('aria-hidden', 'true');
        }
    },

    toast: {
        container: document.getElementById('toast-container'),

        show(message, type = 'success') {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            `;
            this.container.appendChild(toast);

            // Animation trigger
            requestAnimationFrame(() => toast.classList.add('show'));

            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 400);
            }, 3000);
        }
    }
};

/* === Router === */
class Router {
    constructor() {
        this.pages = document.querySelectorAll('.page');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.currentPage = 'dashboard';

        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) this.navigate(e.state.page, false);
        });
    }

    navigate(pageId, pushState = true) {
        if (!document.getElementById(pageId)) return;

        this.pages.forEach(p => p.classList.remove('active'));
        this.navLinks.forEach(l => l.classList.remove('active'));

        document.getElementById(pageId).classList.add('active');
        const activeLink = document.getElementById(`nav-${pageId}`);
        if (activeLink) activeLink.classList.add('active');

        if (pushState) {
            history.pushState({ page: pageId }, '', `#${pageId}`);
        }

        this.currentPage = pageId;
        window.scrollTo(0, 0);

        // Refresh data based on page
        if (pageId === 'dashboard') App.initDashboard();
        if (pageId === 'quizzes') App.initQuizzes();
        if (pageId === 'challenges') App.initChallenges();
    }
}

const router = new Router();

/* === Core Logic === */
const App = {
    init() {
        // Theme Init
        const theme = Store.theme();
        document.body.setAttribute('data-theme', theme);
        document.getElementById('theme-icon').className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

        // Check hash for initial route
        const hash = window.location.hash.slice(1) || 'dashboard';
        // Simple hash check for known routes
        const validRoutes = ['dashboard', 'quizzes', 'challenges', 'interviews', 'quiz-create', 'challenge-create'];
        const route = validRoutes.includes(hash) ? hash : 'dashboard';

        router.navigate(route, false);

        this.bindEvents();
        this.initDashboard();
    },

    bindEvents() {
        // Forms
        document.getElementById('quiz-form').addEventListener('submit', (e) => this.handleQuizSubmit(e));
        document.getElementById('challenge-form').addEventListener('submit', (e) => this.handleChallengeSubmit(e));
        document.getElementById('interview-form').addEventListener('submit', (e) => this.handleInterviewGenerate(e));

        // Toggles
        document.querySelectorAll('input[name="quiz-mode"]').forEach(r =>
            r.addEventListener('change', e => this.toggleFormSection('quiz-manual-form', 'quiz-ai-form', e.target.value))
        );
        document.querySelectorAll('input[name="challenge-mode"]').forEach(r =>
            r.addEventListener('change', e => this.toggleFormSection('challenge-manual-form', 'challenge-ai-form', e.target.value))
        );
    },

    toggleFormSection(manualId, aiId, mode) {
        const manual = document.getElementById(manualId);
        const ai = document.getElementById(aiId);

        if (mode === 'manual') {
            manual.classList.remove('u-hidden');
            ai.classList.add('u-hidden');
        } else {
            manual.classList.add('u-hidden');
            ai.classList.remove('u-hidden');
        }
    },

    /* === Data Helpers === */
    getStatus(item) {
        const now = new Date();
        const start = new Date(item.startTime);
        const end = new Date(start.getTime() + item.duration * 60000);

        if (now < start) return 'pending';
        if (now < end) return 'active';
        return 'completed';
    },

    /* === Dashboard & Lists === */
    renderItem(item, type, index, showActions = true) {
        const status = this.getStatus(item);
        const statusLabels = { pending: 'Upcoming', active: 'Live Now', completed: 'Ended' };
        const aiBadge = item.aiGenerated ? '<span class="status-badge" style="background:var(--color-accent);color:white;margin-left:0.5rem;"><i class="fas fa-robot"></i> AI</span>' : '';

        return `
            <div class="item-card status-${status}">
                <div class="item-info">
                    <h4>${item.name} ${aiBadge}</h4>
                    <div class="item-meta">
                        <span class="status-badge status-${status}">${statusLabels[status]}</span>
                        <span><i class="far fa-calendar"></i> ${new Date(item.startTime).toLocaleString()}</span>
                        <span><i class="far fa-clock"></i> ${item.duration} min</span>
                    </div>
                </div>
                ${showActions ? `
                <div style="display:flex;gap:0.5rem;">
                    <button class="btn btn-primary btn-sm" onclick="App.startItem('${type}', ${index})">Start</button>
                    <button class="btn btn-danger btn-sm" onclick="App.deleteItem('${type}', ${index})"><i class="fas fa-trash"></i></button>
                </div>` : ''}
            </div>
        `;
    },

    initDashboard() {
        const quizzes = Store.get('quizzes');
        const challenges = Store.get('challenges');

        const renderSection = (id, items, type, icon) => {
            const container = document.getElementById(id);
            if (items.length === 0) {
                container.innerHTML = `<div class="empty-state"><i class="fas ${icon} empty-icon"></i><p>No items yet.</p></div>`;
                return;
            }
            // Group by status
            const groups = ['active', 'pending', 'completed'];
            let html = '';
            groups.forEach(status => {
                const groupItems = items.filter(i => this.getStatus(i) === status);
                if (groupItems.length) {
                    html += `<h4 class="u-mb-1" style="margin-top:1.5rem;text-transform:capitalize;">${status} (${groupItems.length})</h4>`;
                    html += groupItems.map(i => this.renderItem(i, type, items.indexOf(i), false)).join('');
                }
            });
            container.innerHTML = html || '<p class="u-center-text">No active items.</p>';
        };

        renderSection('dashboard-quizzes-content', quizzes, 'quiz', 'fa-book-open');
        renderSection('dashboard-challenges-content', challenges, 'challenge', 'fa-laptop-code');
    },

    initQuizzes() {
        const quizzes = Store.get('quizzes');
        const container = document.getElementById('quiz-list');
        container.innerHTML = quizzes.length === 0
            ? '<div class="empty-state"><i class="fas fa-list-ul empty-icon"></i><p>No quizzes yet. Create one!</p></div>'
            : quizzes.map((q, i) => this.renderItem(q, 'quiz', i)).join('');
    },

    initChallenges() {
        const challenges = Store.get('challenges');
        const container = document.getElementById('challenge-list');
        container.innerHTML = challenges.length === 0
            ? '<div class="empty-state"><i class="fas fa-terminal empty-icon"></i><p>No challenges yet. Create one!</p></div>'
            : challenges.map((c, i) => this.renderItem(c, 'challenge', i)).join('');
    },

    /* === Logic Actions === */
    startItem(type, index) {
        const items = Store.get(type + 's');
        const item = items[index];

        // Use Modal instead of prompt
        const content = `
            <p>This ${type} is protected.</p>
            <div class="form-group">
                <label>Enter Password</label>
                <input type="password" id="modal-password-input" class="form-control" placeholder="Password" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;">
            </div>
        `;

        UI.modal.show(`Start ${item.name}`, content, () => {
            const input = document.getElementById('modal-password-input').value;
            if (input === item.password) {
                UI.toast.show(`Access Granted! Starting ${item.name}...`);
                // Simulate navigation or start
            } else {
                UI.toast.show('Incorrect Password', 'error');
            }
        }, 'Start');
    },

    deleteItem(type, index) {
        UI.modal.show('Confirm Deletion', 'Are you sure you want to permanently delete this item?', () => {
            const items = Store.get(type + 's');
            items.splice(index, 1);
            Store.set(type + 's', items);

            UI.toast.show('Item deleted successfully.');

            // Refresh
            if (type === 'quiz') this.initQuizzes();
            if (type === 'challenge') this.initChallenges();
            this.initDashboard();
        }, 'Delete', 'danger');
    },

    /* === Generators === */
    generateQuizQuestions(topic, level, num) {
        const questions = [];
        const topics = ['Concepts', 'Best Practices', 'Edge Cases', 'History', 'Syntax'];

        for (let i = 0; i < num; i++) {
            const sub = topics[i % topics.length];
            questions.push({
                text: `What is a key characteristic of ${topic} regarding ${sub}?`,
                options: [
                    `It optimizes performance for ${level} use cases.`,
                    `It is strictly deprecated in modern versions.`,
                    `The Correct Answer for ${sub}.`,
                    `It has no effect on runtime.`
                ],
                correct: 2 // generic index
            });
        }
        return questions;
    },

    /* === Form Handlers === */
    handleQuizSubmit(e) {
        e.preventDefault();
        const mode = document.querySelector('input[name="quiz-mode"]:checked').value;
        const name = document.getElementById('quiz-name').value;

        // Simulating AI Load
        if (mode === 'ai') {
            UI.modal.show('Generating Quiz', `
                <div class="u-center-text">
                    <p class="u-mb-1">Our AI is crafting questions about <strong>${document.getElementById('quiz-topic').value}</strong>...</p>
                    <div class="skeleton skeleton-block" style="height:20px;margin-bottom:10px;"></div>
                    <div class="skeleton skeleton-block" style="height:20px;margin-bottom:10px;"></div>
                    <div class="skeleton skeleton-block" style="height:20px;"></div>
                </div>
            `); // No buttons, just loading state visuals essentially

            setTimeout(() => {
                UI.modal.hide();
                this.finalizeQuizCreation(mode);
            }, 1500);
        } else {
            this.finalizeQuizCreation(mode);
        }
    },

    finalizeQuizCreation(mode) {
        let questions = [];
        if (mode === 'manual') {
            document.querySelectorAll('#questions-container > .question-block').forEach(div => {
                const inputs = div.querySelectorAll('input, select');
                if (inputs[0].value.trim()) {
                    questions.push({
                        text: inputs[0].value,
                        options: [inputs[1].value, inputs[2].value, inputs[3].value, inputs[4].value],
                        correct: parseInt(inputs[5].value)
                    });
                }
            });
        } else {
            questions = this.generateQuizQuestions(
                document.getElementById('quiz-topic').value || 'General',
                document.getElementById('quiz-level').value,
                parseInt(document.getElementById('quiz-num').value) || 10
            );
        }

        const newQuiz = {
            name: document.getElementById('quiz-name').value,
            password: document.getElementById('quiz-password').value,
            duration: parseInt(document.getElementById('quiz-duration').value),
            startTime: document.getElementById('quiz-start').value,
            questions,
            aiGenerated: mode === 'ai'
        };

        const list = Store.get('quizzes');
        list.push(newQuiz);
        Store.set('quizzes', list);

        UI.toast.show('Quiz created successfully!');
        document.getElementById('quiz-form').reset();
        document.getElementById('questions-container').innerHTML = '';
        router.navigate('quizzes');
    },

    handleChallengeSubmit(e) {
        e.preventDefault();
        // Similar to Quiz, just simpler for brevity
        const newChallenge = {
            name: document.getElementById('challenge-name').value,
            password: document.getElementById('challenge-password').value,
            duration: parseInt(document.getElementById('challenge-duration').value),
            startTime: document.getElementById('challenge-start').value,
            aiGenerated: document.querySelector('input[name="challenge-mode"]:checked').value === 'ai'
        };

        const list = Store.get('challenges');
        list.push(newChallenge);
        Store.set('challenges', list);

        UI.toast.show('Challenge created!');
        e.target.reset();
        router.navigate('challenges');
    },

    handleInterviewGenerate(e) {
        e.preventDefault();
        const results = document.getElementById('interview-results');
        const topic = document.getElementById('interview-topic').value;
        const level = document.getElementById('interview-level').value;

        // Skeleton State
        results.innerHTML = `
            <div class="skeleton skeleton-block u-mb-1" style="height:100px"></div>
            <div class="skeleton skeleton-block u-mb-1" style="height:100px"></div>
            <div class="skeleton skeleton-block" style="height:100px"></div>
        `;

        setTimeout(() => {
            const count = { junior: 3, mid: 5, senior: 7 }[level];
            let html = '';
            for (let i = 1; i <= count; i++) {
                html += `
                    <div style="background:var(--card-light); padding:1.5rem; margin-bottom:1rem; border-radius:var(--radius-md); border-left:4px solid var(--color-primary);">
                        <h4 class="u-mb-1">Q${i}: Explain ${topic} concept #${i} for a ${level} role.</h4>
                        <p class="text-secondary">Expected Answer: The candidate should mention scalability, readability, and specific patterns related to ${topic}.</p>
                    </div>
                `;
            }
            results.innerHTML = html;
            UI.toast.show('Questions generated!');
        }, 1200);
    }
};

/* === Global Helpers === */
let quizQuestionCount = 0;
function addQuizQuestion() {
    quizQuestionCount++;
    const container = document.getElementById('questions-container');
    const div = document.createElement('div');
    div.className = 'question-block u-mb-1';
    div.style.background = 'rgba(255,255,255,0.5)';
    div.style.padding = '1.5rem';
    div.style.borderRadius = '8px';

    div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <h5>Question ${quizQuestionCount}</h5>
            <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('.question-block').remove()">Remove</button>
        </div>
        <div class="form-group"><label>Question Text</label><input type="text" required class="form-control"></div>
        <div class="grid-2">
            <div class="form-group"><label>Option A</label><input type="text" required></div>
            <div class="form-group"><label>Option B</label><input type="text" required></div>
            <div class="form-group"><label>Option C</label><input type="text" required></div>
            <div class="form-group"><label>Option D</label><input type="text" required></div>
        </div>
        <div class="form-group">
            <label>Correct Answer</label>
            <select required>
                <option value="0">Option A</option>
                <option value="1">Option B</option>
                <option value="2">Option C</option>
                <option value="3">Option D</option>
            </select>
        </div>
    `;
    container.appendChild(div);
}

function toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    document.getElementById('theme-icon').className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    localStorage.setItem('theme', newTheme);
}

// Init
document.addEventListener('DOMContentLoaded', () => App.init());