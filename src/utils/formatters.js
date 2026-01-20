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