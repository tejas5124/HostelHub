import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('student_id');

  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
