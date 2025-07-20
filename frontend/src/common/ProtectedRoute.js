import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('student_id');

  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export const AdminProtectedRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('admin_id');
  return isAdmin ? children : <Navigate to="/admin-login" replace />;
};

export const OwnerProtectedRoute = ({ children }) => {
  const isOwner = localStorage.getItem('owner_id');
  return isOwner ? children : <Navigate to="/owner-login" replace />;
};

export default ProtectedRoute;
