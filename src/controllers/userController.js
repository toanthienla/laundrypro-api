import { StatusCodes } from 'http-status-codes';
import { userService } from '~/services/userService';
import ApiError from '~/utils/ApiError';
import { env } from '~/config/environment';
import ms from 'ms';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.BUILD_MODE === 'production',
  sameSite: env.BUILD_MODE === 'production' ? 'None' : 'Lax',
  domain: env.BUILD_MODE === 'production' ? env.COOKIE_DOMAIN : undefined
};

// ==================== AUTH ====================

const checkLoginMethod = async (req, res, next) => {
  try {
    const result = await userService.checkLoginMethod(req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const loginWithOTP = async (req, res, next) => {
  try {
    const result = await userService.loginWithOTP(req.body);

    res.cookie('accessToken', result.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: ms(env.ACCESS_TOKEN_LIFE)
    });

    res.cookie('refreshToken', result.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: ms(env.REFRESH_TOKEN_LIFE)
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Login successful.',
      data: result.user
    });
  } catch (error) {
    next(error);
  }
};

const loginWithPassword = async (req, res, next) => {
  try {
    const result = await userService.loginWithPassword(req.body);

    res.cookie('accessToken', result.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: ms(env.ACCESS_TOKEN_LIFE)
    });

    res.cookie('refreshToken', result.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: ms(env.REFRESH_TOKEN_LIFE)
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Login successful.',
      data: result.user
    });
  } catch (error) {
    next(error);
  }
};

const setPassword = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const result = await userService.setPassword(userId, req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: result.message,
      data: { hasPassword: result.hasPassword }
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const result = await userService.changePassword(userId, req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

const removePassword = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const result = await userService.removePassword(userId, req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: result.message,
      data: { hasPassword: result.hasPassword }
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const clientRefreshToken = req.cookies?.refreshToken;

    if (!clientRefreshToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token not found.');
    }

    const result = await userService.refreshToken(clientRefreshToken);

    res.cookie('accessToken', result.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: ms(env.ACCESS_TOKEN_LIFE)
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Token refreshed successfully.'
    });
  } catch (error) {
    next(new ApiError(StatusCodes.FORBIDDEN, 'Invalid refresh token. Please login again.'));
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Logout successful.'
    });
  } catch (error) {
    next(error);
  }
};

// ==================== PROFILE ====================

const getProfile = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const result = await userService.getProfile(userId);
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const avatarFile = req.file;
    const result = await userService.updateProfile(userId, req.body, avatarFile);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Profile updated successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// ==================== CUSTOMER MANAGEMENT ====================

const findCustomerByPhone = async (req, res, next) => {
  try {
    const { phone } = req.query;
    const result = await userService.findCustomerByPhone(phone);
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getAllCustomers = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await userService.getAllCustomers({ page, limit, search });
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await userService.getCustomerById(id);
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerWithHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await userService.getCustomerWithHistory(id);
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const result = await userService.createCustomer(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Customer created successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await userService.updateCustomer(id, req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Customer updated successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// ==================== USER MANAGEMENT ====================

const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, search, role, status } = req.query;
    const result = await userService.getAllUsers({ page, limit, search, role, status });
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await userService.getUserById(id);
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const createStaff = async (req, res, next) => {
  try {
    const result = await userService.createStaff(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Staff created successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const result = await userService.updateUserRole(id, role);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'User role updated successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await userService.updateUserStatus(id, status);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'User status updated successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const userController = {
  // Auth
  checkLoginMethod,
  loginWithOTP,
  loginWithPassword,
  setPassword,
  changePassword,
  removePassword,
  refreshToken,
  logout,
  // Profile
  getProfile,
  updateProfile,
  // Customer Management
  findCustomerByPhone,
  getAllCustomers,
  getCustomerById,
  getCustomerWithHistory,
  createCustomer,
  updateCustomer,
  // User Management
  getAllUsers,
  getUserById,
  createStaff,
  updateUserRole,
  updateUserStatus,
  deleteUser
};