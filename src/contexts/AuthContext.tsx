
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { login, logout, signUp as reduxSignUp, fetchSession, clearError } from '@/redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

// Types
export interface Profile {
  id: string;
  full_name: string;
  role: 'admin' | 'driver' | 'user';
  avatar_url?: string;
  phone_number?: string;
  email?: string;
  username?: string;
  bus_number?: string;
  last_login?: string;
  created_at?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getUserRole: () => Promise<string | null>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, profile, isLoading, error } = useAppSelector(state => state.auth);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  
  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        // console.log("Auth state changed:", event, currentSession?.user?.id);
        
        // Re-fetch session when auth state changes
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          dispatch(fetchSession());
        }
        else if (event === 'SIGNED_OUT') {
          // Clear local state when signed out
          dispatch(logout());
        }
      }
    );

    // Initialize auth on component mount
    dispatch(fetchSession());

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  // Show toast on error
  useEffect(() => {
    if (error) {
      toast({
        title: 'Authentication Error',
        description: error,
        variant: 'destructive',
      });
      dispatch(clearError());
    }
  }, [error, toast, dispatch]);

  // Fetch session
  useEffect(() => {
    const getSessionData = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      } catch (error) {
        console.error('Error getting session:', error);
        setSession(null);
      }
    };
    
    getSessionData();
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update your profile',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Only include fields that actually exist in the database schema
      const validUpdates: Record<string, any> = {};
      if (updates.full_name) validUpdates.full_name = updates.full_name;
      if (updates.role) validUpdates.role = updates.role;
      if (updates.avatar_url !== undefined) validUpdates.avatar_url = updates.avatar_url;
      if (updates.phone_number !== undefined) validUpdates.phone_number = updates.phone_number;
      if (updates.username !== undefined) validUpdates.username = updates.username;
      if (updates.bus_number !== undefined) validUpdates.bus_number = updates.bus_number;

      const { error } = await supabase
        .from('profiles')
        .update(validUpdates)
        .eq('id', user.id);

      if (error) throw error;

      // Refresh session to get updated profile
      await dispatch(fetchSession()).unwrap();
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };
  
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Password updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update password',
        variant: 'destructive',
      });
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    await dispatch(reduxSignUp({ email, password, fullName, role })).unwrap();
  };

  const signIn = async (email: string, password: string) => {
    await dispatch(login({ email, password })).unwrap();
  };

  const signOut = async () => {
    try {
      // Clear state immediately to prevent UI freezing
      setSession(null);
      
      // Set flag to indicate we're logging out (will be checked in ProtectedRoute)
      sessionStorage.setItem('just_logged_out', 'true');
      
      // Navigate immediately - don't wait for the logout to complete
      navigate('/login', { replace: true });
      
      // Then perform the actual logout asynchronously
      dispatch(logout()).catch((error) => {
        console.error('Logout error:', error);
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Force navigation even on errors
      sessionStorage.setItem('just_logged_out', 'true');
      navigate('/login', { replace: true });
    }
  };

  const getUserRole = async (): Promise<string | null> => {
    if (!user) return null;
    
    if (profile) {
      return profile.role;
    }
    
    // If no profile in state yet, fetch it
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data.role;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  };

  // Get the current session (for reference, not used directly in context)
  const getSession = async (): Promise<Session | null> => {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        signUp,
        signIn,
        signOut,
        getUserRole,
        updateProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
