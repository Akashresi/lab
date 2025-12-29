# QuizMaster Pro - System Architecture & Upgrade Plan

## 1. High-Level System Architecture

The application will be transformed into a **Real-Time Client-Server Application** using the **PERN Stack** (PostgreSQL, Express.js, React/VanillaJS, Node.js).

### Components
*   **Client (Frontend):** 
    *   Existing HTML/CSS/JS (SPA Architecture).
    *   **Updates:** Will consume REST APIs instead of `localStorage`.
    *   **Real-time:** Will use `socket.io-client` for live quiz updates.
*   **Server (Backend):**
    *   **Runtime:** Node.js.
    *   **Framework:** Express.js (REST API).
    *   **Real-time:** Socket.IO (WebSockets) for timers, live scoreboards, and active participant tracking.
    *   **AI Gateway:** Controller to securely proxy requests to OpenAI/Gemini APIs.
*   **Database:** 
    *   **Primary:** PostgreSQL (Relational).
    *   **ORM:** Sequelize.
*   **Authentication:** 
    *   JWT (JSON Web Tokens) for stateless auth.
    *   Bcrypt for password hashing.
*   **Infrastructure:**
    *   **Deployment:** Docker ready (optional), Environment Variables (`dotenv`).

---

## 2. Backend Folder Structure

We will transition the project structure to separate concerns:

```text
/quizmaster-pro
├── /client                 # Moved existing frontend files here
│   ├── index.html
│   ├── style.css
│   └── script.js
├── /server                 # New Backend
│   ├── /config             # DB connection, Environment vars
│   ├── /controllers        # Request logic (Auth, Quiz, AI)
│   ├── /models             # Sequelize Models (User, Quiz, Attempt)
│   ├── /routes             # API Routes definitions
│   ├── /services           # Business logic (AI calls, Socket manager)
│   ├── /middleware         # Auth checks, Validation, Error handling
│   ├── /utils              # Helpers (Validators, Token generators)
│   ├── app.js              # Express App setup
│   └── server.js           # Entry point (HTTP + Socket server)
├── .env                    # Secrets (API Keys, DB URI)
└── package.json            # Dependencies
```

---

## 3. Database Schema (PostgreSQL/Sequelize)

### **Users Table**
*   `id`: UUID (PK)
*   `username`: String (Unique)
*   `email`: String (Unique)
*   `password`: String (Hashed)
*   `role`: Enum ('creator', 'participant')
*   `created_at`: Date

### **Quizzes Table**
*   `id`: UUID (PK)
*   `title`: String
*   `creator_id`: UUID (FK -> Users.id)
*   `access_code`: String
*   `start_time`: Date
*   `duration_minutes`: Integer
*   `status`: Enum ('scheduled', 'active', 'ended')
*   `questions`: JSONB (Stores array of question objects directly)
*   `is_ai_generated`: Boolean
*   `topic`: String

### **Challenges Table**
*   `id`: UUID (PK)
*   `title`: String
*   `creator_id`: UUID (FK -> Users.id)
*   `description`: Text
*   `test_cases`: JSONB
*   `start_time`: Date
*   `duration_minutes`: Integer

### **Attempts Table**
*   `id`: UUID (PK)
*   `user_id`: UUID (FK -> Users.id)
*   `quiz_id`: UUID (FK -> Quizzes.id, Nullable)
*   `challenge_id`: UUID (FK -> Challenges.id, Nullable)
*   `answers`: JSONB (User selections)
*   `score`: Integer
*   `submitted_at`: Date
*   `is_late`: Boolean

---

## 4. API Endpoint Definitions

### **Authentication**
*   `POST /api/auth/register` - Create account.
*   `POST /api/auth/login` - Get JWT.
*   `GET /api/auth/me` - Get current user profile (Protected).

### **Quizzes & Challenges**
*   `GET /api/quizzes` - List all visible quizzes.
*   `POST /api/quizzes` - Create a quiz (Creator only).
*   `GET /api/quizzes/:id` - Get quiz details (Password protected optional).
*   `POST /api/quizzes/:id/attempt` - Submit answers.

### **AI Generation**
*   `POST /api/ai/generate-quiz` - Generate generic questions.
*   `POST /api/ai/generate-interview` - Generate interview Qs.

---

## 5. Real-Time Flow (Socket.IO)

1.  **Connection:** Client connects with JWT. Server verifies user.
2.  **Rooms:** Users `join('quiz_{id}')`.
3.  **Events:**
    *   `Server -> Client: 'quiz_start'`: Triggers frontend to switch to "Active" mode.
    *   `Server -> Client: 'timer_sync'`: Broadcasts server time periodically to prevent client-side clock manipulation.
    *   `Server -> Client: 'quiz_end'`: Forces auto-submission for all clients.
    *   `Client -> Server: 'live_answer'`: (Optional) Sends answers real-time for live leaderboards.

---

## 6. Deployment Guide

### **Backend (Render.com / Railway)**
1.  Push code to GitHub.
2.  Connect Repo to Render service.
3.  Set Environment Variables:
    *   `POSTGRES_URI`: (From Render/Railway Postgres)
    *   `JWT_SECRET`: (Random String)
    *   `AI_API_KEY`: (OpenAI/Gemini Key)
4.  Build Command: `npm install`
5.  Start Command: `node server/server.js`

### **Frontend (Vercel / Netlify)**
1.  Since it's static HTML/JS, deploy the `client` folder directly.
2.  **Config:** Update `api.js` base URL to point to the production backend URL (e.g., `https://my-quiz-api.onrender.com`).
