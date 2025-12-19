import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = window.location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]*)/);
      
      if (!sessionIdMatch) {
        navigate('/app/agenda/login');
        return;
      }

      const sessionId = sessionIdMatch[1];

      try {
        const response = await fetch(`${API}/auth/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ session_id: sessionId })
        });

        if (response.ok) {
          const userData = await response.json();
          setAuthUser(userData);
          // Clear hash and navigate to dashboard
          window.history.replaceState(null, '', window.location.pathname);
          navigate('/app/agenda', { state: { user: userData }, replace: true });
        } else {
          console.error('Session exchange failed');
          navigate('/app/agenda/login');
        }
      } catch (error) {
        console.error('Auth error:', error);
        navigate('/app/agenda/login');
      }
    };

    processAuth();
  }, [navigate, setAuthUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#8FEC78] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-secondary-brand">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
