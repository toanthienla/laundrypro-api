export const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/;
export const OBJECT_ID_RULE_MESSAGE = 'Your string fails to match the Object Id pattern!';

export const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const EMAIL_RULE_MESSAGE = 'Please provide a valid email address. ';
export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
export const PASSWORD_RULE_MESSAGE =
  'Password must be at least 8 characters and include letters and numbers.';
export const PHONE_RULE = /^(\+? 84|0)(3|5|7|8|9)[0-9]{8}$/;
export const PHONE_RULE_MESSAGE = 'Please provide a valid Vietnamese phone number.';

// Validate file
export const LIMIT_COMMON_FILE_SIZE = 10485760; // byte = 10 MB
export const ALLOW_COMMON_FILE_TYPES = ['image/jpg', 'image/jpeg', 'image/png'];