import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';

const AdminRoute = ({ children }) => {
  const { user } = useStore();
  const location = useLocation();

  if (!user) {
    // Redirect to admin login if not authenticated
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    // Redirect to home if not admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
