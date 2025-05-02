/**
 * Utility functions for handling logout in a non-blocking way
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Perform a direct logout that bypasses React Router completely
 * This is the most reliable way to handle logout
 */
export const performDirectLogout = (): void => {
  // Set a flag to indicate we're doing a clean logout
  try {
    localStorage.setItem('clean_logout_completed', 'true');
  } catch (e) {
    // Ignore errors
  }

  // Directly navigate to the logout page
  window.location.replace('/logout.html');
};

/**
 * Safely navigate to the login page after logout
 * @param navigate The navigate function from react-router
 */
export const safeNavigateAfterLogout = (navigate: (path: string, options?: any) => void): void => {
  // Use our direct logout method
  performDirectLogout();
};

/**
 * Perform a lightweight logout that won't block the UI
 * This is kept for backward compatibility
 */
export const performLightweightLogout = (): void => {
  // Use our direct logout method
  performDirectLogout();
};

/**
 * Clear all authentication-related data from storage
 * This is kept for backward compatibility
 */
export const clearAuthStorage = (): void => {
  // Use our direct logout method
  performDirectLogout();
};
