import { supabase } from '@/integrations/supabase/client';

/**
 * Valid application roles
 */
export type AppRole = 'admin' | 'driver';

/**
 * Validates if a role string is a valid AppRole
 * @param role The role string to validate
 * @returns The validated role or 'driver' as fallback
 */
export const validateRole = (role: string): AppRole => {
  if (role === 'admin' || role === 'driver') {
    return role as AppRole;
  }
  
  // Default to 'driver' for invalid roles
  console.warn(`Invalid role "${role}" provided, defaulting to "driver"`);
  return 'driver';
};

/**
 * Validates a user's role against the database
 * @param userId The user ID to validate
 * @param expectedRole The expected role
 * @returns Promise resolving to boolean indicating if user has the expected role
 */
export const validateUserRole = async (
  userId: string, 
  expectedRole: AppRole
): Promise<boolean> => {
  try {
    // First check if the user exists
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error validating user role:', error);
      return false;
    }
    
    // Validate the role from the database
    const userRole = validateRole(data.role);
    
    // Check if the user has the expected role
    return userRole === expectedRole;
  } catch (error) {
    console.error('Exception during role validation:', error);
    return false;
  }
};

/**
 * Gets a user's role from the database with validation
 * @param userId The user ID
 * @returns Promise resolving to the validated role or null if not found
 */
export const getUserRole = async (userId: string): Promise<AppRole | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error getting user role:', error);
      return null;
    }
    
    return validateRole(data.role);
  } catch (error) {
    console.error('Exception getting user role:', error);
    return null;
  }
};

/**
 * Checks if a user has admin privileges
 * @param userId The user ID to check
 * @returns Promise resolving to boolean indicating if user is an admin
 */
export const isAdmin = async (userId: string): Promise<boolean> => {
  return await validateUserRole(userId, 'admin');
};

/**
 * Checks if a user has driver privileges
 * @param userId The user ID to check
 * @returns Promise resolving to boolean indicating if user is a driver
 */
export const isDriver = async (userId: string): Promise<boolean> => {
  return await validateUserRole(userId, 'driver');
};
