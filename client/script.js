/**
 * QuizMaster Pro - Full Stack Application Logic
 */

const API_URL = 'http://localhost:5000/api';
let socket;

/* === State & Auth === */
const Store = {
    theme: () => localStorage.getItem('theme') || 'light',

    // Auth State
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user')),

    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },

    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

/* === API Helper === */
const API = {
    async request(endpoint, method = 'GET', body = null) {
        const headers = { 'Content-Type': 'application/json' };
        if (Store.token) headers['Authorization'] = `Bearer ${Store.token}`;

        try {
            const config = { method, headers };
            if (body) config.body = JSON.stringify(body);

            const res = await fetch(`${API_URL}${endpoint}`, config);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Something went wrong');
            return data;
        } catch (error) {
            UI.toast.show(error.message, 'error');
            if (error.message.includes('Not authorized') || error.message.includes('token failed')) {
                Store.clearAuth();
                router.navigate('login');
            }
            throw error;
        }
    }
};

/* === UI Components === */
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
            toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> <span>${message}</span>`;
            this.container.appendChild(toast);
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

        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) this.navigate(e.state.page, false);
        });
    }

    navigate(pageId, pushState = true) {
        // Auth Guard
        const publicPages = ['login', 'register'];
        if (!publicPages.includes(pageId) && !Store.token) {
            pageId = 'login';
        }
        if (publicPages.includes(pageId) && Store.token) {
            pageId = 'dashboard';
        }

        if (!document.getElementById(pageId)) return;

        this.pages.forEach(p => p.classList.remove('active'));
        this.navLinks.forEach(l => l.classList.remove('active'));

        document.getElementById(pageId).classList.add('active');
        const activeLink = document.getElementById(`nav-${pageId}`);
        if (activeLink) activeLink.classList.add('active');

        // Nav visibility control (hide nav on login/register)
        const nav = document.querySelector('.navbar');
        if (publicPages.includes(pageId)) nav.style.display = 'none';
        else nav.style.display = 'flex';

        if (pushState) history.pushState({ page: pageId }, '', `#${pageId}`);

        window.scrollTo(0, 0);

        // Load Data
        if (pageId === 'dashboard') App.initDashboard();
        if (pageId === 'quizzes') App.initQuizzes();
        if (pageId === 'challenges') App.initChallenges();
    }
}
const router = new Router();

