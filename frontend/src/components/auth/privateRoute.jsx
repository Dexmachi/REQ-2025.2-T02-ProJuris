import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirecionar para dashboard correto
    if (user.role === 'socio') {
      return <Navigate to="/dashboard-socio" />;
    } else {
      return <Navigate to="/dashboard-funcionario" />;
    }
  }

  return children;
};

export default PrivateRoute;