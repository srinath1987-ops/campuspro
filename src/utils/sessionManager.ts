import { supabase } from '@/integrations/supabase/client';

// Session configuration
const SESSION_CONFIG = {
  // Session timeout in milliseconds (30 minutes)
  TIMEOUT_MS: 30 * 60 * 1000,
  
  // Activity check interval in milliseconds (1 minute)
  CHECK_INTERVAL_MS: 60 * 1000,
  
  // Key for storing last activity timestamp
  LAST_ACTIVITY_KEY: 'campuspro_last_activity',
  
  // Key for storing session expiration time
  EXPIRATION_KEY: 'campuspro_session_expiration',
  
  // Maximum session duration in milliseconds (8 hours)
  MAX_SESSION_DURATION_MS: 8 * 60 * 60 * 1000,
};

/**
 * Initialize the session manager
 * @returns A cleanup function to remove event listeners
 */
export const initSessionManager = (): (() => void) => {
  // Record initial activity
  updateLastActivity();
  
  // Set up event listeners for user activity
  const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
  const activityHandler = throttle(updateLastActivity, 5000);
  
  activityEvents.forEach(event => {
    window.addEventListener(event, activityHandler);
  });
  
  // Set up interval to check for session timeout
  const intervalId = setInterval(checkSessionTimeout, SESSION_CONFIG.CHECK_INTERVAL_MS);
  
  // Return cleanup function
  return () => {
    activityEvents.forEach(event => {
      window.removeEventListener(event, activityHandler);
    });
    clearInterval(intervalId);
  };
};

/**
 * Update the last activity timestamp
 */
export const updateLastActivity = (): void => {
  try {
    const now = Date.now();
    localStorage.setItem(SESSION_CONFIG.LAST_ACTIVITY_KEY, now.toString());
    
    // If expiration time is not set, set it now
    if (!localStorage.getItem(SESSION_CONFIG.EXPIRATION_KEY)) {
      const expirationTime = now + SESSION_CONFIG.MAX_SESSION_DURATION_MS;
      localStorage.setItem(SESSION_CONFIG.EXPIRATION_KEY, expirationTime.toString());
    }
  } catch (error) {
    console.error('Error updating activity timestamp:', error);
  }
};

/**
 * Check if the session has timed out due to inactivity or exceeded max duration
 * @returns True if session has timed out, false otherwise
 */
export const checkSessionTimeout = async (): Promise<boolean> => {
  try {
    // Skip check if not logged in
    const { data } = await supabase.auth.getSession();
    if (!data.session) return false;
    
    const now = Date.now();
    
    // Check last activity
    const lastActivityStr = localStorage.getItem(SESSION_CONFIG.LAST_ACTIVITY_KEY);
    if (!lastActivityStr) {
      // No activity recorded, update it now
      updateLastActivity();
      return false;
    }
    
    const lastActivity = parseInt(lastActivityStr, 10);
    const inactivityTime = now - lastActivity;
    
    // Check session expiration (hard limit)
    const expirationStr = localStorage.getItem(SESSION_CONFIG.EXPIRATION_KEY);
    if (expirationStr) {
      const expiration = parseInt(expirationStr, 10);
      if (now >= expiration) {
        // Session has exceeded maximum duration
        console.log('Session expired due to maximum duration');
        await handleSessionTimeout();
        return true;
      }
    }
    
    // Check inactivity timeout
    if (inactivityTime >= SESSION_CONFIG.TIMEOUT_MS) {
      console.log('Session expired due to inactivity');
      await handleSessionTimeout();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking session timeout:', error);
    return false;
  }
};

/**
 * Handle session timeout by logging out the user
 */
const handleSessionTimeout = async (): Promise<void> => {
  try {
    // Clear session data
    localStorage.removeItem(SESSION_CONFIG.LAST_ACTIVITY_KEY);
    localStorage.removeItem(SESSION_CONFIG.EXPIRATION_KEY);
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Set flag for timeout
    sessionStorage.setItem('session_timeout', 'true');
    
    // Reload the page to reset application state
    window.location.href = '/login?timeout=true';
  } catch (error) {
    console.error('Error handling session timeout:', error);
  }
};

/**
 * Throttle a function to prevent excessive calls
 */
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Get the remaining session time in milliseconds
 * @returns Remaining session time in milliseconds
 */
export const getRemainingSessionTime = (): number => {
  try {
    const now = Date.now();
    
    // Check last activity
    const lastActivityStr = localStorage.getItem(SESSION_CONFIG.LAST_ACTIVITY_KEY);
    if (!lastActivityStr) return 0;
    
    const lastActivity = parseInt(lastActivityStr, 10);
    const inactivityTime = now - lastActivity;
    const remainingInactivityTime = Math.max(0, SESSION_CONFIG.TIMEOUT_MS - inactivityTime);
    
    // Check session expiration (hard limit)
    const expirationStr = localStorage.getItem(SESSION_CONFIG.EXPIRATION_KEY);
    if (!expirationStr) return remainingInactivityTime;
    
    const expiration = parseInt(expirationStr, 10);
    const remainingExpirationTime = Math.max(0, expiration - now);
    
    // Return the smaller of the two remaining times
    return Math.min(remainingInactivityTime, remainingExpirationTime);
  } catch (error) {
    console.error('Error getting remaining session time:', error);
    return 0;
  }
};