/* === Core Logic === */
const App = {
    init() {
        // Theme
        const theme = Store.theme();
        document.body.setAttribute('data-theme', theme);
        document.getElementById('theme-icon').className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

        // Connect Socket if authorized
        if (Store.token) this.connectSocket();

        // Initial Route
        const hash = window.location.hash.slice(1) || 'dashboard';
        router.navigate(hash, false);

        this.bindEvents();
    },

    connectSocket() {
        if (!window.io) return;
        socket = io('http://localhost:5000');
        socket.on('connect', () => console.log('Socket Connected'));
    },

    bindEvents() {
        // Auth Forms
        document.getElementById('login-form')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form')?.addEventListener('submit', (e) => this.handleRegister(e));

        // Content Forms
        document.getElementById('quiz-form')?.addEventListener('submit', (e) => this.handleQuizSubmit(e));
        document.getElementById('challenge-form')?.addEventListener('submit', (e) => this.handleChallengeSubmit(e));
        document.getElementById('interview-form')?.addEventListener('submit', (e) => this.handleInterviewGenerate(e));

        // Toggles
        document.querySelectorAll('input[name="quiz-mode"]').forEach(r =>
            r.addEventListener('change', e => this.toggleFormSection('quiz-manual-form', 'quiz-ai-form', e.target.value))
        );
        document.querySelectorAll('input[name="challenge-mode"]').forEach(r =>
            r.addEventListener('change', e => this.toggleFormSection('challenge-manual-form', 'challenge-ai-form', e.target.value))
        );
    },

    /* === Auth Handlers === */
    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const data = await API.request('/auth/login', 'POST', { email, password });
            Store.setAuth(data.token, data.user);
            UI.toast.show(`Welcome back, ${data.user.username}!`);
            this.connectSocket();
            router.navigate('dashboard');
        } catch (err) {
            // Error handled by API helper
        }
    },

    async handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const role = document.getElementById('reg-role').value;

        try {
            const data = await API.request('/auth/register', 'POST', { username, email, password, role });
            Store.setAuth(data.token, data.user);
            UI.toast.show('Account created successfully!');
            this.connectSocket();
            router.navigate('dashboard');
        } catch (err) {
            // Error handled
        }
    },

    logout() {
        Store.clearAuth();
        if (socket) socket.disconnect();
        router.navigate('login');
    },

    /* === Dashboard & Lists === */
    renderItem(item, type, index, showActions = true) {
        const start = new Date(item.start_time);
        const end = new Date(start.getTime() + item.duration_minutes * 60000);
        const now = new Date();

        let status = 'pending';
        if (now >= start && now < end) status = 'active';
        if (now >= end) status = 'completed';

        const statusLabels = { pending: 'Upcoming', active: 'Live Now', completed: 'Ended' };
        const aiBadge = item.is_ai_generated ? '<span class="status-badge" style="background:var(--color-accent);color:white;margin-left:0.5rem;"><i class="fas fa-robot"></i> AI</span>' : '';

        return `
            <div class="item-card status-${status}">
                <div class="item-info">
                    <h4>${item.title} ${aiBadge}</h4>
                    <div class="item-meta">
                        <span class="status-badge status-${status}">${statusLabels[status]}</span>
                        <span><i class="far fa-calendar"></i> ${start.toLocaleString()}</span>
                        <span><i class="far fa-clock"></i> ${item.duration_minutes} min</span>
                    </div>
                </div>
                ${showActions ? `
                <div style="display:flex;gap:0.5rem;">
                    <button class="btn btn-primary btn-sm" onclick="App.startItem('${type}', '${item.id}')">Start</button>
                    ${Store.user.role === 'creator' || Store.user.role === 'admin' ? `
                    <button class="btn btn-danger btn-sm" onclick="App.deleteItem('${type}', '${item.id}')"><i class="fas fa-trash"></i></button>` : ''}
                </div>` : ''}
            </div>
        `;
    },

    async initDashboard() {
        try {
            const quizData = await API.request('/quizzes');
            const challengeData = await API.request('/challenges');

            this.renderSection('dashboard-quizzes-content', quizData.data, 'quiz', 'fa-book-open');
            this.renderSection('dashboard-challenges-content', challengeData.data, 'challenge', 'fa-laptop-code');
        } catch (err) { console.error(err); }
    },

    renderSection(id, items, type, icon) {
        const container = document.getElementById(id);
        if (!items || items.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas ${icon} empty-icon"></i><p>No items yet.</p></div>`;
            return;
        }
        container.innerHTML = items.map(i => this.renderItem(i, type, 0, false)).join(''); // limit 0 for demo
    },

    async initQuizzes() {
        try {
            const data = await API.request('/quizzes');
            const container = document.getElementById('quiz-list');
            container.innerHTML = data.data.length === 0
                ? '<div class="empty-state"><i class="fas fa-list-ul empty-icon"></i><p>No quizzes yet.</p></div>'
                : data.data.map((q) => this.renderItem(q, 'quizzes', q.id)).join('');
        } catch (e) { }
    },

    async initChallenges() {
        try {
            const data = await API.request('/challenges');
            const container = document.getElementById('challenge-list');
            container.innerHTML = data.data.length === 0
                ? '<div class="empty-state"><i class="fas fa-terminal empty-icon"></i><p>No challenges yet.</p></div>'
                : data.data.map((c) => this.renderItem(c, 'challenges', c.id)).join('');
        } catch (e) { }
    },

    /* === Form Handlers === */
    toggleFormSection(manualId, aiId, mode) {
        const manual = document.getElementById(manualId);
        const ai = document.getElementById(aiId);
        if (mode === 'manual') { manual.classList.remove('u-hidden'); ai.classList.add('u-hidden'); }
        else { manual.classList.add('u-hidden'); ai.classList.remove('u-hidden'); }
    },

    async handleQuizSubmit(e) {
        e.preventDefault();
        const mode = document.querySelector('input[name="quiz-mode"]:checked').value;
        const name = document.getElementById('quiz-name').value;
        const password = document.getElementById('quiz-password').value;
        const duration = document.getElementById('quiz-duration').value;
        const start = document.getElementById('quiz-start').value;

        if (mode === 'ai') {
            const topic = document.getElementById('quiz-topic').value;
            const level = document.getElementById('quiz-level').value;
            const count = document.getElementById('quiz-num').value;

            UI.modal.show('Generative AI', `<p>Generating quiz on <strong>${topic}</strong>...</p>`);

            try {
                // Generate Questions first
                const genRes = await API.request('/ai/generate-quiz', 'POST', { topic, difficulty: level, count });
                const questions = genRes.data;

                // Create Quiz
                await API.request('/quizzes', 'POST', {
                    title: name,
                    access_code: password,
                    duration_minutes: duration,
                    start_time: start,
                    is_ai_generated: true,
                    topic,
                    questions
                });

                UI.modal.hide();
                UI.toast.show('AI Quiz Created!');
                router.navigate('quizzes');
            } catch (err) { UI.modal.hide(); }
        } else {
            // Manual
            const questions = [];
            document.querySelectorAll('#questions-container > .question-block').forEach(div => {
                const inputs = div.querySelectorAll('input, select');
                if (inputs[0].value.trim()) {
                    questions.push({
                        text: inputs[0].value,
                        options: [inputs[1].value, inputs[2].value, inputs[3].value, inputs[4].value],
                        correct_index: parseInt(inputs[5].value)
                    });
                }
            });

            try {
                await API.request('/quizzes', 'POST', {
                    title: name,
                    access_code: password,
                    duration_minutes: duration,
                    start_time: start,
                    is_ai_generated: false,
                    questions
                });
                UI.toast.show('Quiz Created!');
                router.navigate('quizzes');
            } catch (err) { }
        }
    },

    /* === Actions === */
    startItem(type, id) {
        UI.modal.show(`Enter Access Code`, `
            <input type="password" id="access-code" class="form-control" placeholder="Code">
        `, async () => {
            const code = document.getElementById('access-code').value;
            try {
                const endpoint = type === 'quizzes' ? `/quizzes/${id}` : `/challenges/${id}`;
                const data = await API.request(endpoint);
                const item = data.data;

                if (item.access_code && item.access_code !== code) {
                    throw new Error('Invalid Access Code');
                }

                // Join Socket Room
                if (socket) socket.emit('join_quiz', { quizId: id, userId: Store.user.id });

                UI.toast.show(`Started ${item.title}`);
                // In a real app check start time, redirect to attempt page
            } catch (err) {
                UI.toast.show(err.message, 'error');
            }
        }, 'Start');
    },

    async deleteItem(type, id) {
        if (!confirm('Delete this item?')) return;
        try {
            const endpoint = type === 'quizzes' ? `/quizzes/${id}` : `/challenges/${id}`;
            await API.request(endpoint, 'DELETE');
            UI.toast.show('Deleted');
            if (type === 'quizzes') this.initQuizzes();
            else this.initChallenges();
        } catch (err) { }
    },

    // Global helper for manual questions
    addQuizQuestion() {
        const container = document.getElementById('questions-container');
        const div = document.createElement('div');
        div.className = 'question-block u-mb-1';
        div.style.background = 'rgba(255,255,255,0.05)';
        div.style.padding = '1.5rem';
        div.style.border = '1px solid var(--border-color)';

        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                <h5>Question</h5>
                <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('.question-block').remove()">Remove</button>
            </div>
            <div class="form-group"><input type="text" placeholder="Question Text" required class="form-control" style="width:100%"></div>
            <div class="grid-2">
                <div class="form-group"><input type="text" placeholder="Option A" required></div>
                <div class="form-group"><input type="text" placeholder="Option B" required></div>
                <div class="form-group"><input type="text" placeholder="Option C" required></div>
                <div class="form-group"><input type="text" placeholder="Option D" required></div>
            </div>
            <div class="form-group">
                <select required>
                    <option value="0">Answer: Option A</option>
                    <option value="1">Answer: Option B</option>
                    <option value="2">Answer: Option C</option>
                    <option value="3">Answer: Option D</option>
                </select>
            </div>
        `;
        container.appendChild(div);
    },

    // Interview
    async handleInterviewGenerate(e) {
        e.preventDefault();
        const topic = document.getElementById('interview-topic').value;
        const level = document.getElementById('interview-level').value;
        const results = document.getElementById('interview-results');

        results.innerHTML = '<p>Generating...</p>';

        try {
            const res = await API.request('/ai/generate-interview', 'POST', { topic, level });
            const questions = res.data;

            results.innerHTML = questions.map((q, i) => `
                <div style="background:var(--card-light); padding:1rem; margin-bottom:1rem; border-left:3px solid var(--color-primary);">
                    <strong>Q${i + 1}:</strong> ${q}
                </div>
            `).join('');
        } catch (err) {
            results.innerHTML = '<p class="text-error">Failed to generate.</p>';
        }
    }
};

/* === Global Exports === */
window.addQuizQuestion = App.addQuizQuestion;
window.toggleTheme = () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    document.getElementById('theme-icon').className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    localStorage.setItem('theme', newTheme);
};
window.router = router;
window.App = App;

// Init
document.addEventListener('DOMContentLoaded', () => App.init());