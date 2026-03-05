import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE, PHONE_RULE, PHONE_RULE_MESSAGE } from '~/utils/validators';

const createOrder = async (req, res, next) => {
  const condition = Joi.object({
    customerPhone: Joi.string().required().pattern(PHONE_RULE).message(PHONE_RULE_MESSAGE),
    customerName: Joi.string().required().min(3).max(50).trim().strict(),
    customerAddress: Joi.string().optional().trim().strict().allow(null, ''),
    items: Joi.array().items(
      Joi.object({
        serviceId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
        quantity: Joi.number().min(1).required(),
        unitPrice: Joi.number().min(0).optional(),
        note: Joi.string().optional().trim().strict().allow(null, '')
      })
    ).min(1).required(),
    note: Joi.string().optional().trim().strict().allow(null, '')
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

const updateOrder = async (req, res, next) => {
  const condition = Joi.object({
    note: Joi.string().optional().trim().strict().allow(null, '')
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

const updateOrderStatus = async (req, res, next) => {
  const condition = Joi.object({
    status: Joi.string().valid('pending', 'processing', 'completed', 'cancelled').required()
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

const addOrderItem = async (req, res, next) => {
  const condition = Joi.object({
    serviceId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
    quantity: Joi.number().min(1).required(),
    unitPrice: Joi.number().min(0).optional(),
    note: Joi.string().optional().trim().strict().allow(null, '')
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

const updateOrderItem = async (req, res, next) => {
  const condition = Joi.object({
    quantity: Joi.number().min(1).optional(),
    unitPrice: Joi.number().min(0).optional(),
    note: Joi.string().optional().trim().strict().allow(null, '')
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

export const orderValidation = {
  createOrder,
  updateOrder,
  updateOrderStatus,
  addOrderItem,
  updateOrderItem
};
