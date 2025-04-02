
import { supabase } from "@/integrations/supabase/client";

export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();
    
    return !!data;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
};
