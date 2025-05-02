
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/contexts/AuthContext';
import { User } from '@supabase/supabase-js';
import { validateRole, AppRole } from '@/utils/roleValidation';

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
  console.error("Auth error:", error);
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
        // Don't throw error here, just return null profile
      }

      // Validate and convert database role to type-safe role
      const role = profileData ? validateRole(profileData.role) : 'driver';

      const profile: Profile | null = profileData ? {
        ...profileData,
        role,
        id: profileData.id,
      } : null;

      return { user: data.user, profile };
    } catch (error: any) {
      return rejectWithValue(handleAuthError(error));
    }
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async (
    { email, password, fullName, role, phone }:
    { email: string; password: string; fullName: string; role: string; phone: string },
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
            username: username, // Explicitly set username in auth metadata
            full_name: fullName,
            role: role
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('User registration failed: no user data returned');

      // Validate role using our utility function
      const safeRole = validateRole(role);

      // Create a profile for the new user with ID matching auth user ID
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        phone_number: phone || '',
        role: safeRole,
        username: username, // Make sure username is explicitly set
      });

      if (profileError) {
        // Clean up auth user if profile creation fails
        console.error("Profile creation error:", profileError);
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      // Fetch the created profile
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching profile:", fetchError);
        // Don't throw, just return null profile
      }

      // Ensure type safety for role using our validation utility
      const typeSafeProfile: Profile | null = profileData ? {
        ...profileData,
        role: validateRole(profileData.role),
        id: profileData.id,
      } : null;

      return { user: data.user, profile: typeSafeProfile };
    } catch (error: any) {
      console.error("Signup error:", error);
      return rejectWithValue(handleAuthError(error));
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  // Reset auth state in Redux immediately - this is the most important part
  dispatch(resetAuthState());

  // Return immediately - don't do any async work here
  // The actual logout cleanup is handled by the logoutHelper utility
  return null;
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
        return { user: data.session.user, profile: null };
      }

      // Ensure type safety for role if profile exists
      if (profileData) {
        // Use our validation utility to ensure role is valid
        const role = validateRole(profileData.role);

        const profile: Profile = {
          ...profileData,
          role,
          id: profileData.id,
        };

        return { user: data.session.user, profile };
      }

      return { user: data.session.user, profile: null };
    }

    return { user: null, profile: null };
  } catch (error: any) {
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
      state.user = action.payload.user;
      state.profile = action.payload.profile;
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
