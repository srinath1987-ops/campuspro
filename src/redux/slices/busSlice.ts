import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/integrations/supabase/client';

// Types
export interface Bus {
  id: string;
  bus_number: string;
  rfid_id: string;
  driver_name: string;
  bus_capacity: number;
  in_campus: boolean;
  in_time?: string | null;
  out_time?: string | null;
  created_at: string;
  student_count?: number;
}

export interface BusEntry {
  id: string;
  bus_number: string;
  rfid_id: string;
  in_time: string;
  out_time?: string | null;
  date_in: string;
  date_out?: string | null;
  created_at: string;
}

export interface DailyStudentCount {
  date: string;
  student_count: number;
}

interface BusState {
  buses: Bus[];
  entries: BusEntry[];
  studentCounts: DailyStudentCount[];
  selectedBus: Bus | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BusState = {
  buses: [],
  entries: [],
  studentCounts: [],
  selectedBus: null,
  isLoading: false,
  error: null,
};

// Async Thunks
export const fetchBuses = createAsyncThunk('buses/fetchBuses', async (_, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase.from('bus_details').select('*');

    if (error) throw error;

    // Fetch the latest student count for each bus
    const busesWithCount = await Promise.all((data || []).map(async (bus) => {
      const { data: countData, error: countError } = await supabase
        .from('bus_student_count')
        .select('*')
        .eq('bus_number', bus.bus_number)
        .order('date', { ascending: false })
        .limit(1);
        
      if (countError) {
        console.error('Error fetching count:', countError);
        return { ...bus, student_count: 0 };
      }
      
      return { 
        ...bus, 
        student_count: countData && countData.length > 0 ? countData[0].student_count : 0 
      };
    }));

    return busesWithCount;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchBusEntries = createAsyncThunk(
  'buses/fetchBusEntries',
  async ({ startDate, endDate }: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('bus_times')
        .select('*')
        .gte('date_in', startDate)
        .lte('date_in', endDate)
        .order('in_time', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStudentCounts = createAsyncThunk(
  'buses/fetchStudentCounts',
  async ({ year, month }: { year: string; month: string }, { rejectWithValue }) => {
    try {
      const startOfMonth = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      const endOfMonth = endDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('bus_student_count')
        .select('date, student_count')
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)
        .order('date', { ascending: true });

      if (error) throw error;

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addBus = createAsyncThunk(
  'buses/addBus',
  async (busData: Omit<Bus, 'id' | 'created_at'>, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from('bus_details').insert([busData]).select().single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBus = createAsyncThunk(
  'buses/updateBus',
  async ({ id, busData }: { id: string; busData: Partial<Bus> }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('bus_details')
        .update(busData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBus = createAsyncThunk(
  'buses/deleteBus',
  async (id: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from('bus_details').delete().eq('id', id);

      if (error) throw error;

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const busSlice = createSlice({
  name: 'buses',
  initialState,
  reducers: {
    setSelectedBus: (state, action: PayloadAction<Bus | null>) => {
      state.selectedBus = action.payload;
    },
    clearBusError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Buses
    builder.addCase(fetchBuses.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBuses.fulfilled, (state, action: PayloadAction<Bus[]>) => {
      state.isLoading = false;
      state.buses = action.payload;
    });
    builder.addCase(fetchBuses.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Bus Entries
    builder.addCase(fetchBusEntries.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBusEntries.fulfilled, (state, action: PayloadAction<BusEntry[]>) => {
      state.isLoading = false;
      state.entries = action.payload;
    });
    builder.addCase(fetchBusEntries.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Student Counts
    builder.addCase(fetchStudentCounts.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchStudentCounts.fulfilled, (state, action: PayloadAction<DailyStudentCount[]>) => {
      state.isLoading = false;
      state.studentCounts = action.payload;
    });
    builder.addCase(fetchStudentCounts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Add Bus
    builder.addCase(addBus.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(addBus.fulfilled, (state, action: PayloadAction<Bus>) => {
      state.isLoading = false;
      state.buses.push(action.payload);
    });
    builder.addCase(addBus.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update Bus
    builder.addCase(updateBus.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateBus.fulfilled, (state, action: PayloadAction<Bus>) => {
      state.isLoading = false;
      const index = state.buses.findIndex((bus) => bus.id === action.payload.id);
      if (index !== -1) {
        state.buses[index] = action.payload;
      }
      if (state.selectedBus?.id === action.payload.id) {
        state.selectedBus = action.payload;
      }
    });
    builder.addCase(updateBus.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete Bus
    builder.addCase(deleteBus.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteBus.fulfilled, (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.buses = state.buses.filter((bus) => bus.id !== action.payload);
      if (state.selectedBus?.id === action.payload) {
        state.selectedBus = null;
      }
    });
    builder.addCase(deleteBus.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setSelectedBus, clearBusError } = busSlice.actions;
export default busSlice.reducer; 