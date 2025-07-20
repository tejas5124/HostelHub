import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('student_id');
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export const AdminProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await api.get('/admins/session', { withCredentials: true });
        setIsAdmin(true);
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) return <div>Loading...</div>;
  return isAdmin ? children : <Navigate to="/admin-login" replace />;
};

export const OwnerProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await api.get('/owners/session', { withCredentials: true });
        setIsOwner(true);
      } catch {
        setIsOwner(false);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) return <div>Loading...</div>;
  return isOwner ? children : <Navigate to="/owner-login" replace />;
};

export default ProtectedRoute;
