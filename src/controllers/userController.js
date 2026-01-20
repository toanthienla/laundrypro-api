import { StatusCodes } from 'http-status-codes';
import { userService } from '~/services/userService';
import ApiError from '~/utils/ApiError';
import env from '~/config/environment';
import ms from 'ms';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.BUILD_MODE === 'production',
  sameSite: env.BUILD_MODE === 'production' ? 'None' : 'Lax',
  domain: env.BUILD_MODE === 'production' ? env.COOKIE_DOMAIN : undefined
};

const register = async (req, res, next) => {
  try {
    const result = await userService.register(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Registration successful.  Please check your email to verify your account.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const result = await userService.verifyEmail(req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Email verified successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);

    // Set HTTP-only cookies
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
    next(new ApiError(StatusCodes.FORBIDDEN, 'Invalid refresh token.  Please login again.'));
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    await userService.forgotPassword(req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Password reset email sent.  Please check your inbox.'
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    await userService.resetPassword(req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Password reset successful.  You can now login with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    await userService.changePassword(userId, req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

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

const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, role, status, search } = req.query;
    const result = await userService.getAllUsers({ page, limit, role, status, search });
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
  register,
  verifyEmail,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser
};