import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

type Props = {
  children?: React.ReactNode;
};

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
