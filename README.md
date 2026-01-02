# QuizMaster Pro - Full Stack Web Application

## 1. Project Overview
QuizMaster Pro is a production-ready web application for creating and taking quizzes and coding challenges. It features real-time interaction, AI-powered content generation, and full authentication.

**Recent Update:** The frontend has been migrated to a modern **React + Vite + Tailwind CSS** stack for improved UI/UX and distinct creation routes.

## 2. Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: Node.js, Express.js, Socket.IO.
- **Database**: PostgreSQL with Sequelize ORM.
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt.
- **AI Integration**: Google Gemini API (or Mock fallback).

## 3. Folder Structure
```
/
├── client/                 # NEW React Frontend
│   ├── src/
│   │   ├── pages/         # Route Components (CreateQuiz, Dashboard...)
│   │   ├── components/    # Reusable UI (Layout, Navbar...)
│   │   ├── context/       # Auth State Management
│   │   └── lib/           # API & Utils
│   ├── vite.config.js     # Vite Config (Proxy to Backend)
│   └── tailwind.config.js # Design System
├── client_legacy/          # Old Vanilla JS Frontend (Backup)
├── server/                 # Backend
│   ├── config/            # DB Configuration
│   ├── controllers/       # Route Logic (Auth, Quiz, Challenge, AI)
│   ├── routes/            # API Route Definitions
│   ├── app.js             # Express App Setup
│   └── server.js          # Server Entry Point
├── .env                   # Environment Variables
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
   - **Backend**:
     ```bash
     npm install
     ```
   - **Frontend**:
     ```bash
     cd client
     npm install
     ```

5. **Run Application**:
   - **Backend**: `npm run dev` (starts on port 5000)
   - **Frontend**: `cd client && npm run dev` (starts on port 5173, proxies API requests to 5000)

## 5. UI/UX Workflow & Creating Quizzes
The UI has been redesigned with a premium, responsive feel.

### Dashboard
- Accessible at `/dashboard`.
- Layout includes a sidebar for navigation and a top navbar for quick actions.
- Displays stats and recent quizzes.

### Creating a Quiz
- **Distinct Route**: Navigate to `/quizzes/create` (accessible via "Create Quiz" button on Quizzes page or Dashboard).
- **Form Controls**:
  - **Inputs**: Title, Access Code (optional), Start Time, Duration.
  - **Question Builder**: Add multiple questions dynamically.
  - **Question Types**: Toggle between MCQ (with 4 options) and Interactive (with semantic answer key).
- **Submission**: Posts to `/api/quizzes`.

### Taking a Quiz
- Navigate to `/quizzes/:id` from the list.
- Enter Access Code if required.
- Click "Start Quiz".

## 6. API Documentation

### Authentication
- `POST /api/auth/register`: { username, email, password, role }
- `POST /api/auth/login`: { email, password }

### Quizzes
- `GET /api/quizzes`: List all quizzes.
- `POST /api/quizzes`: Create quiz (Creator only). Payload:
  ```json
  {
    "title": "My Quiz",
    "access_code": "secret",
    "duration_minutes": 30,
    "start_time": "2023-...",
    "questions": [...]
  }
  ```
- `GET /api/quizzes/:id`: Get quiz details.
