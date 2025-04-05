import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { fetchSession } from '@/redux/slices/authSlice';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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
  const [loggingOut, setLoggingOut] = useState(false);
  
  // Check if we're in a logout process using URL or session storage
  useEffect(() => {
    // If we're coming from a logout action, skip loading state
    const isJustLoggedOut = sessionStorage.getItem('just_logged_out') === 'true';
    if (isJustLoggedOut) {
      setLoggingOut(true);
      sessionStorage.removeItem('just_logged_out');
      navigate('/login', { replace: true });
      return;
    }
  }, [navigate]);
  
  // Try to refresh session on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkSession = async () => {
      if (!user && !loggingOut) {
        try {
          await dispatch(fetchSession()).unwrap();
        } catch (err) {
          console.error("Session fetch failed:", err);
        } finally {
          if (isMounted) {
            setInitializing(false);
          }
        }
      } else {
        if (isMounted) {
          setInitializing(false);
        }
      }
    };
    
    checkSession();
    
    return () => {
      isMounted = false;
    };
  }, [dispatch, user, loggingOut]);
  
  // Handle authentication notifications and redirects
  useEffect(() => {
    // Only process when we're done loading and not logging out
    if (!isLoading && !initializing && !loggingOut) {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to access this page.",
          variant: "destructive"
        });
        
        // Force navigation to login page
        navigate('/login', {
          replace: true,
          state: { returnUrl: location.pathname }
        });
      } else if (allowedRole && profile?.role !== allowedRole) {
        toast({
          title: "Access restricted",
          description: `This page is only accessible to ${allowedRole}s.`,
          variant: "destructive"
        });
        
        // Redirect based on user role
        if (profile?.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (profile?.role === 'driver') {
          navigate('/driver/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    }
  }, [isLoading, initializing, loggingOut, user, toast, allowedRole, profile, location.pathname, navigate]);

  // If we're logging out, don't show loading indicator
  if (loggingOut) {
    return null;
  }

  // Show loading indicator while auth state is initializing
  if (isLoading || initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your session...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or wrong role, handle via useEffect
  if (!user || (allowedRole && profile?.role !== allowedRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking your permissions...</p>
        </div>
      </div>
    );
  }
  
  // User is authenticated and has correct role
  return <>{children}</>;
};

export default ProtectedRoute;
