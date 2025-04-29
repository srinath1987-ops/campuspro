
/**
 * Utility functions for handling errors throughout the application
 */

/**
 * Format an error into a user-friendly message
 */
export const formatErrorMessage = (error: any): string => {
  // Handle Supabase errors
  if (error?.code === 'PGRST301') {
    return 'Database row not found';
  }
  
  if (error?.code === '23505') {
    return 'This record already exists';
  }

  if (error?.code === '23502') {
    // Handle NOT NULL constraint violations
    if (error?.message?.includes('driver_name')) {
      return 'Driver name is required';
    }
    return 'A required field is missing';
  }

  // Handle network errors
  if (error?.message?.includes('Failed to fetch') || 
      error?.message?.includes('NetworkError') ||
      error?.message?.includes('network request failed')) {
    return 'Network connection error. Please check your internet connection.';
  }
  
  // Handle authentication errors
  if (error?.message?.includes('auth') || 
      error?.message?.includes('login') || 
      error?.message?.includes('password') ||
      error?.message?.includes('email')) {
    return error.message || 'Authentication failed. Please try again.';
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};

/**
 * Log an error with proper formatting
 */
export const logError = (context: string, error: any): void => {
  const message = formatErrorMessage(error);
  // Only log detailed errors in development
  if (import.meta.env.DEV) {
    console.error(`[${context}] ${message}`, error);
  } else {
    // In production, log minimal info to avoid exposing sensitive data
    console.error(`[${context}] ${message}`);
  }
};

/**
 * Safe function to parse JSON without throwing
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logError('JSON Parse', error);
    return fallback;
  }
};

/**
 * Safely handle async operations with better error management
 * Returns both data and error to properly handle all cases
 */
export const safeAsync = async <T>(
  asyncFn: () => Promise<T>,
  errorContext: string
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const result = await asyncFn();
    return { data: result, error: null };
  } catch (error) {
    logError(errorContext, error);
    return { data: null, error: formatErrorMessage(error) };
  }
};

/**
 * Deduplicate multiple API calls for the same data
 * Helps prevent unnecessary API calls when switching tabs
 */
const pendingPromises: Record<string, Promise<any>> = {};

export const deduplicatedAsync = async <T>(
  key: string,
  asyncFn: () => Promise<T>,
  errorContext: string,
  expirationMs: number = 5000 // Default 5 seconds expiration
): Promise<{ data: T | null; error: string | null }> => {
  // If we already have a pending promise for this key, return it
  if (pendingPromises[key]) {
    try {
      const result = await pendingPromises[key];
      return { data: result, error: null };
    } catch (error) {
      logError(errorContext, error);
      return { data: null, error: formatErrorMessage(error) };
    }
  }
  
  // Create a new promise and store it
  const promise = asyncFn();
  pendingPromises[key] = promise;
  
  // Set timeout to remove from cache
  setTimeout(() => {
    delete pendingPromises[key];
  }, expirationMs);
  
  try {
    const result = await promise;
    return { data: result, error: null };
  } catch (error) {
    logError(errorContext, error);
    return { data: null, error: formatErrorMessage(error) };
  }
};

/**
 * Throttle a function to prevent excessive calls
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => ReturnType<T> | undefined) => {
  let inThrottle = false;
  let lastResult: ReturnType<T> | undefined;
  
  return function(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    
    return lastResult;
  };
};

/**
 * Get a function that runs only when document is visible
 * Prevents unnecessary operations when tab is in background
 */
export const onlyWhenVisible = <T extends (...args: any[]) => any>(
  func: T
): ((...args: Parameters<T>) => ReturnType<T> | undefined) => {
  return function(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    if (document.visibilityState === 'visible') {
      return func.apply(this, args);
    }
    return undefined;
  };
};
