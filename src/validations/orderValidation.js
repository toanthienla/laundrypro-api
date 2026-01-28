import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';
import {
  OBJECT_ID_RULE,
  OBJECT_ID_RULE_MESSAGE,
  PHONE_RULE,
  PHONE_RULE_MESSAGE
} from '~/utils/validators';

const createOrder = async (req, res, next) => {
  const schema = Joi.object({
    customerPhone: Joi.string()
      .pattern(PHONE_RULE)
      .required()
      .messages({
        'string.pattern.base': PHONE_RULE_MESSAGE,
        'any.required': 'Customer phone is required'
      }),
    customerName: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Customer name is required'
      }),
    customerAddress: Joi.string()
      .max(500)
      .allow('', null)
      .messages({
        'string.max': 'Address cannot exceed 500 characters'
      }),
    items: Joi.array()
      .items(
        Joi.object({
          serviceId: Joi.string()
            .pattern(OBJECT_ID_RULE)
            .required()
            .messages({
              'string.pattern.base': OBJECT_ID_RULE_MESSAGE,
              'any.required': 'Service ID is required'
            }),
          quantity: Joi.number()
            .integer()
            .min(1)
            .required()
            .messages({
              'number.min': 'Quantity must be at least 1',
              'any.required': 'Quantity is required'
            }),
          unitPrice: Joi.number()
            .min(0)
            .messages({
              'number.min': 'Unit price cannot be negative'
            }),
          note: Joi.string()
            .max(200)
            .allow('', null)
            .messages({
              'string.max': 'Note cannot exceed 200 characters'
            })
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one item is required',
        'any.required': 'Items are required'
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

const updateOrder = async (req, res, next) => {
  const schema = Joi.object({
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

const updateOrderStatus = async (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid('pending', 'completed')
      .required()
      .messages({
        'any.only': 'Status must be pending or completed',
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

const addOrderItem = async (req, res, next) => {
  const schema = Joi.object({
    serviceId: Joi.string()
      .pattern(OBJECT_ID_RULE)
      .required()
      .messages({
        'string.pattern.base': OBJECT_ID_RULE_MESSAGE,
        'any.required': 'Service ID is required'
      }),
    quantity: Joi.number()
      .integer()
      .min(1)
      .required()
      .messages({
        'number.min': 'Quantity must be at least 1',
        'any.required': 'Quantity is required'
      }),
    unitPrice: Joi.number()
      .min(0)
      .messages({
        'number.min': 'Unit price cannot be negative'
      }),
    note: Joi.string()
      .max(200)
      .allow('', null)
      .messages({
        'string.max': 'Note cannot exceed 200 characters'
      })
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const updateOrderItem = async (req, res, next) => {
  const schema = Joi.object({
    quantity: Joi.number()
      .integer()
      .min(1)
      .messages({
        'number.min': 'Quantity must be at least 1'
      }),
    unitPrice: Joi.number()
      .min(0)
      .messages({
        'number.min': 'Unit price cannot be negative'
      }),
    note: Joi.string()
      .max(200)
      .allow('', null)
      .messages({
        'string.max': 'Note cannot exceed 200 characters'
      })
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

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
    await schema.validateAsync(req.params, { abortEarly: false, allowUnknown: true });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const validateOrderItemIds = async (req, res, next) => {
  const schema = Joi.object({
    orderId: Joi.string()
      .pattern(OBJECT_ID_RULE)
      .required()
      .messages({
        'string.pattern.base': OBJECT_ID_RULE_MESSAGE,
        'any.required': 'Order ID is required'
      }),
    itemId: Joi.string()
      .pattern(OBJECT_ID_RULE)
      .required()
      .messages({
        'string.pattern.base': OBJECT_ID_RULE_MESSAGE,
        'any.required': 'Item ID is required'
      })
  });

  try {
    await schema.validateAsync(req.params, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const getOrdersByCustomerPhone = async (req, res, next) => {
  const schema = Joi.object({
    phone: Joi.string()
      .pattern(PHONE_RULE)
      .required()
      .messages({
        'string.pattern.base': PHONE_RULE_MESSAGE,
        'any.required': 'Phone is required'
      }),
    status: Joi.string()
      .valid('pending', 'completed')
      .messages({
        'any.only': 'Status must be pending or completed'
      }),
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

export const orderValidation = {
  createOrder,
  updateOrder,
  updateOrderStatus,
  addOrderItem,
  updateOrderItem,
  validateId,
  validateOrderId,
  validateOrderItemIds,
  getOrdersByCustomerPhone
};