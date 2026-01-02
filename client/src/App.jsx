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
        <ProtectedRoute>
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

      {/* Challenge Routes */}
      <Route path="/challenges" element={
        <ProtectedRoute>
          <Layout>
            <Challenges />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/challenges/create" element={
        <ProtectedRoute>
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
