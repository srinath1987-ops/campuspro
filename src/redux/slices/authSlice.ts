
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/contexts/AuthContext';
import { User } from '@supabase/supabase-js';

// Types
interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  isLoading: false,
  error: null,
};

// Helper function to handle errors
const handleAuthError = (error: any): string => {
  if (error?.message) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown authentication error occurred';
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // Validate input
      if (!email || !email.trim()) return rejectWithValue('Email is required');
      if (!password || !password.trim()) return rejectWithValue('Password is required');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('User data not found');

      // Fetch user profile after successful login
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        // Don't throw error here - still return the user even if profile fetch fails
      }

      // Convert database role to type-safe role
      const role = profileData?.role === 'admin' || profileData?.role === 'driver'
        ? profileData.role as 'admin' | 'driver'
        : 'driver';
        
      const profile = profileData ? {
        ...profileData,
        role,
        id: profileData.id,
      } : null;

      return { user: data.user, profile, session: data.session };
    } catch (error: any) {
      return rejectWithValue(handleAuthError(error));
    }
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async (
    { email, password, fullName, role }: { email: string; password: string; fullName: string; role: string },
    { rejectWithValue }
  ) => {
    try {
      // Input validation
      if (!email || !email.trim()) return rejectWithValue('Email is required');
      if (!password || password.length < 6) return rejectWithValue('Password must be at least 6 characters');
      if (!fullName || !fullName.trim()) return rejectWithValue('Full name is required');
      
      // Make sure we have a valid value for username
      const username = fullName.trim();
      if (!username) return rejectWithValue('Username cannot be empty');
      
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            full_name: fullName,
            role: role
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('User registration failed: no user data returned');

      // Return success even if profile creation might fail later
      // The user is created in auth and can log in
      return { 
        user: data.user, 
        profile: {
          id: data.user.id,
          email,
          role: (role === 'admin' || role === 'driver') ? role as 'admin' | 'driver' : 'driver',
          username,
          full_name: fullName
        } 
      };
    } catch (error: any) {
      console.error("Signup error:", error);
      return rejectWithValue(handleAuthError(error));
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue, dispatch }) => {
  try {
    // Clear local storage immediately
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('auth'))) {
        localStorage.removeItem(key);
      }
    }
    
    // Clear session storage as well
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('auth'))) {
        sessionStorage.removeItem(key);
      }
    }
    
    // Set a flag that we're logging out
    sessionStorage.setItem('logging_out', 'true');
    
    // Reset auth state in Redux immediately to prevent loading screens
    dispatch(resetAuthState());
    
    // Then sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    return null;
  } catch (error: any) {
    // Even on error, ensure state is reset
    dispatch(resetAuthState());
    return rejectWithValue(handleAuthError(error));
  } finally {
    // Clear the logging out flag
    sessionStorage.removeItem('logging_out');
  }
});

export const fetchSession = createAsyncThunk('auth/fetchSession', async (_, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    if (data.session?.user) {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // Don't fail the session fetch if profile fetch fails
        return { user: data.session.user, profile: null, session: data.session };
      }

      if (!profileData) {
        console.log('No profile found for user, returning just user data');
        return { user: data.session.user, profile: null, session: data.session };
      }

      // Ensure type safety for role
      const role = profileData.role === 'admin' || profileData.role === 'driver'
        ? profileData.role as 'admin' | 'driver'
        : 'driver';
      
      const profile: Profile = {
        ...profileData,
        role,
        id: profileData.id,
      };

      return { user: data.session.user, profile, session: data.session };
    }
    
    return { user: null, profile: null, session: null };
  } catch (error: any) {
    console.error('Session fetch error:', error);
    return rejectWithValue(handleAuthError(error));
  }
});

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuthState: () => {
      // Reset to initial state
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.profile = action.payload.profile;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Sign Up
    builder.addCase(signUp.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(signUp.fulfilled, (state, action) => {
      state.isLoading = false;
      // Don't set user here since they need to verify email
      // or log in after signup
    });
    builder.addCase(signUp.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Logout
    builder.addCase(logout.pending, (state) => {
      // Reset state immediately to prevent loading screens
      return { ...initialState };
    });
    builder.addCase(logout.fulfilled, () => {
      // Reset to initial state completely
      return { ...initialState };
    });
    builder.addCase(logout.rejected, (state, action) => {
      // Even on error, return initial state
      return { ...initialState, error: action.payload as string };
    });
    
    // Fetch Session
    builder.addCase(fetchSession.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchSession.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.profile = action.payload.profile;
    });
    builder.addCase(fetchSession.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, resetAuthState } = authSlice.actions;
export default authSlice.reducer;
