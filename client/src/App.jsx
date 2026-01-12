import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateQuiz from './pages/CreateQuiz';
import Quizzes from './pages/Quizzes';
import QuizDetail from './pages/QuizDetail';
import Challenges from './pages/Challenges';
import CreateChallenge from './pages/CreateChallenge';
import Interviews from './pages/Interviews';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import ChallengeAttempt from './pages/ChallengeAttempt';
import QuizAttempt from './pages/QuizAttempt';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Quiz Routes */}
      <Route path="/quizzes" element={
        <ProtectedRoute>
          <Layout>
            <Quizzes />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/quizzes/create" element={
        <ProtectedRoute allowedRoles={['creator', 'admin']}>
          <Layout>
            <CreateQuiz />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/quizzes/:id" element={
        <ProtectedRoute>
          <Layout>
            <QuizDetail />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/quizzes/:id/attempt" element={
        <ProtectedRoute allowedRoles={['participant', 'admin']}>
          <Layout>
            <QuizAttempt />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Challenge Routes */}
      <Route path="/challenges" element={
        <ProtectedRoute>
          <Layout>
            <Challenges />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/challenges/:id" element={
        <ProtectedRoute>
          <Layout>
            <ChallengeAttempt />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/challenges/create" element={
        <ProtectedRoute allowedRoles={['creator', 'admin']}>
          <Layout>
            <CreateChallenge />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Interview Routes */}
      <Route path="/interviews" element={
        <ProtectedRoute>
          <Layout>
            <Interviews />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
