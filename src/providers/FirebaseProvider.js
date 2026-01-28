import admin from 'firebase-admin';
import { env } from '~/config/environment';

const initializeFirebase = () => {
  // Check if already initialized
  if (admin.apps.length > 0) {
    return admin.app();
  }

  try {
    // Validate required environment variables
    if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
      throw new Error('Missing Firebase environment variables. Please check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
    }

    // Create service account object from environment variables
    const serviceAccount = {
      type: 'service_account',
      project_id: env.FIREBASE_PROJECT_ID,
      private_key: env.FIREBASE_PRIVATE_KEY,
      client_email: env.FIREBASE_CLIENT_EMAIL
    };

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log('Firebase Admin SDK initialized successfully');
    return admin.app();
  } catch (error) {
    console.error('Failed to initialize Firebase:', error.message);
    throw error;
  }
};

// Initialize on import
initializeFirebase();

/**
 * Verify Firebase ID Token
 * @param {string} idToken - Firebase ID token from frontend
 * @returns {Promise<object>} - Decoded token with user info
 */
const verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    return {
      success: true,
      uid: decodedToken.uid,
      phone: decodedToken.phone_number || null,
      email: decodedToken.email || null,
      name: decodedToken.name || null,
      picture: decodedToken.picture || null
    };
  } catch (error) {
    console.error('Firebase token verification failed:', error.message);

    if (error.code === 'auth/id-token-expired') {
      throw new Error('Token expired. Please login again.');
    }
    if (error.code === 'auth/argument-error') {
      throw new Error('Invalid token format.');
    }

    throw new Error('Invalid or expired token.');
  }
};

/**
 * Get Firebase user by UID
 * @param {string} uid - Firebase UID
 * @returns {Promise<object>} - Firebase user record
 */
const getUser = async (uid) => {
  try {
    const userRecord = await admin.auth().getUser(uid);

    return {
      uid: userRecord.uid,
      phone: userRecord.phoneNumber || null,
      email: userRecord.email || null,
      displayName: userRecord.displayName || null,
      photoURL: userRecord.photoURL || null,
      disabled: userRecord.disabled
    };
  } catch (error) {
    console.error('Failed to get Firebase user:', error.message);

    if (error.code === 'auth/user-not-found') {
      throw new Error('User not found.');
    }

    throw new Error('Failed to get user.');
  }
};

/**
 * Get Firebase user by phone number
 * @param {string} phone - Phone number (E.164 format: +84901234567)
 * @returns {Promise<object|null>} - Firebase user record or null
 */
const getUserByPhone = async (phone) => {
  try {
    // Format phone to E.164 if needed
    let formattedPhone = phone;
    if (phone.startsWith('0')) {
      formattedPhone = '+84' + phone.slice(1);
    } else if (!phone.startsWith('+')) {
      formattedPhone = '+84' + phone;
    }

    const userRecord = await admin.auth().getUserByPhoneNumber(formattedPhone);

    return {
      uid: userRecord.uid,
      phone: userRecord.phoneNumber || null,
      email: userRecord.email || null,
      displayName: userRecord.displayName || null,
      photoURL: userRecord.photoURL || null
    };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }

    console.error('Failed to get Firebase user by phone:', error.message);
    throw new Error('Failed to get user.');
  }
};

/**
 * Delete Firebase user
 * @param {string} uid - Firebase UID
 * @returns {Promise<object>}
 */
const deleteUser = async (uid) => {
  try {
    await admin.auth().deleteUser(uid);
    console.log(`Firebase user deleted: ${uid}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete Firebase user:', error.message);

    if (error.code === 'auth/user-not-found') {
      return { success: true, message: 'User already deleted' };
    }

    throw new Error('Failed to delete user.');
  }
};

/**
 * Update Firebase user
 * @param {string} uid - Firebase UID
 * @param {object} data - Update data
 * @returns {Promise<object>}
 */
const updateUser = async (uid, data) => {
  try {
    const updateData = {};

    if (data.displayName) updateData.displayName = data.displayName;
    if (data.email) updateData.email = data.email;
    if (data.photoURL) updateData.photoURL = data.photoURL;
    if (data.disabled !== undefined) updateData.disabled = data.disabled;

    const userRecord = await admin.auth().updateUser(uid, updateData);

    return {
      uid: userRecord.uid,
      phone: userRecord.phoneNumber || null,
      email: userRecord.email || null,
      displayName: userRecord.displayName || null
    };
  } catch (error) {
    console.error('Failed to update Firebase user:', error.message);
    throw new Error('Failed to update user.');
  }
};

/**
 * Revoke refresh tokens for user (force logout from all devices)
 * @param {string} uid - Firebase UID
 * @returns {Promise<object>}
 */
const revokeRefreshTokens = async (uid) => {
  try {
    await admin.auth().revokeRefreshTokens(uid);
    console.log(`Refresh tokens revoked for user: ${uid}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to revoke tokens:', error.message);
    throw new Error('Failed to revoke tokens.');
  }
};

export const FirebaseProvider = {
  verifyIdToken,
  getUser,
  getUserByPhone,
  deleteUser,
  updateUser,
  revokeRefreshTokens,
  admin
};