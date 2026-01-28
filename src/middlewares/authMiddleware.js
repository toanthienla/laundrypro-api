import { StatusCodes } from 'http-status-codes';
import { JwtProvider } from '~/providers/JwtProvider';
import { env } from '~/config/environment';
import ApiError from '~/utils/ApiError';

const isAuthorized = async (req, res, next) => {
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized. Please login.'));
  }

  try {
    const decoded = await JwtProvider.verifyToken(accessToken, env.ACCESS_TOKEN_SECRET);
    req.jwtDecoded = decoded;
    next();
  } catch (error) {
    // Token expired or invalid
    if (error.message?.includes('expired')) {
      return next(new ApiError(StatusCodes.GONE, 'Token expired. Please refresh.'));
    }
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized. Please login.'));
  }
};

const isAdmin = async (req, res, next) => {
  if (req.jwtDecoded?.role !== 'admin') {
    return next(new ApiError(StatusCodes.FORBIDDEN, 'Admin access required.'));
  }
  next();
};

const isStaffOrAdmin = async (req, res, next) => {
  const role = req.jwtDecoded?.role;
  if (role !== 'staff' && role !== 'admin') {
    return next(new ApiError(StatusCodes.FORBIDDEN, 'Staff or Admin access required.'));
  }
  next();
};

const isCustomer = async (req, res, next) => {
  if (req.jwtDecoded?.role !== 'customer') {
    return next(new ApiError(StatusCodes.FORBIDDEN, 'Customer access required.'));
  }
  next();
};

export const authMiddleware = {
  isAuthorized,
  isAdmin,
  isStaffOrAdmin,
  isCustomer
};