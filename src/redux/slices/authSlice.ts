import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/integrations/supabase/client';

// Types
interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  full_name: string;
  role: 'admin' | 'driver' | 'user';
  avatar_url?: string;
}

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

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch user profile after successful login
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user?.id)
        .single();

      if (profileError) throw profileError;

      return { user: data.user, profile: profileData };
    } catch (error: any) {
      return rejectWithValue(error.message);
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create a profile for the new user with ID matching auth user ID
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            full_name: fullName,
            role,
          },
        ]);

        if (profileError) throw profileError;

        // Fetch the created profile
        const { data: profileData, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (fetchError) throw fetchError;

        return { user: data.user, profile: profileData };
      }

      throw new Error('User registration failed');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue, dispatch }) => {
  try {
    // Clear local storage first
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();
    
    // Clear any auth-related items in local storage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('auth'))) {
        localStorage.removeItem(key);
      }
    }
    
    // Reset auth state in Redux immediately to prevent loading screens
    dispatch(resetAuthState());
    
    // Then sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    return null;
  } catch (error: any) {
    // Even on error, ensure state is reset
    dispatch(resetAuthState());
    return rejectWithValue(error.message);
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
        .single();

      if (profileError) throw profileError;

      return { user: data.session.user, profile: profileData };
    }
    
    return { user: null, profile: null };
  } catch (error: any) {
    return rejectWithValue(error.message);
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
    builder.addCase(login.fulfilled, (state, action: PayloadAction<{ user: User; profile: Profile }>) => {
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
    builder.addCase(signUp.fulfilled, (state, action: PayloadAction<{ user: User; profile: Profile }>) => {
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
    builder.addCase(fetchSession.fulfilled, (state, action: PayloadAction<{ user: User | null; profile: Profile | null }>) => {
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