# QuizMaster Pro - Full Stack Web Application

## 1. Project Overview
QuizMaster Pro is a production-ready web application for creating and taking quizzes and coding challenges. It features real-time interaction, AI-powered content generation, and full authentication.

## 2. Tech Stack
- **Frontend**: HTML5, Vanilla CSS, JavaScript (ES6+), Socket.IO Client.
- **Backend**: Node.js, Express.js, Socket.IO.
- **Database**: PostgreSQL with Sequelize ORM.
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt.
- **AI Integration**: Google Gemini API (or Mock fallback).

## 3. Folder Structure
```
/
├── client/                 # Frontend
│   ├── index.html         # Main UI (SPA structure)
│   ├── script.js          # Core Logic (Auth, API, UI)
│   └── style.css          # Styling
├── server/                 # Backend
│   ├── config/            # DB Configuration
│   ├── controllers/       # Route Logic (Auth, Quiz, Challenge, AI)
│   ├── middleware/        # Auth Middleware (JWT)
│   ├── models/            # Sequelize Models (User, Quiz, Question...)
│   ├── routes/            # API Route Definitions
│   ├── utils/             # Helpers (Socket.io)
│   ├── app.js             # Express App Setup
│   └── server.js          # Server Entry Point
├── .env                   # Environment Variables
├── package.json           # Dependencies
└── README.md              # Documentation
```

## 4. Setup Instructions
1. **Prerequisites**: Node.js and PostgreSQL installed.
2. **Database Setup**:
   - Create a Postgres database named `quizmaster` (or update `.env`).
   - The app will automatically sync tables on start.
3. **Environment (.env)**:
   ```
   PORT=5000
   POSTGRES_URI=postgres://user:pass@localhost:5432/quizmaster
   JWT_SECRET=your_secret_key
   AI_API_KEY=your_google_api_key (optional)
   ```
4. **Install Dependencies**:
   ```bash
   npm install
   ```
5. **Run Application**:
   - Backend: `npm run dev` (starts on port 5000)
   - Frontend: Serve `client/index.html` (e.g., using `live-server` or open file directly if CORS allows, best served via simple HTTP server).

## 5. API Documentation

### Authentication
- `POST /api/auth/register`: { username, email, password, role }
- `POST /api/auth/login`: { email, password }

### Quizzes
- `GET /api/quizzes`: List all quizzes.
- `POST /api/quizzes`: Create quiz (Creator only).
- `GET /api/quizzes/:id`: Get quiz details.
- `DELETE /api/quizzes/:id`: Delete quiz.

### AI Generation
- `POST /api/ai/generate-quiz`: { topic, difficulty, count }
- `POST /api/ai/generate-challenge`: { topic, difficulty }

## 6. Real-Time Features
- **Socket.IO** is used for joining quiz rooms (`join_quiz`).
- Events: `quiz_started`, `participant_joined`.

## 7. Database Schema
- **Users**: id, username, email, password, role.
- **Quizzes**: id, title, start_time, duration, access_code, creator_id.
- **Questions**: id, quiz_id, text, options (JSON), correct_index.
- **CodeChallenges**: id, title, description, test_cases, creator_id.
- **Attempts**: id, user_id, quiz_id/challenge_id, score.

