import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  console.log(user);
  const location = useLocation();

  if (!user) {
    return <Navigate 
      to="/login" 
      state={{ 
        from: location.pathname,
        message: "Please login to access this feature" 
      }} 
    />;
  }

  if (user.isGuest) {
    return <Navigate 
      to="/login" 
      state={{ 
        from: location.pathname,
        message: "Please register or login to create events" 
      }} 
    />;
  }

  return children;
}

export default PrivateRoute; 