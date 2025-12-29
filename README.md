# QuizMaster Pro

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

QuizMaster Pro is a professional, real-time quiz and coding challenge platform designed for academic and interview preparation scenarios. It features role-based access control, AI-powered question generation, and real-time multiplayer capabilities.

## 🚀 Features

*   **Real-Time Architecture:** Synchronization via Socket.IO.
*   **Role-Based Access:** Creators (Teachers/Interviewers) and Participants (Students/Candidates).
*   **AI Integration:** Generates quizzes and interview questions on demand.
*   **Secure:** JWT Authentication, Bcrypt hashing, Helmet protection, Zod validation.
*   **Database:** Robust data modeling with PostgreSQL and Sequelize.

## 🛠 Tech Stack

### Frontend
*   **Core:** HTML5, CSS3 (Variables, Flexbox/Grid), Vanilla JavaScript (ES6+).
*   **State:** Custom Router & Store implementation.
*   **Real-time:** `socket.io-client`.

### Backend
*   **Runtime:** Node.js.
*   **Framework:** Express.js.
*   **Database:** PostgreSQL (with Sequelize ORM).
*   **Real-time:** Socket.IO.
*   **Security:** `helmet`, `xss-clean`, `bcryptjs`, `jsonwebtoken`.

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL (Local or Docker)

### 1. Clone & Install
```bash
git clone https://github.com/Akashresi/lab.git
cd lab
npm install
```

### 2. Environment Variables
Create a `.env` file in the root based on `.env.example`:
```env
PORT=5000
POSTGRES_URI=postgres://user:pass@localhost:5432/quizmaster
JWT_SECRET=your_super_secret_key
AI_API_KEY=your_openai_key
```

### 3. Database Setup
Ensure PostgreSQL is running, then the app will auto-sync tables on start.
```bash
# Optional: Seed data
npm run seed
```

### 4. Run the App
```bash
# Development (Backend + Watch Mode)
npm run dev

# Frontend
# Open client/index.html in Live Server or deploy static host.
```

## 🏗 Architecture

The system follows a **Controller-Service-Repository** pattern (simplified to Controller-Model for this scale).

*   **Models:** define the SQL Schema.
*   **Controllers:** handle HTTP requests and validation.
*   **Middleware:** enforces Security and Auth rules.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for deeper details.

## 🧪 Testing

```bash
# Run Unit Tests (Jest) - Coming Soon
npm test
```

## 🐳 Docker Deployment

```bash
docker-compose up --build -d
```
