import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import NoteViewPage from './pages/NoteViewPage';
import NoteEditPage from './pages/NoteEditPage';
import Logo from './components/UI/Logo';
import './index.css';

function App() {
  const { isAuthenticated, loading, user } = useAuth();

  // Debug: console.log('🚀 App render - isAuthenticated:', isAuthenticated, 'loading:', loading, 'user:', user?.email);

  if (loading) {
    return (
      <div className="screen-center">
        <Logo size={40} />
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public route */}
          <Route 
            path="/auth" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <AuthPage />
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/note/new" 
            element={
              <ProtectedRoute>
                <NoteEditPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/note/:id" 
            element={
              <ProtectedRoute>
                <NoteViewPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/note/:id/edit" 
            element={
              <ProtectedRoute>
                <NoteEditPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route 
            path="/" 
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />
            } 
          />
          
          {/* 404 page */}
          <Route 
            path="*" 
            element={
              <div className="screen-center">
                <Logo size={40} wordmark={false} />
                <div>
                  <h1 className="page-title page-title-sm">
                    Página no encontrada
                  </h1>
                  <p className="muted">
                    La página que buscas no existe o ha sido movida.
                  </p>
                </div>
                <a
                  href={isAuthenticated ? "/dashboard" : "/auth"}
                  className="btn btn-primary"
                >
                  {isAuthenticated ? "Ir al Dashboard" : "Ir al Login"}
                </a>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;