// src/components/ProtectedRoute.tsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sessionValue = localStorage.getItem('manacle_session');
        const userID = localStorage.getItem('userID');

        // Check both session markers and userID presence
        const hasValidSession = sessionValue === 'true' || sessionValue === 'active';
        const hasUserID = !!userID;

        if (hasValidSession && hasUserID) {
          // For production, also verify with server
          try {
            const response = await fetch('/api/me', { 
              credentials: 'include',
              cache: 'no-cache' // Ensure fresh response
            });
            const data = await response.json();
            
            if (data.authenticated && data.user?.id) {
              // Update localStorage with server data if different
              if (data.user.id !== userID) {
                localStorage.setItem('userID', data.user.id);
              }
              setIsAuthenticated(true);
            } else {
              console.warn('[ProtectedRoute] Server session invalid, clearing localStorage');
              localStorage.removeItem('manacle_session');
              localStorage.removeItem('userID');
              setIsAuthenticated(false);
            }
          } catch (serverError) {
            console.warn('[ProtectedRoute] Server check failed, using localStorage auth:', serverError);
            // If server is unreachable but we have valid localStorage, trust it
            setIsAuthenticated(true);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('[ProtectedRoute] Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (isChecking) {
    // Show a loading spinner while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/access-denied" replace />;
};

export default ProtectedRoute;
