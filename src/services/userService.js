import { StatusCodes } from 'http-status-codes';
import { User, USER_ROLES, USER_STATUS } from '~/models/userModel';
import { Order } from '~/models/orderModel';
import { OrderItem } from '~/models/orderItemModel';
import { JwtProvider } from '~/providers/JwtProvider';
import { FirebaseProvider } from '~/providers/FirebaseProvider';
import { CloudinaryProvider } from '~/providers/CloudinaryProvider';
import ApiError from '~/utils/ApiError';
import { env } from '~/config/environment';

// ==================== HELPER ====================

const generateTokens = async (user) => {
  const userInfo = { _id: user._id, phone: user.phone, role: user.role };

  const accessToken = await JwtProvider.generateToken(
    userInfo,
    env.ACCESS_TOKEN_SECRET,
    env.ACCESS_TOKEN_LIFE
  );

  const refreshToken = await JwtProvider.generateToken(
    userInfo,
    env.REFRESH_TOKEN_SECRET,
    env.REFRESH_TOKEN_LIFE
  );

  return { accessToken, refreshToken };
};

const formatUserResponse = (user) => ({
  _id: user._id,
  phone: user.phone,
  email: user.email,
  name: user.name,
  role: user.role,
  address: user.address,
  avatar: user.avatar,
  isVerified: user.isVerified,
  hasPassword: user.hasPassword,
  status: user.status,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt
});

// ==================== AUTH ====================

/**
 * Check if user can login with password
 * Returns user info for login method selection
 */
const checkLoginMethod = async (reqBody) => {
  const { phone } = reqBody;

  if (!phone) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Phone is required.');
  }

  const user = await User.findByPhone(phone);

  // User not found - must be created by staff first
  if (!user) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Account not found. Please visit our store to create an account.'
    );
  }

  if (user.status === USER_STATUS.SUSPENDED) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Your account has been suspended.');
  }

  // Not verified - must use OTP first
  if (!user.isVerified) {
    return {
      exists: true,
      isVerified: false,
      hasPassword: false,
      loginMethod: 'otp',
      message: 'Please verify your phone with OTP first.'
    };
  }

  // Verified user
  return {
    exists: true,
    isVerified: true,
    hasPassword: user.hasPassword,
    loginMethod: user.hasPassword ? 'both' : 'otp',
    message: user.hasPassword
      ? 'You can login with password or OTP.'
      : 'Please login with OTP. You can set a password after login.'
  };
};

/**
 * Login with Firebase OTP token
 * Customer must exist (created by staff) before they can login
 */
const loginWithOTP = async (reqBody) => {
  const { idToken } = reqBody;

  if (!idToken) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Firebase ID token is required.');
  }

  // Verify token with Firebase
  const firebaseData = await FirebaseProvider.verifyIdToken(idToken);

  if (!firebaseData.phone) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Phone number not found in Firebase token.');
  }

  // Find existing user and link Firebase UID (NO CREATE)
  const user = await User.findByFirebaseAndLink({
    uid: firebaseData.uid,
    phone: firebaseData.phone,
    email: firebaseData.email
  });

  // User not found - must be created by staff first
  if (!user) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Account not found. Please visit our store to create an account.'
    );
  }

  // Check if suspended
  if (user.status === USER_STATUS.SUSPENDED) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Your account has been suspended.');
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(user);

  return {
    accessToken,
    refreshToken,
    user: formatUserResponse(user)
  };
};

/**
 * Login with phone and password
 */
const loginWithPassword = async (reqBody) => {
  const { phone, password } = reqBody;

  if (!phone || !password) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Phone and password are required.');
  }

  // Find user with password
  const user = await User.findByPhoneWithPassword(phone);

  if (!user) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Account not found. Please visit our store to create an account.'
    );
  }

  if (user.status === USER_STATUS.SUSPENDED) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Your account has been suspended.');
  }

  // Check if verified
  if (!user.isVerified) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Please verify your phone with OTP first before using password login.'
    );
  }

  // Check if has password
  if (!user.hasPassword || !user.passwordHash) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Password not set. Please login with OTP and set your password.'
    );
  }

  // Verify password
  const isValidPassword = await user.verifyPassword(password);

  if (!isValidPassword) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid phone or password.');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(user);

  return {
    accessToken,
    refreshToken,
    user: formatUserResponse(user)
  };
};

