
import { supabase } from "@/integrations/supabase/client";

export const setupDemoData = async () => {
  try {
    // Create admin user
    const { data: adminUser, error: adminError } = await supabase.auth.signUp({
      email: 'admin03.snuc@gmail.com',
      password: 'admin123',
      options: {
        data: {
          username: 'admin',
          role: 'admin',
          phone_number: '8989987659',
        },
      },
    });

    if (adminError) throw adminError;

    // Create driver users
    const { data: driver1, error: driver1Error } = await supabase.auth.signUp({
      email: 'ganesh06snuc@gmail.com',
      password: 'driver1',
      options: {
        data: {
          username: 'ganesh06',
          role: 'driver',
          phone_number: '9867876556',
          bus_number: 'TN06GF2021',
        },
      },
    });

    if (driver1Error) throw driver1Error;

    const { data: driver2, error: driver2Error } = await supabase.auth.signUp({
      email: 'ram.07snuc@gmail.com',
      password: 'driver2',
      options: {
        data: {
          username: 'ram07',
          role: 'driver',
          phone_number: '9465409876',
          bus_number: 'TN45UI3645',
        },
      },
    });

    if (driver2Error) throw driver2Error;

    return { success: true };
  } catch (error) {
    console.error('Error setting up demo data:', error);
    return { success: false, error };
  }
};
