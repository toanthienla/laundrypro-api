import { StatusCodes } from 'http-status-codes';
import { JwtProvider } from '~/providers/JwtProvider';
import ApiError from '~/utils/ApiError';
import env from '~/config/environment';
import { USER_ROLES } from '~/models/userModel';

const isAuthorized = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Access token not found.');
    }

    const decoded = await JwtProvider.verifyToken(accessToken, env.ACCESS_TOKEN_SECRET);
    req.jwtDecoded = decoded;
    next();
  } catch (error) {
    if (error.message?.includes('expired')) {
      return next(new ApiError(StatusCodes.GONE, 'Access token expired.'));
    }
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Please login to continue.'));
  }
};

const isAdmin = async (req, res, next) => {
  if (req.jwtDecoded?.role !== USER_ROLES.ADMIN) {
    return next(new ApiError(StatusCodes.FORBIDDEN, 'Admin access required. '));
  }
  next();
};

const isStaff = async (req, res, next) => {
  const allowedRoles = [USER_ROLES.ADMIN, USER_ROLES.STAFF];
  if (!allowedRoles.includes(req.jwtDecoded?.role)) {
    return next(new ApiError(StatusCodes.FORBIDDEN, 'Staff access required.'));
  }
  next();
};

export const authMiddleware = {
  isAuthorized,
  isAdmin,
  isStaff
};