/**
 * Set password for user (after OTP login)
 */
const setPassword = async (userId, reqBody) => {
  const { password, confirmPassword } = reqBody;

  if (!password || !confirmPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password and confirm password are required.');
  }

  if (password !== confirmPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Passwords do not match.');
  }

  if (password.length < 8) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password must be at least 8 characters.');
  }

  const user = await User.findOneById(userId);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  if (!user.isVerified) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Please verify your phone with OTP first.');
  }

  await user.setPassword(password);

  return {
    message: 'Password set successfully.',
    hasPassword: true
  };
};

/**
 * Change password
 */
const changePassword = async (userId, reqBody) => {
  const { currentPassword, newPassword, confirmPassword } = reqBody;

  if (!newPassword || !confirmPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'New password and confirm password are required.');
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Passwords do not match.');
  }

  if (newPassword.length < 8) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password must be at least 8 characters.');
  }

  const user = await User.findOneByIdWithPassword(userId);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  // If user has password, verify current password
  if (user.hasPassword && user.passwordHash) {
    if (!currentPassword) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Current password is required.');
    }

    const isValidPassword = await user.verifyPassword(currentPassword);

    if (!isValidPassword) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Current password is incorrect.');
    }
  }

  await user.setPassword(newPassword);

  return {
    message: 'Password changed successfully.'
  };
};

/**
 * Remove password (switch to OTP only)
 */
const removePassword = async (userId, reqBody) => {
  const { currentPassword } = reqBody;

  const user = await User.findOneByIdWithPassword(userId);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  if (!user.hasPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No password set.');
  }

  // Verify current password
  if (!currentPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Current password is required.');
  }

  const isValidPassword = await user.verifyPassword(currentPassword);

  if (!isValidPassword) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Current password is incorrect.');
  }

  await user.removePassword();

  return {
    message: 'Password removed. You can now only login with OTP.',
    hasPassword: false
  };
};

/**
 * Refresh token
 */
const refreshToken = async (clientRefreshToken) => {
  try {
    const decoded = await JwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET);

    const user = await User.findOneById(decoded._id);

    if (!user) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'User not found.');
    }

    if (user.status === USER_STATUS.SUSPENDED) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Your account has been suspended.');
    }

    const userInfo = { _id: user._id, phone: user.phone, role: user.role };

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET,
      env.ACCESS_TOKEN_LIFE
    );

    return { accessToken };
  } catch (error) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid refresh token.');
  }
};

// ==================== PROFILE ====================

const getProfile = async (userId) => {
  const user = await User.findOneById(userId);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  return formatUserResponse(user);
};

const updateProfile = async (userId, reqBody, file) => {
  const user = await User.findOneById(userId);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  const updateData = {};

  if (reqBody.name) updateData.name = reqBody.name;
  if (reqBody.email) updateData.email = reqBody.email;
  if (reqBody.address) updateData.address = reqBody.address;

  if (file) {
    const uploaded = await CloudinaryProvider.streamUpload(file.buffer, 'avatars');
    updateData.avatar = uploaded.secure_url;
  }

  const updatedUser = await User.updateUser(userId, updateData);

  return formatUserResponse(updatedUser);
};

// ==================== CUSTOMER MANAGEMENT (Staff/Admin) ====================

const findCustomerByPhone = async (phone) => {
  const customer = await User.findByPhone(phone);

  if (!customer || customer.role !== USER_ROLES.CUSTOMER) {
    return null;
  }

  return customer;
};

const getAllCustomers = async (query = {}) => {
  const { page = 1, limit = 10, search } = query;
  const filter = { role: USER_ROLES.CUSTOMER };

  if (search) {
    filter.$or = [
      { phone: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [customers, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter)
  ]);

  return {
    customers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
};

const getCustomerById = async (customerId) => {
  const customer = await User.findOneById(customerId);

  if (!customer || customer.role !== USER_ROLES.CUSTOMER) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Customer not found.');
  }

  return customer;
};

const getCustomerWithHistory = async (customerId) => {
  const customer = await User.findOneById(customerId);

  if (!customer || customer.role !== USER_ROLES.CUSTOMER) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Customer not found.');
  }

  const orders = await Order.find({ customerId })
    .populate('createdBy', 'phone name')
    .sort({ createdAt: -1 });

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const orderItems = await OrderItem.findByOrderId(order._id);
      return { ...order.toObject(), orderItems };
    })
  );

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalSpent = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  return {
    ...customer.toObject(),
    stats: {
      totalOrders,
      completedOrders: completedOrders.length,
      totalSpent
    },
    orderHistory: ordersWithItems
  };
};

