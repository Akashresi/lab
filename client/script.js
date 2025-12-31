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
        // Load Data
        if (pageId === 'dashboard') App.initDashboard();
        if (pageId === 'quizzes') App.initQuizzes();
        if (pageId === 'challenges') App.initChallenges();
        if (pageId === 'results') App.initResults();
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

    /* === Results === */
    async initResults() {
        try {
            const data = await API.request('/results');
            const container = document.getElementById('results-list');
            container.innerHTML = data.data.length === 0
                ? '<div class="empty-state"><p>No results yet.</p></div>'
                : data.data.map(this.renderResultItem).join('');
        } catch (e) { console.error(e); }
    },

    renderResultItem(r) {
        const isPass = r.status === 'Pass';
        return `
            <div class="item-card status-${isPass ? 'completed' : 'active'}" style="border-left: 5px solid ${isPass ? 'var(--color-success)' : 'var(--color-error)'}">
                <div class="item-info">
                    <h4>${r.type === 'quiz' ? (r.Quiz?.title || 'Unknown Quiz') : (r.CodeChallenge?.title || 'Unknown Challenge')}</h4>
                    <div class="item-meta">
                        <span class="status-badge" style="background:${isPass ? 'var(--color-success)' : 'var(--color-error)'}">${r.status}</span>
                        <span>Score: ${r.score}/${r.total_score} (${Math.round(r.percentage)}%)</span>
                        <span>Time: ${r.time_taken}s</span>
                        <span>${new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `;
    },

    async exportResults() {
        try {
            const res = await fetch(`${API_URL}/results/export`, {
                headers: { 'Authorization': `Bearer ${Store.token}` }
            });
            if (!res.ok) throw new Error('Export failed');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'results.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e) {
            UI.toast.show('Export failed', 'error');
        }
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

    async handleChallengeSubmit(e) {
        e.preventDefault();
        const mode = document.querySelector('input[name="challenge-mode"]:checked').value;
        const title = document.getElementById('challenge-name').value;
        const password = document.getElementById('challenge-password').value;
        const duration = document.getElementById('challenge-duration').value;
        const start = document.getElementById('challenge-start').value;

        if (!title || !duration || !start) {
            UI.toast.show('Please fill in valid basic info', 'error');
            return;
        }

        if (mode === 'ai') {
            const topic = document.getElementById('challenge-desc-ai').value;

            if (!topic) {
                UI.toast.show('Please enter a topic for AI', 'error');
                return;
            }

            UI.modal.show('AI Generation', 'Generating challenge...');

            try {
                const aiRes = await API.request('/ai/generate-challenge', 'POST', {
                    topic,
                    difficulty: 'medium'
                });

                await API.request('/challenges', 'POST', {
                    title: aiRes.data.title || title,
                    description: aiRes.data.description,
                    test_cases: aiRes.data.test_cases,
                    duration_minutes: duration,
                    start_time: start,
                    access_code: password,
                    is_ai_generated: true,
                    topic
                });

                UI.modal.hide();
                UI.toast.show('AI Code Challenge Created!');
                router.navigate('challenges');
            } catch (err) {
                UI.modal.hide();
            }
        } else {
            // Manual
            const description = document.getElementById('challenge-desc-manual').value;
            const sampleInput = document.getElementById('challenge-input-manual').value;
            const sampleOutput = document.getElementById('challenge-output-manual').value;

            if (!description) {
                UI.toast.show('Description required', 'error');
                return;
            }

            const test_cases = [];
            if (sampleInput && sampleOutput) {
                test_cases.push({
                    input: sampleInput.trim(),
                    output: sampleOutput.trim(),
                    hidden: false
                });
            }

            try {
                await API.request('/challenges', 'POST', {
                    title,
                    description,
                    duration_minutes: duration,
                    start_time: start,
                    access_code: password,
                    test_cases,
                    is_ai_generated: false
                });

                UI.toast.show('Code Challenge Created!');
                router.navigate('challenges');
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

                // UI.toast.show(`Started ${item.title}`);
                // Start Attempt Interaction
                App.loadAttempt(type, id);
            } catch (err) {
                UI.toast.show(err.message, 'error');
            }
        }, 'Start');
    },

    /* === Attempt Logic === */
    activeAttempt: null,

    async loadAttempt(type, id) {
        try {
            // Re-fetch item to get details (questions/etc)
            const endpoint = type === 'quizzes' ? `/quizzes/${id}` : `/challenges/${id}`; // type 'quizzes' from startItem arg, convert to singular? No API uses plural
            const data = await API.request(endpoint);
            const item = data.data;

            if (!item) throw new Error('Item not found');

            // Init Attempt State
            this.activeAttempt = {
                type: type === 'quizzes' ? 'quiz' : 'challenge',
                id: item.id,
                data: item,
                startTime: Date.now(),
                duration: item.duration_minutes * 60,
                timer: null
            };

            // Render View
            document.getElementById('attempt-title').textContent = item.title;
            const container = document.getElementById('attempt-content');

            if (this.activeAttempt.type === 'quiz') {
                this.renderQuizAttempt(item, container);
            } else {
                this.renderChallengeAttempt(item, container);
            }

            // Switch Page
            router.navigate('attempt');

            // Start Timer
            this.startTimer();

        } catch (err) {
            UI.toast.show(err.message, 'error');
        }
    },

    renderQuizAttempt(quiz, container) {
        container.innerHTML = quiz.Questions.map((q, i) => `
            <div class="question-block u-mb-2" data-index="${i}">
                <p><strong>Q${i + 1}:</strong> ${q.text}</p>
                <div class="options-grid">
                    ${q.options.map((opt, optIndex) => `
                        <label class="option-card">
                            <input type="radio" name="q_${i}" value="${optIndex}">
                            <span>${opt}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    renderChallengeAttempt(challenge, container) {
        const languages = ['javascript', 'python', 'c', 'cpp', 'java'];
        const templates = {
            javascript: `// Read from stdin, print to stdout\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\n\nfunction solution(data) {\n    console.log(data); // Echo\n}\n\nsolution(input);`,
            python: `# Read from stdin, print to stdout\nimport sys\n\ndef solution():\n    data = sys.stdin.read().strip()\n    print(data)\n\nsolution()`,
            c: `#include <stdio.h>\n\nint main() {\n    char buffer[1024];\n    scanf("%s", buffer);\n    printf("%s", buffer);\n    return 0;\n}`,
            cpp: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string input;\n    cin >> input;\n    cout << input;\n    return 0;\n}`,
            java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        if (scanner.hasNext()) {\n            System.out.println(scanner.next());\n        }\n    }\n}`
        };

        // Save templates to attempt state for switching
        this.activeAttempt.templates = templates;
        this.activeAttempt.language = 'javascript';

        container.innerHTML = `
            <div class="challenge-desc u-mb-2">
                <h3>Problem Description</h3>
                <p>${challenge.description}</p>
            </div>
            
            <div class="code-editor-header u-mb-1" style="display:flex; justify-content:space-between; align-items:center;">
                <label>Language:</label>
                <select id="attempt-language" onchange="App.handleLanguageChange(this.value)" class="form-control" style="width:auto; display:inline-block;">
                    ${languages.map(l => `<option value="${l}">${l.toUpperCase()}</option>`).join('')}
                </select>
            </div>

            <div class="code-editor-area">
                <textarea id="attempt-code" class="input-code" rows="15" spellcheck="false" style="font-family:'JetBrains Mono', monospace;">${templates['javascript']}</textarea>
            </div>

            <div id="run-output" class="output-console u-mt-2 u-hidden" style="background:#1e1e1e; color:#fff; padding:1rem; border-radius:6px; font-family:'JetBrains Mono', monospace; max-height:200px; overflow-y:auto;">
                <h5 style="border-bottom:1px solid #333; padding-bottom:0.5rem; margin-bottom:0.5rem;">Console Output</h5>
                <div id="output-content"></div>
            </div>
        `;

        // Inject Run button into footer if not present (hacky but keeps UI constraint)
        const footer = document.querySelector('#attempt .sticky-footer');
        if (footer && !document.getElementById('btn-run')) {
            const runBtn = document.createElement('button');
            runBtn.id = 'btn-run';
            runBtn.className = 'btn btn-outline';
            runBtn.innerHTML = '<i class="fas fa-play"></i> Run Code';
            runBtn.onclick = () => App.runCode();
            runBtn.style.marginRight = '0.5rem';
            footer.insertBefore(runBtn, footer.lastElementChild); // Insert before "Submit"
        }
    },

    handleLanguageChange(lang) {
        this.activeAttempt.language = lang;
        const code = this.activeAttempt.templates[lang];
        document.getElementById('attempt-code').value = code;
    },

    async runCode() {
        const code = document.getElementById('attempt-code').value;
        const lang = this.activeAttempt.language;
        const outputDiv = document.getElementById('run-output');
        const contentDiv = document.getElementById('output-content');

        outputDiv.classList.remove('u-hidden');
        contentDiv.innerHTML = '<span style="color:#aaa;">Running...</span>';

        try {
            const res = await API.request(`/challenges/${this.activeAttempt.id}/run`, 'POST', { code, language: lang });
            const results = res.data;

            contentDiv.innerHTML = results.map((r, i) => `
                <div style="margin-bottom:0.8rem; border-left:3px solid ${r.status === 'Accepted' ? '#4caf50' : '#f44336'}; padding-left:0.5rem;">
                    <div><strong>Test Case ${i + 1}:</strong> <span style="color:${r.status === 'Accepted' ? '#4caf50' : '#f44336'}">${r.status}</span></div>
                    ${r.status !== 'Accepted' ? `
                    <div style="font-size:0.9em; opacity:0.8;">Input: ${r.input}</div>
                    <div style="font-size:0.9em; opacity:0.8;">Expected: ${r.expected}</div>
                    <div style="font-size:0.9em; opacity:0.8;">Actual: ${r.actual || r.error}</div>
                    ` : ''}
                </div>
            `).join('');
        } catch (err) {
            contentDiv.innerHTML = `<span style="color:#f44336;">Execution Failed: ${err.message}</span>`;
        }
    },

    startTimer() {
        const display = document.getElementById('time-remaining');
        this.activeAttempt.timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.activeAttempt.startTime) / 1000);
            const remaining = this.activeAttempt.duration - elapsed;

            if (remaining <= 0) {
                this.submitAttempt(true);
            }

            const m = Math.floor(remaining / 60);
            const s = remaining % 60;
            display.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }, 1000);
    },

    cancelAttempt() {
        if (!confirm('Abort assessment? Progress will be lost.')) return;
        clearInterval(this.activeAttempt.timer);
        this.activeAttempt = null;
        router.navigate('dashboard');
    },

    async submitAttempt(auto = false) {
        if (this.activeAttempt.submitting) return; // prevent double submit
        this.activeAttempt.submitting = true;

        clearInterval(this.activeAttempt.timer);
        const timeTaken = Math.floor((Date.now() - this.activeAttempt.startTime) / 1000); // seconds

        let payload = { time_taken: timeTaken };
        let url = '';

        if (this.activeAttempt.type === 'quiz') {
            const answers = [];
            // Gather answers
            this.activeAttempt.data.Questions.forEach((q, i) => {
                const selected = document.querySelector(`input[name="q_${i}"]:checked`);
                answers.push(selected ? parseInt(selected.value) : -1);
            });
            payload.answers = answers;
            url = `/quizzes/${this.activeAttempt.id}/submit`;
        } else {
            const code = document.getElementById('attempt-code').value;
            payload.code = code;
            payload.language = this.activeAttempt.language; // Send language
            url = `/challenges/${this.activeAttempt.id}/submit`;
        }

        if (auto) UI.toast.show('Time up! Submitting...', 'warning');
        else UI.toast.show('Submitting...', 'info');

        try {
            await API.request(url, 'POST', payload);
            UI.toast.show('Submitted successfully!');
            this.activeAttempt = null;
            router.navigate('results');
        } catch (err) {
            UI.toast.show('Submission failed: ' + err.message, 'error');
            this.activeAttempt.submitting = false;
        }
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