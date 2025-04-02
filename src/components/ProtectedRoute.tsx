
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'admin' | 'driver' | undefined;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRole 
}) => {
  const { user, profile, isLoading } = useAuth();

  // Show loading indicator while auth state is initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If a specific role is required and user doesn't have it
  if (allowedRole && profile?.role !== allowedRole) {
    // Redirect admin to admin dashboard
    if (profile?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // Redirect driver to driver dashboard
    if (profile?.role === 'driver') {
      return <Navigate to="/driver/dashboard" replace />;
    }
    
    // If profile isn't loaded yet or role isn't recognized
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
