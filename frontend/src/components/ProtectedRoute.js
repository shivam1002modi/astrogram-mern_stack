import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // If no user is logged in, redirect to the /login page
    return <Navigate to="/login" />;
  }

  // If a user is logged in, show the page they were trying to access
  return <Outlet />;
}