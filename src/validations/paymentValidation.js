import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';
import { PAYMENT_METHOD, PAYMENT_STATUS } from '~/models/paymentModel';

const createPayment = async (req, res, next) => {
  const schema = Joi.object({
    orderId: Joi.string()
      .pattern(OBJECT_ID_RULE)
      .required()
      .messages({
        'string.pattern.base': OBJECT_ID_RULE_MESSAGE,
        'any.required': 'Order ID is required'
      }),
    method: Joi.string()
      .valid(...Object.values(PAYMENT_METHOD))
      .required()
      .messages({
        'any.only': 'Invalid payment method',
        'any.required': 'Payment method is required'
      }),
    amount: Joi.number()
      .positive()
      .required()
      .messages({
        'number.positive': 'Amount must be greater than 0',
        'any.required': 'Amount is required'
      }),
    transactionRef: Joi.string()
      .max(100)
      .allow('', null)
      .messages({
        'string.max': 'Transaction reference cannot exceed 100 characters'
      }),
    markAsPaid: Joi.boolean().default(false) // For cash payments
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const updatePaymentStatus = async (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid(...Object.values(PAYMENT_STATUS))
      .required()
      .messages({
        'any.only': `Status must be one of: ${Object.values(PAYMENT_STATUS).join(', ')}`,
        'any.required': 'Status is required'
      }),
    transactionRef: Joi.string()
      .max(100)
      .allow('', null)
      .messages({
        'string.max': 'Transaction reference cannot exceed 100 characters'
      })
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const updatePaymentMethod = async (req, res, next) => {
  const schema = Joi.object({
    method: Joi.string()
      .valid(...Object.values(PAYMENT_METHOD))
      .required()
      .messages({
        'any.only': `Method must be one of: ${Object.values(PAYMENT_METHOD).join(', ')}`,
        'any.required': 'Payment method is required'
      })
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const validatePaymentId = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string()
      .pattern(OBJECT_ID_RULE)
      .required()
      .messages({
        'string.pattern.base': OBJECT_ID_RULE_MESSAGE,
        'any.required': 'Payment ID is required'
      })
  });

  try {
    await schema.validateAsync(req.params, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const validateOrderId = async (req, res, next) => {
  const schema = Joi.object({
    orderId: Joi.string()
      .pattern(OBJECT_ID_RULE)
      .required()
      .messages({
        'string.pattern.base': OBJECT_ID_RULE_MESSAGE,
        'any.required': 'Order ID is required'
      })
  });

  try {
    await schema.validateAsync(req.params, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const getAllPayments = async (req, res, next) => {
  const schema = Joi.object({
    orderId: Joi.string().pattern(OBJECT_ID_RULE),
    status: Joi.string().valid(...Object.values(PAYMENT_STATUS)),
    method: Joi.string().valid(...Object.values(PAYMENT_METHOD)),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100)
  });

  try {
    await schema.validateAsync(req.query, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

// For webhook endpoints - less strict validation
const webhook = async (req, res, next) => {
  const schema = Joi.object({
    transactionRef: Joi.string().required(),
    status: Joi.string().valid('success', 'failed').required()
  }).unknown(true); // Allow additional gateway-specific fields

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

export const paymentValidation = {
  createPayment,
  updatePaymentStatus,
  updatePaymentMethod,
  validatePaymentId,
  validateOrderId,
  getAllPayments,
  webhook
};