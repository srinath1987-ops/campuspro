
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { login, logout, signUp as reduxSignUp, fetchSession, clearError } from '@/redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { validateRole, getUserRole as getValidatedUserRole, AppRole } from '@/utils/roleValidation';
import { performDirectLogout } from '@/utils/logoutHelper';

// Types
export interface Profile {
  id: string;
  full_name?: string;
  role: AppRole;
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
    let isMounted = true;

    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        // Only process events if the component is still mounted
        if (!isMounted) return;

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Use setTimeout to prevent potential deadlocks with Supabase client
          setTimeout(() => {
            if (isMounted) {
              dispatch(fetchSession());
            }
          }, 0);
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
      isMounted = false;
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
      if (updates.full_name) validUpdates.username = updates.full_name;

      // Validate role before updating
      if (updates.role) {
        validUpdates.role = validateRole(updates.role);
      }

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
    if (!password || password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

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
    try {
      // Validate inputs
      if (!email || !email.trim()) {
        throw new Error('Email is required');
      }

      if (!password) {
        throw new Error('Password is required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (!fullName || !fullName.trim()) {
        throw new Error('Full name is required');
      }

      // Validate and sanitize email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw new Error('Please enter a valid email address');
      }

      // Ensure role is valid using our utility function
      const validRole = validateRole(role);

      // Call the Redux signUp action with the validated parameters
      await dispatch(reduxSignUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role: validRole,
        phone: '' // Default empty phone
      })).unwrap();
    } catch (error: any) {
      toast({
        title: 'Sign Up Error',
        description: error.message || 'Failed to sign up. Please try again.',
        variant: 'destructive',
      });
      throw error; // Re-throw to allow component to handle it
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Validate inputs
      if (!email || !email.trim()) {
        throw new Error('Email is required');
      }

      if (!password) {
        throw new Error('Password is required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw new Error('Please enter a valid email address');
      }

      // Sanitize email by trimming
      await dispatch(login({ email: email.trim(), password })).unwrap();
    } catch (error: any) {
      toast({
        title: 'Sign In Error',
        description: error.message || 'Failed to sign in. Please check your credentials.',
        variant: 'destructive',
      });
      throw error; // Re-throw to allow component to handle it
    }
  };

  const signOut = () => {
    // Clear local state immediately
    setSession(null);

    // Dispatch Redux action to clear state (synchronous)
    dispatch(logout());

    // Use our direct logout method - this will handle everything else
    performDirectLogout();
  };

  const getUserRole = async (): Promise<AppRole | null> => {
    if (!user) return null;

    // If we already have the profile in state, use that
    if (profile) {
      return profile.role;
    }

    // Otherwise use our utility function to get the validated role
    return await getValidatedUserRole(user.id);
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
