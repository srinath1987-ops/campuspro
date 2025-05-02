/**
 * Utility functions for input validation and sanitization
 */

/**
 * Sanitize a string by trimming and removing potentially dangerous characters
 * @param input The input string to sanitize
 * @returns The sanitized string
 */
export const sanitizeString = (input: string | null | undefined): string => {
  if (input === null || input === undefined) {
    return '';
  }
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>]/g, '');
  
  return sanitized;
};

/**
 * Validate an email address
 * @param email The email address to validate
 * @returns True if the email is valid, false otherwise
 */
export const isValidEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate a password
 * @param password The password to validate
 * @param minLength Minimum length (default: 6)
 * @returns True if the password is valid, false otherwise
 */
export const isValidPassword = (
  password: string | null | undefined, 
  minLength: number = 6
): boolean => {
  if (!password) return false;
  return password.length >= minLength;
};

/**
 * Validate a phone number
 * @param phone The phone number to validate
 * @returns True if the phone number is valid, false otherwise
 */
export const isValidPhone = (phone: string | null | undefined): boolean => {
  if (!phone) return false;
  
  // Remove non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Check if we have at least 10 digits
  return digitsOnly.length >= 10;
};

/**
 * Sanitize and validate an object's string properties
 * @param obj The object to sanitize
 * @returns A new object with sanitized string properties
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const result = { ...obj };
  
  for (const key in result) {
    if (typeof result[key] === 'string') {
      result[key] = sanitizeString(result[key]);
    }
  }
  
  return result;
};

/**
 * Sanitize SQL input to prevent SQL injection
 * @param input The input string to sanitize
 * @returns The sanitized string
 */
export const sanitizeSqlInput = (input: string | null | undefined): string => {
  if (input === null || input === undefined) {
    return '';
  }
  
  // Escape single quotes and other potentially dangerous characters
  return input.replace(/['";\\]/g, '');
};

/**
 * Validate a username
 * @param username The username to validate
 * @param minLength Minimum length (default: 3)
 * @returns True if the username is valid, false otherwise
 */
export const isValidUsername = (
  username: string | null | undefined,
  minLength: number = 3
): boolean => {
  if (!username) return false;
  
  const trimmed = username.trim();
  return trimmed.length >= minLength;
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html The HTML content to sanitize
 * @returns The sanitized HTML
 */
export const sanitizeHtml = (html: string | null | undefined): string => {
  if (html === null || html === undefined) {
    return '';
  }
  
  // Replace potentially dangerous HTML tags
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/on\w+="[^"]*"/gi, ''); // Remove event handlers
};
