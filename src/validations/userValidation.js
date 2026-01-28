import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';
import {
  OBJECT_ID_RULE,
  OBJECT_ID_RULE_MESSAGE,
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  PHONE_RULE,
  PHONE_RULE_MESSAGE,
  PASSWORD_RULE,
  PASSWORD_RULE_MESSAGE
} from '~/utils/validators';

// ==================== AUTH ====================

const checkLoginMethod = async (req, res, next) => {
  const schema = Joi.object({
    phone: Joi.string()
      .pattern(PHONE_RULE)
      .required()
      .messages({
        'string.pattern.base': PHONE_RULE_MESSAGE,
        'any.required': 'Phone is required'
      })
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const loginWithOTP = async (req, res, next) => {
  const schema = Joi.object({
    idToken: Joi.string()
      .required()
      .messages({
        'any.required': 'Firebase ID token is required'
      })
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const loginWithPassword = async (req, res, next) => {
  const schema = Joi.object({
    phone: Joi.string()
      .pattern(PHONE_RULE)
      .required()
      .messages({
        'string.pattern.base': PHONE_RULE_MESSAGE,
        'any.required': 'Phone is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const setPassword = async (req, res, next) => {
  const schema = Joi.object({
    password: Joi.string()
      .pattern(PASSWORD_RULE)
      .required()
      .messages({
        'string.pattern.base': PASSWORD_RULE_MESSAGE,
        'any.required': 'Password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Confirm password is required'
      })
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const changePassword = async (req, res, next) => {
  const schema = Joi.object({
    currentPassword: Joi.string()
      .allow('', null),
    newPassword: Joi.string()
      .pattern(PASSWORD_RULE)
      .required()
      .messages({
        'string.pattern.base': PASSWORD_RULE_MESSAGE,
        'any.required': 'New password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Confirm password is required'
      })
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const removePassword = async (req, res, next) => {
  const schema = Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      })
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

// ==================== PROFILE ====================

const updateProfile = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 100 characters'
      }),
    email: Joi.string()
      .pattern(EMAIL_RULE)
      .allow('', null)
      .messages({
        'string.pattern.base': EMAIL_RULE_MESSAGE
      }),
    address: Joi.string()
      .max(500)
      .allow('', null)
      .messages({
        'string.max': 'Address cannot exceed 500 characters'
      })
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

// ==================== CUSTOMER MANAGEMENT ====================

const findCustomerByPhone = async (req, res, next) => {
  const schema = Joi.object({
    phone: Joi.string()
      .pattern(PHONE_RULE)
      .required()
      .messages({
        'string.pattern.base': PHONE_RULE_MESSAGE,
        'any.required': 'Phone is required'
      })
  });

  try {
    await schema.validateAsync(req.query, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const createCustomer = async (req, res, next) => {
  const schema = Joi.object({
    phone: Joi.string()
      .pattern(PHONE_RULE)
      .required()
      .messages({
        'string.pattern.base': PHONE_RULE_MESSAGE,
        'any.required': 'Phone is required'
      }),
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Name is required'
      }),
    email: Joi.string()
      .pattern(EMAIL_RULE)
      .allow('', null)
      .messages({
        'string.pattern.base': EMAIL_RULE_MESSAGE
      }),
    address: Joi.string()
      .max(500)
      .allow('', null)
      .messages({
        'string.max': 'Address cannot exceed 500 characters'
      }),
    note: Joi.string()
      .max(500)
      .allow('', null)
      .messages({
        'string.max': 'Note cannot exceed 500 characters'
      })
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const updateCustomer = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 100 characters'
      }),
    email: Joi.string()
      .pattern(EMAIL_RULE)
      .allow('', null)
      .messages({
        'string.pattern.base': EMAIL_RULE_MESSAGE
      }),
    address: Joi.string()
      .max(500)
      .allow('', null)
      .messages({
        'string.max': 'Address cannot exceed 500 characters'
      }),
    note: Joi.string()
      .max(500)
      .allow('', null)
      .messages({
        'string.max': 'Note cannot exceed 500 characters'
      })
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

// ==================== USER MANAGEMENT ====================

const createStaff = async (req, res, next) => {
  const schema = Joi.object({
    phone: Joi.string()
      .pattern(PHONE_RULE)
      .required()
      .messages({
        'string.pattern.base': PHONE_RULE_MESSAGE,
        'any.required': 'Phone is required'
      }),
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Name is required'
      }),
    email: Joi.string()
      .pattern(EMAIL_RULE)
      .allow('', null)
      .messages({
        'string.pattern.base': EMAIL_RULE_MESSAGE
      })
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const updateUserRole = async (req, res, next) => {
  const schema = Joi.object({
    role: Joi.string()
      .valid('customer', 'staff', 'admin')
      .required()
      .messages({
        'any.only': 'Role must be customer, staff, or admin',
        'any.required': 'Role is required'
      })
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const updateUserStatus = async (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid('active', 'suspended')
      .required()
      .messages({
        'any.only': 'Status must be active or suspended',
        'any.required': 'Status is required'
      })
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

// ==================== COMMON ====================

const validateId = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string()
      .pattern(OBJECT_ID_RULE)
      .required()
      .messages({
        'string.pattern.base': OBJECT_ID_RULE_MESSAGE,
        'any.required': 'ID is required'
      })
  });

  try {
    await schema.validateAsync(req.params, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

export const userValidation = {
  checkLoginMethod,
  loginWithOTP,
  loginWithPassword,
  setPassword,
  changePassword,
  removePassword,
  updateProfile,
  findCustomerByPhone,
  createCustomer,
  updateCustomer,
  createStaff,
  updateUserRole,
  updateUserStatus,
  validateId
};