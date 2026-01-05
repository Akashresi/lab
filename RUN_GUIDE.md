# QuizMaster Pro - Run & Deployment Guide

## 1. Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** (Running locally or via Docker)
- **Git**

## 2. Environment Setup

### Backend (.env)
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this
# Update with your local Postgres credentials
POSTGRES_URI=postgres://postgres:password@localhost:5432/quizmaster
# Optional: Google Gemini API Key for AI features
AI_API_KEY=your_gemini_api_key
```

### Frontend
The frontend connects to `/api` which is proxied to `http://localhost:5000` via Vite. No special `.env` needed for local dev unless changing ports.

## 3. Database Setup
1. Ensure your PostgreSQL service is running.
2. Create a database named `quizmaster` (or whatever matches your `POSTGRES_URI`).
   ```sql
   CREATE DATABASE quizmaster;
   ```
3. The application will **automatically create tables** on the first run (Fixed in `server/app.js`).

## 4. Running Locally

### Option A: Concurrent (Recommended)
You can likely run both if a concurrent script exists, but manual is safer:

### Terminal 1: Backend
```bash
npm install
npm start
```
*You should see "✅ Database connected & synced successfully" and "🚀 Server running...".*

### Terminal 2: Frontend
```bash
cd client
npm install
npm run dev
```
*Access the app at http://localhost:5173*.

## 5. Docker Setup (Optional)
A `Dockerfile` is provided for the backend. `docker-compose.yml` can be used to spin up DB and Backend.

```bash
docker-compose up --build
```

## 6. Deployment (Summary)
- **Backend**: Deploy to Render/Railway. Set env vars.
- **Frontend**: Build (`npm run build`) and deploy `dist/` to Vercel/Netlify.
- **Production**: ensure `NODE_ENV=production`.
