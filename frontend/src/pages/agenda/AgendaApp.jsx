import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/agenda/ProtectedRoute';
import AuthCallback from '../../components/agenda/AuthCallback';
import Login from './Login';
import Onboarding from './Onboarding';
import Dashboard from './Dashboard';
import Calendar from './Calendar';
import Clients from './Clients';
import Services from './Services';
import Settings from './Settings';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AgendaApp = () => {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle session_id in URL hash synchronously (before render completes)
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  useEffect(() => {
    if (user && !authLoading) {
      fetchBusiness();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchBusiness = async () => {
    try {
      const res = await fetch(`${API}/agenda/businesses`, {
        credentials: 'include'
      });
      if (res.ok) {
        const businesses = await res.json();
        if (businesses.length > 0) {
          setBusiness(businesses[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch business:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = (newBusiness) => {
    setBusiness(newBusiness);
  };

  const handleBusinessUpdate = (updatedBusiness) => {
    setBusiness(updatedBusiness);
  };

  // Show loading while checking auth
  if (authLoading || (user && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#8FEC78] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-brand">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="login" element={
        user ? <Navigate to="/app/agenda" replace /> : <Login />
      } />
      <Route path="/*" element={
        <ProtectedRoute>
          {!business ? (
            <Onboarding onComplete={handleOnboardingComplete} />
          ) : (
            <Routes>
              <Route index element={<Dashboard business={business} />} />
              <Route path="calendar" element={<Calendar business={business} />} />
              <Route path="clients" element={<Clients business={business} />} />
              <Route path="services" element={<Services business={business} />} />
              <Route path="settings" element={<Settings business={business} onUpdate={handleBusinessUpdate} />} />
            </Routes>
          )}
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AgendaApp;
