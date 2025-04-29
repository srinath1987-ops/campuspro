import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/integrations/supabase/client';
import { formatErrorMessage, logError } from '@/utils/errorHandlers';

// Types
export interface Bus {
  id: string;
  bus_number: string;
  rfid_id: string;
  driver_name: string;
  driver_phone: string;
  bus_capacity: number;
  in_campus: boolean;
  in_time?: string | null;
  out_time?: string | null;
  start_point: string;
  last_updated: string;
  created_at: string;
  student_count?: number;
}

export interface BusEntry {
  id: number;
  bus_number: string;
  rfid_id: string | null;
  in_time: string | null;
  out_time?: string | null;
  date_in: string | null;
  date_out?: string | null;
  created_at: string;
}

export interface DailyStudentCount {
  date: string;
  student_count: number;
}

export interface BusStop {
  location: string;
  time: string;
  description?: string;
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
        logError('FetchBusCount', countError);
        return { 
          ...bus, 
          id: bus.rfid_id, // Use RFID as ID for existing buses
          created_at: bus.last_updated || new Date().toISOString(), // Default if missing
          student_count: 0 
        };
      }
      
      return { 
        ...bus,
        id: bus.rfid_id, // Use RFID as ID for existing buses
        created_at: bus.last_updated || new Date().toISOString(), // Default if missing
        student_count: countData && countData.length > 0 ? countData[0].student_count : 0 
      };
    }));

    return busesWithCount as Bus[];
  } catch (error: any) {
    return rejectWithValue(formatErrorMessage(error));
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

      return data as BusEntry[];
    } catch (error: any) {
      return rejectWithValue(formatErrorMessage(error));
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

      return data as DailyStudentCount[];
    } catch (error: any) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const addBus = createAsyncThunk(
  'buses/addBus',
  async (busData: Omit<Bus, 'id' | 'created_at' | 'last_updated'>, { rejectWithValue }) => {
    try {
      const now = new Date().toISOString();
      
      // Make sure the object we're sending matches what Supabase expects
      const supabaseData = {
        bus_number: busData.bus_number,
        rfid_id: busData.rfid_id,
        driver_name: busData.driver_name,
        driver_phone: busData.driver_phone,
        bus_capacity: busData.bus_capacity,
        start_point: busData.start_point,
        in_campus: busData.in_campus || false,
        last_updated: now,
      };

      const { data, error } = await supabase
        .from('bus_details')
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      // Add the missing properties required by our interface
      return {
        ...data,
        id: data.rfid_id, // Use RFID as ID
        created_at: data.last_updated || now,
      } as Bus;
    } catch (error: any) {
      return rejectWithValue(formatErrorMessage(error));
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
        .eq('rfid_id', id) // Using rfid_id as the unique identifier
        .select()
        .single();

      if (error) throw error;

      // Add the missing properties required by our interface
      return {
        ...data,
        id: data.rfid_id, // Use RFID as ID for consistency
        created_at: data.last_updated || new Date().toISOString(), // Ensure created_at field is present
      } as Bus;
    } catch (error: any) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const deleteBus = createAsyncThunk(
  'buses/deleteBus',
  async (id: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('bus_details')
        .delete()
        .eq('rfid_id', id); // Using rfid_id as the unique identifier

      if (error) throw error;

      return id;
    } catch (error: any) {
      return rejectWithValue(formatErrorMessage(error));
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
