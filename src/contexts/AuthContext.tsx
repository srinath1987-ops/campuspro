import React, { createContext, useContext, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { login, logout, signUp as reduxSignUp, fetchSession, clearError } from '@/redux/slices/authSlice';

type Profile = {
  id: string;
  full_name: string;
  role: 'admin' | 'driver' | 'user';
  avatar_url?: string;
  phone_number?: string;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getUserRole: () => 'admin' | 'driver' | 'user' | null;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, profile, isLoading, error } = useAppSelector(state => state.auth);
  const { toast } = useToast();
  
  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        
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

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Refresh the session to get updated profile data
      dispatch(fetchSession());
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    }
  };
  
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Password Updated',
        description: 'Your password has been updated successfully.',
      });
      
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update password.',
        variant: 'destructive',
      });
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    fullName: string,
    role: string = 'user'
  ) => {
    try {
      await dispatch(reduxSignUp({ email, password, fullName, role })).unwrap();
      
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created successfully. Please check your email for verification.',
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Registration Failed',
        description: error || 'Failed to create account.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting login for:", email);
      await dispatch(login({ email, password })).unwrap();
      
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error || 'Invalid email or password.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await dispatch(logout()).unwrap();
      
      toast({
        title: 'Logout Successful',
        description: 'You have been logged out.',
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout Failed',
        description: error.message || 'Failed to log out.',
        variant: 'destructive',
      });
    }
  };

  const getUserRole = (): 'admin' | 'driver' | 'user' | null => {
    return profile?.role || null;
  };

  // Get the current session
  const getSession = async (): Promise<Session | null> => {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  };

  const session = getSession();

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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
