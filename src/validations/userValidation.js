import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE, PHONE_RULE, PHONE_RULE_MESSAGE } from '~/utils/validators';

const checkLoginMethod = async (req, res, next) => {
  const condition = Joi.object({
    phone: Joi.string().required().pattern(PHONE_RULE).message(PHONE_RULE_MESSAGE).trim().strict()
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

const loginWithOTP = async (req, res, next) => {
  const condition = Joi.object({
    idToken: Joi.string().required().trim().strict()
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

const loginWithPassword = async (req, res, next) => {
  const condition = Joi.object({
    phone: Joi.string().required().pattern(PHONE_RULE).message(PHONE_RULE_MESSAGE).trim().strict(),
    password: Joi.string().required().trim().strict().messages({
      'any.required': 'Password is required.'
    })
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

const setPassword = async (req, res, next) => {
  const condition = Joi.object({
    password: Joi.string().required().pattern(PASSWORD_RULE).messages({
      'string.pattern.base': PASSWORD_RULE_MESSAGE,
      'any.required': 'Password is required.'
    }),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
      'any.only': 'Passwords do not match.',
      'any.required': 'Confirm password is required.'
    })
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

const resetPasswordWithOTP = async (req, res, next) => {
  const condition = Joi.object({
    idToken: Joi.string().required().trim().strict(),
    newPassword: Joi.string().required().pattern(PASSWORD_RULE).messages({
      'string.pattern.base': PASSWORD_RULE_MESSAGE,
      'any.required': 'New password is required.'
    })
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

const changePassword = async (req, res, next) => {
  const condition = Joi.object({
    currentPassword: Joi.string().required().trim().strict().messages({
      'any.required': 'Current password is required.'
    }),
    newPassword: Joi.string().required().pattern(PASSWORD_RULE).messages({
      'string.pattern.base': PASSWORD_RULE_MESSAGE,
      'any.required': 'New password is required.'
    }),
    confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')).messages({
      'any.only': 'Passwords do not match.',
      'any.required': 'Confirm password is required.'
    })
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

const removePassword = async (req, res, next) => {
  const condition = Joi.object({
    currentPassword: Joi.string().required().trim().strict().messages({
      'any.required': 'Current password is required.'
    })
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

const updateProfile = async (req, res, next) => {
  const condition = Joi.object({
    name: Joi.string().min(3).max(50).optional().trim().strict(),
    email: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE).optional().allow(null, ''),
    address: Joi.string().optional().trim().strict().allow(null, '')
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

const createCustomer = async (req, res, next) => {
  const condition = Joi.object({
    phone: Joi.string().required().pattern(PHONE_RULE).messages({
      'string.pattern.base': PHONE_RULE_MESSAGE,
      'any.required': 'Phone number is required.'
    }),
    name: Joi.string().required().min(3).max(50).trim().strict(),
    email: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE).optional().allow(null, ''),
    address: Joi.string().optional().trim().strict().allow(null, ''),
    note: Joi.string().optional().trim().strict().allow(null, '')
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

const updateCustomer = async (req, res, next) => {
  const condition = Joi.object({
    name: Joi.string().optional().min(3).max(50).trim().strict(),
    email: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE).optional().allow(null, ''),
    address: Joi.string().optional().trim().strict().allow(null, ''),
    note: Joi.string().optional().trim().strict().allow(null, '')
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

const createStaff = async (req, res, next) => {
  const condition = Joi.object({
    phone: Joi.string().required().pattern(PHONE_RULE).messages({
      'string.pattern.base': PHONE_RULE_MESSAGE,
      'any.required': 'Phone number is required.'
    }),
    name: Joi.string().required().min(3).max(50).trim().strict(),
    email: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE).optional().allow(null, '')
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

const updateStaff = async (req, res, next) => {
  const condition = Joi.object({
    name: Joi.string().optional().min(3).max(50).trim().strict(),
    phone: Joi.string().optional().pattern(PHONE_RULE).messages({
      'string.pattern.base': PHONE_RULE_MESSAGE
    }),
    email: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE).optional().allow(null, '')
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

const updateUserRole = async (req, res, next) => {
  const condition = Joi.object({
    role: Joi.string().valid('customer', 'staff', 'admin').required()
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

const updateUserStatus = async (req, res, next) => {
  const condition = Joi.object({
    status: Joi.string().valid('active', 'suspended').required()
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

export const userValidation = {
  checkLoginMethod,
  loginWithOTP,
  loginWithPassword,
  setPassword,
  resetPasswordWithOTP,
  changePassword,
  removePassword,
  updateProfile,
  createCustomer,
  updateCustomer,
  createStaff,
  updateStaff,
  updateUserRole,
  updateUserStatus
};
