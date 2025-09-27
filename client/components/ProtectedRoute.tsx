// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const sessionValue = localStorage.getItem('manacle_session');
  const userID = localStorage.getItem('userID');

  // Check both session markers and userID presence
  const hasValidSession = sessionValue === 'true' || sessionValue === 'active';
  const isLoggedIn = hasValidSession && userID;

  return isLoggedIn ? <>{children}</> : <Navigate to="/access-denied" replace />;
};

export default ProtectedRoute;
