
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/integrations/supabase/client';

// Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'driver'; // Removing 'user' as it's not allowed by database enum
  avatar_url?: string;
  phone_number?: string;
  created_at: string;
}

interface UserState {
  users: User[];
  drivers: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  drivers: [],
  selectedUser: null,
  isLoading: false,
  error: null,
};

// Async Thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      // Format data to match our User interface without relying on auth_users join
      const formattedData = (data || []).map((user) => ({
        id: user.id,
        email: user.email || '',
        full_name: user.username || '', // Use username as full_name
        role: user.role,
        avatar_url: user.avatar_url,
        phone_number: user.phone_number,
        created_at: user.created_at,
      }));

      return formattedData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDrivers = createAsyncThunk(
  'users/fetchDrivers',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'driver')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Format data to match our User interface without relying on auth_users join
      const formattedData = (data || []).map((user) => ({
        id: user.id,
        email: user.email || '',
        full_name: user.username || '', // Use username as full_name
        role: user.role,
        avatar_url: user.avatar_url,
        phone_number: user.phone_number,
        created_at: user.created_at,
      }));

      return formattedData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }: { id: string; userData: Partial<User> }, { rejectWithValue }) => {
    try {
      // Make sure we only send valid fields to Supabase
      const validUpdateData = {
        username: userData.full_name, // Map full_name to username
        phone_number: userData.phone_number,
        avatar_url: userData.avatar_url,
        role: userData.role,
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(validUpdateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      // Format response to match our User interface
      return {
        id: data.id,
        email: data.email || '',
        full_name: data.username || '', // Use username as full_name
        role: data.role,
        avatar_url: data.avatar_url,
        phone_number: data.phone_number,
        created_at: data.created_at,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      // Delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (profileError) throw profileError;

      // Note: In this architecture, we might not have direct access to delete auth users
      // as this typically requires admin privileges. If needed, this should be handled
      // through a secure server-side function.

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Users
    builder.addCase(fetchUsers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
      state.isLoading = false;
      state.users = action.payload;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Drivers
    builder.addCase(fetchDrivers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchDrivers.fulfilled, (state, action: PayloadAction<User[]>) => {
      state.isLoading = false;
      state.drivers = action.payload;
    });
    builder.addCase(fetchDrivers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update User
    builder.addCase(updateUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      const index = state.users.findIndex((user) => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }

      const driverIndex = state.drivers.findIndex((user) => user.id === action.payload.id);
      if (driverIndex !== -1) {
        if (action.payload.role === 'driver') {
          state.drivers[driverIndex] = action.payload;
        } else {
          // If the role changed from driver to something else, remove from drivers list
          state.drivers = state.drivers.filter((user) => user.id !== action.payload.id);
        }
      } else if (action.payload.role === 'driver') {
        // If role changed to driver and wasn't in drivers list before, add it
        state.drivers.push(action.payload);
      }

      if (state.selectedUser?.id === action.payload.id) {
        state.selectedUser = action.payload;
      }
    });
    builder.addCase(updateUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete User
    builder.addCase(deleteUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.users = state.users.filter((user) => user.id !== action.payload);
      state.drivers = state.drivers.filter((user) => user.id !== action.payload);
      if (state.selectedUser?.id === action.payload) {
        state.selectedUser = null;
      }
    });
    builder.addCase(deleteUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setSelectedUser, clearUserError } = userSlice.actions;
export default userSlice.reducer;
