import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { initializeAuth } from './store/authStore';
import { useAuthStore } from './store/authStore';

import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CFDIListPage from './pages/CFDIListPage';
import CFDIDetailPage from './pages/CFDIDetailPage';
import CFDIFormPage from './pages/CFDIFormPage';
import AdminPage from './pages/AdminPage';

// Initialize auth on app load
initializeAuth();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          <Route path="dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          <Route path="facturas" element={
            <ProtectedRoute>
              <CFDIListPage />
            </ProtectedRoute>
          } />
          
          <Route path="facturas/:id" element={
            <ProtectedRoute>
              <CFDIDetailPage />
            </ProtectedRoute>
          } />
          
          <Route path="facturas/nueva" element={
            <ProtectedRoute>
              <CFDIFormPage />
            </ProtectedRoute>
          } />
          
          <Route path="facturas/editar/:id" element={
            <ProtectedRoute>
              <CFDIFormPage />
            </ProtectedRoute>
          } />
          
          <Route path="admin" element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;