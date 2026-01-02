import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateQuiz from './pages/CreateQuiz';
import Quizzes from './pages/Quizzes';
import QuizDetail from './pages/QuizDetail';
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

      {/* Placeholders for routes in Navbar but not yet implemented */}
      <Route path="/challenges" element={<ProtectedRoute><Layout><div className="p-8">Coming Soon</div></Layout></ProtectedRoute>} />
      <Route path="/interviews" element={<ProtectedRoute><Layout><div className="p-8">Coming Soon</div></Layout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
