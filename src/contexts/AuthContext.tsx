
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Profile = {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'driver';
  bus_number: string | null;
  phone_number: string;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, username: string, phone: string, role?: 'admin' | 'driver', bus_number?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getUserRole: () => 'admin' | 'driver' | null;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        console.log("Initializing auth...");
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log("Got session:", initialSession?.user?.id);
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          await fetchUserProfile(initialSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        toast({
          title: 'Authentication Error',
          description: 'There was a problem initializing authentication.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user ID:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      if (data) {
        console.log("Profile loaded:", data);
        setProfile(data as Profile);
      } else {
        console.log("No profile found for user ID:", userId);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
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
    username: string, 
    phone: string,
    role: 'admin' | 'driver' = 'driver',
    bus_number?: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            role,
            phone_number: phone,
            bus_number: bus_number || null,
          },
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Registration Successful',
        description: 'Your account has been created successfully. Please check your email for verification.',
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to create account.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting login for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      console.log("Login successful:", data.user?.id);
      
      // Fetch the profile immediately after successful login
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }

      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid email or password.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      setProfile(null);
      setUser(null);
      setSession(null);
      
      toast({
        title: 'Logged Out',
        description: 'You have been logged out successfully.',
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

  const getUserRole = (): 'admin' | 'driver' | null => {
    return profile?.role || null;
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signUp,
    signIn,
    signOut,
    getUserRole,
    updateProfile,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
