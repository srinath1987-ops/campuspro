import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { fetchSession } from '@/redux/slices/authSlice';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'admin' | 'driver' | 'user' | undefined;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRole 
}) => {
  // Use Redux state instead of auth context
  const { user, profile, isLoading } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [initializing, setInitializing] = useState(true);
  
  // Try to refresh session on mount or when route changes
  useEffect(() => {
    const checkSession = async () => {
      if (!user) {
        try {
          await dispatch(fetchSession()).unwrap();
        } catch (err) {
          // Session fetch failed, will be handled by the render logic
        } finally {
          setInitializing(false);
        }
      } else {
        setInitializing(false);
      }
    };
    
    checkSession();
  }, [dispatch, user, location.pathname]);
  
  useEffect(() => {
    // Only show toast messages when we've confirmed the user is not authenticated
    // and after the initial session check
    if (!isLoading && !initializing && !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page.",
        variant: "destructive"
      });
    } else if (!isLoading && !initializing && user && allowedRole && profile?.role !== allowedRole) {
      toast({
        title: "Access restricted",
        description: `This page is only accessible to ${allowedRole}s.`,
        variant: "destructive"
      });
    }
  }, [isLoading, initializing, user, toast, allowedRole, profile, location.pathname]);

  // Show loading indicator while auth state is initializing
  if (isLoading || initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
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