const updateCustomer = async (customerId, reqBody) => {
  const customer = await User.findOneById(customerId);

  if (!customer || customer.role !== USER_ROLES.CUSTOMER) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Customer not found.');
  }

  const updateData = {};
  if (reqBody.name) updateData.name = reqBody.name;
  if (reqBody.email) updateData.email = reqBody.email;
  if (reqBody.address) updateData.address = reqBody.address;
  if (reqBody.note) updateData.note = reqBody.note;

  const updatedCustomer = await User.updateUser(customerId, updateData);
  return updatedCustomer;
};

/**
 * Create customer (Staff/Admin only)
 */
const createCustomer = async (reqBody) => {
  const { phone, name, email, address, note } = reqBody;

  if (!phone || !name) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Phone and name are required.');
  }

  const existingUser = await User.findByPhone(phone);
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, 'Phone number already registered.');
  }

  const customer = await User.create({
    phone,
    name,
    email: email || null,
    address: address || null,
    note: note || null,
    role: USER_ROLES.CUSTOMER,
    isVerified: false
  });

  return customer;
};

// ==================== USER MANAGEMENT (Admin) ====================

const getAllUsers = async (query = {}) => {
  const { page = 1, limit = 10, search, role, status } = query;
  const filter = {};

  if (search) {
    filter.$or = [
      { phone: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (role) filter.role = role;
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter)
  ]);

  return {
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
};

const getUserById = async (userId) => {
  const user = await User.findOneById(userId);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  return user;
};

const createStaff = async (reqBody) => {
  const { phone, name, email } = reqBody;

  if (!phone || !name) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Phone and name are required.');
  }

  const existingUser = await User.findByPhone(phone);
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, 'Phone number already registered.');
  }

  const staff = await User.create({
    phone,
    name,
    email: email || null,
    role: USER_ROLES.STAFF,
    isVerified: false
  });

  return staff;
};

const updateUserRole = async (userId, role) => {
  const user = await User.findOneById(userId);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  if (!Object.values(USER_ROLES).includes(role)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid role.');
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { role } },
    { new: true }
  );

  return updatedUser;
};

const updateUserStatus = async (userId, status) => {
  const user = await User.findOneById(userId);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  if (!Object.values(USER_STATUS).includes(status)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid status.');
  }

  // Revoke Firebase tokens if suspending
  if (status === USER_STATUS.SUSPENDED && user.firebaseUid) {
    try {
      await FirebaseProvider.revokeRefreshTokens(user.firebaseUid);
    } catch (error) {
      console.error('Failed to revoke Firebase tokens:', error.message);
    }
  }

  const updatedUser = await User.updateUser(userId, { status });
  return updatedUser;
};

const deleteUser = async (userId) => {
  const user = await User.findOneById(userId);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  const orderCount = await Order.countDocuments({
    $or: [{ customerId: userId }, { createdBy: userId }]
  });

  if (orderCount > 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Cannot delete user with existing orders. Consider suspending instead.'
    );
  }

  // Delete from Firebase if exists
  if (user.firebaseUid) {
    try {
      await FirebaseProvider.deleteUser(user.firebaseUid);
    } catch (error) {
      console.error('Failed to delete Firebase user:', error.message);
    }
  }

  await User.deleteUser(userId);
};

export const userService = {
  // Auth
  checkLoginMethod,
  loginWithOTP,
  loginWithPassword,
  setPassword,
  changePassword,
  removePassword,
  refreshToken,
  // Profile
  getProfile,
  updateProfile,
  // Customer Management
  findCustomerByPhone,
  getAllCustomers,
  getCustomerById,
  getCustomerWithHistory,
  updateCustomer,
  createCustomer,
  // User Management
  getAllUsers,
  getUserById,
  createStaff,
  updateUserRole,
  updateUserStatus,
  deleteUser
};