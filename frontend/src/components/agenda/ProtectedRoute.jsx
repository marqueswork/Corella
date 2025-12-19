import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // If user data was passed from AuthCallback, skip loading state
  if (location.state?.user) {
    return children;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#8FEC78] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-brand">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/app/agenda/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
