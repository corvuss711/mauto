// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isLoggedIn = localStorage.getItem('manacle_session') === 'true';
  return isLoggedIn ? <>{children}</> : <Navigate to="/access-denied" replace />;
};

export default ProtectedRoute;
