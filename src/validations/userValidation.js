import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';
import {
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  PASSWORD_RULE,
  PASSWORD_RULE_MESSAGE,
  PHONE_RULE,
  PHONE_RULE_MESSAGE
} from '~/utils/validators';

const register = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string()
        .required()
        .pattern(EMAIL_RULE)
        .message(EMAIL_RULE_MESSAGE),
      password: Joi.string()
        .required()
        .pattern(PASSWORD_RULE)
        .message(PASSWORD_RULE_MESSAGE),
      fullName: Joi.string().trim().min(2).max(100).optional(),
      phone: Joi.string()
        .pattern(PHONE_RULE)
        .message(PHONE_RULE_MESSAGE)
        .optional()
    });

    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string()
        .required()
        .pattern(EMAIL_RULE)
        .message(EMAIL_RULE_MESSAGE),
      token: Joi.string().required()
    });

    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const login = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string()
        .required()
        .pattern(EMAIL_RULE)
        .message(EMAIL_RULE_MESSAGE),
      password: Joi.string()
        .required()
        .pattern(PASSWORD_RULE)
        .message(PASSWORD_RULE_MESSAGE)
    });

    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string()
        .required()
        .pattern(EMAIL_RULE)
        .message(EMAIL_RULE_MESSAGE)
    });

    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string()
        .required()
        .pattern(EMAIL_RULE)
        .message(EMAIL_RULE_MESSAGE),
      token: Joi.string().required(),
      newPassword: Joi.string()
        .required()
        .pattern(PASSWORD_RULE)
        .message(PASSWORD_RULE_MESSAGE)
    });

    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const changePassword = async (req, res, next) => {
  try {
    const schema = Joi.object({
      currentPassword: Joi.string()
        .required()
        .pattern(PASSWORD_RULE)
        .message(`Current password: ${PASSWORD_RULE_MESSAGE}`),
      newPassword: Joi.string()
        .required()
        .pattern(PASSWORD_RULE)
        .message(`New password: ${PASSWORD_RULE_MESSAGE}`)
    });

    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const schema = Joi.object({
      fullName: Joi.string().trim().min(2).max(100).optional(),
      phone: Joi.string()
        .pattern(PHONE_RULE)
        .message(PHONE_RULE_MESSAGE)
        .optional(),
      address: Joi.string().trim().max(500).optional()
    });

    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

export const userValidation = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile
};