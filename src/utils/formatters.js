/* eslint-disable no-useless-escape */
import { pick } from 'lodash';

/**
 * Simple method to Convert a String to Slug
 */
export const slugify = (val) => {
  if (!val) return '';
  return String(val)
    .normalize('NFKD') // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9 -]/g, '') // remove non-alphanumeric characters
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-'); // remove consecutive hyphens
};

export const pickUser = (user) => {
  if (!user) return null;
  return {
    _id: user._id,
    email: user.email,
    role: user.role,
    status: user.status,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

export const pickUserWithProfile = (user, profile) => {
  if (!user) return null;
  return {
    ...pickUser(user),
    fullName: profile?.fullName || null,
    phone: profile?.phone || null,
    address: profile?.address || null,
    avatar: profile?.avatar || null
  };
};


/**
 * Format phone number to E.164 format
 * 0901234567 → +84901234567
 * 84901234567 → +84901234567
 * +84901234567 → +84901234567
 */
export const formatPhoneE164 = (phone, defaultCountryCode = '+84') => {
  if (!phone) return null;

  // Remove spaces, dashes, parentheses
  let formatted = phone.replace(/[\s\-\(\)]/g, '');

  // Already has + prefix
  if (formatted.startsWith('+')) {
    return formatted;
  }

  // Starts with country code without +
  if (formatted.startsWith('84') && formatted.length > 10) {
    return '+' + formatted;
  }

  // Starts with 0 (local format)
  if (formatted.startsWith('0')) {
    return defaultCountryCode + formatted.slice(1);
  }

  // Just digits, add default country code
  return defaultCountryCode + formatted;
};

/**
 * Format phone for display
 * +84901234567 → 0901234567 (local)
 * +84901234567 → +84 901 234 567 (international)
 */
export const formatPhoneDisplay = (phone, format = 'local') => {
  if (!phone) return null;

  if (format === 'local' && phone.startsWith('+84')) {
    return '0' + phone.slice(3);
  }

  if (format === 'international') {
    // +84901234567 → +84 901 234 567
    const countryCode = phone.slice(0, 3);
    const rest = phone.slice(3);
    return `${countryCode} ${rest.replace(/(\d{3})(\d{3})(\d{3,4})/, '$1 $2 $3')}`;
  }

  return phone;
};