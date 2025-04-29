
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
  console.error(`[${context}] ${message}`, error);
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
